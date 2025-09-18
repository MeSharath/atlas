import axios from 'axios';
import * as functions from 'firebase-functions';
import { 
  Itinerary, 
  Activity, 
  Location, 
  GooglePlacesResponse 
} from '../types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const DIRECTIONS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/directions';

/**
 * Enriches itinerary with Google Maps data
 */
export const enrichWithMapsData = async (itinerary: Partial<Itinerary>): Promise<Partial<Itinerary>> => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!itinerary.days) {
      return itinerary;
    }

    functions.logger.info('Enriching itinerary with Maps data');

    // Process each day
    const enrichedDays = await Promise.all(
      itinerary.days.map(async (day) => {
        // Enrich each activity with location data
        const enrichedActivities = await Promise.all(
          day.activities.map(async (activity) => {
            const enrichedLocation = await enrichLocationData(
              activity.location,
              itinerary.destination!
            );
            
            return {
              ...activity,
              location: enrichedLocation
            };
          })
        );

        // Calculate travel times between activities
        const activitiesWithTravelTime = await calculateTravelTimes(enrichedActivities);

        // Calculate total travel time for the day
        const totalTravelTime = activitiesWithTravelTime.reduce(
          (total, activity) => total + (activity.travelTimeToNext || 0),
          0
        );

        return {
          ...day,
          activities: activitiesWithTravelTime,
          totalTravelTime
        };
      })
    );

    functions.logger.info('Successfully enriched itinerary with Maps data');

    return {
      ...itinerary,
      days: enrichedDays
    };

  } catch (error) {
    functions.logger.error('Error enriching with Maps data:', error);
    // Return original itinerary if Maps enrichment fails
    return itinerary;
  }
};

/**
 * Enriches location data using Google Places API
 */
async function enrichLocationData(
  location: Location,
  destination: any
): Promise<Location> {
  try {
    // Search for the place
    const searchQuery = `${location.name} ${destination.city}`;
    const searchResponse = await axios.get(`${PLACES_API_BASE_URL}/textsearch/json`, {
      params: {
        query: searchQuery,
        key: GOOGLE_MAPS_API_KEY,
        fields: 'place_id,name,formatted_address,geometry,rating,price_level,opening_hours,photos'
      }
    });

    const searchData: GooglePlacesResponse = searchResponse.data;

    if (searchData.results && searchData.results.length > 0) {
      const place = searchData.results[0];
      
      // Get detailed information
      const detailsResponse = await axios.get(`${PLACES_API_BASE_URL}/details/json`, {
        params: {
          place_id: place.place_id,
          key: GOOGLE_MAPS_API_KEY,
          fields: 'name,formatted_address,geometry,rating,price_level,opening_hours,photos,international_phone_number'
        }
      });

      const details = detailsResponse.data.result;

      return {
        name: details.name || location.name,
        address: details.formatted_address || location.address,
        coordinates: {
          lat: details.geometry?.location?.lat || location.coordinates.lat,
          lng: details.geometry?.location?.lng || location.coordinates.lng
        },
        placeId: place.place_id,
        rating: details.rating,
        openingHours: details.opening_hours?.weekday_text || [],
        photos: details.photos?.slice(0, 3).map((photo: any) => 
          `${PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        ) || []
      };
    }

    // If no results found, try to geocode the location
    const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: `${location.name}, ${destination.city}, ${destination.country}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    const geocodeData = geocodeResponse.data;
    if (geocodeData.results && geocodeData.results.length > 0) {
      const result = geocodeData.results[0];
      return {
        ...location,
        address: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      };
    }

    return location;

  } catch (error) {
    functions.logger.warn(`Failed to enrich location data for ${location.name}:`, error);
    return location;
  }
}

/**
 * Calculates travel times between activities
 */
async function calculateTravelTimes(activities: Activity[]): Promise<(Activity & { travelTimeToNext?: number })[]> {
  if (activities.length < 2) {
    return activities;
  }

  const enrichedActivities: (Activity & { travelTimeToNext?: number })[] = [];

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    let travelTimeToNext = 0;

    if (i < activities.length - 1) {
      const nextActivity = activities[i + 1];
      travelTimeToNext = await calculateTravelTime(
        activity.location.coordinates,
        nextActivity.location.coordinates
      );
    }

    enrichedActivities.push({
      ...activity,
      travelTimeToNext
    });
  }

  return enrichedActivities;
}

/**
 * Calculates travel time between two coordinates
 */
async function calculateTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  try {
    const response = await axios.get(`${DIRECTIONS_API_BASE_URL}/json`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'walking', // Default to walking for solo travelers
        key: GOOGLE_MAPS_API_KEY
      }
    });

    const data = response.data;
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      if (route.legs && route.legs.length > 0) {
        return Math.round(route.legs[0].duration.value / 60); // Convert seconds to minutes
      }
    }

    // Fallback: estimate based on distance (assuming 5 km/h walking speed)
    const distance = calculateDistance(origin, destination);
    return Math.round((distance / 5) * 60); // minutes

  } catch (error) {
    functions.logger.warn('Failed to calculate travel time:', error);
    
    // Fallback calculation
    const distance = calculateDistance(origin, destination);
    return Math.round((distance / 5) * 60); // Assume 5 km/h walking speed
  }
}

/**
 * Calculates distance between two coordinates using Haversine formula
 */
function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Gets optimized route for activities in a day
 */
export const optimizeRoute = async (activities: Activity[]): Promise<Activity[]> => {
  if (activities.length <= 2) {
    return activities;
  }

  try {
    // Use Google's route optimization
    const waypoints = activities.slice(1, -1).map(activity => 
      `${activity.location.coordinates.lat},${activity.location.coordinates.lng}`
    ).join('|');

    const response = await axios.get(`${DIRECTIONS_API_BASE_URL}/json`, {
      params: {
        origin: `${activities[0].location.coordinates.lat},${activities[0].location.coordinates.lng}`,
        destination: `${activities[activities.length - 1].location.coordinates.lat},${activities[activities.length - 1].location.coordinates.lng}`,
        waypoints: `optimize:true|${waypoints}`,
        mode: 'walking',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    const data = response.data;
    if (data.routes && data.routes.length > 0 && data.routes[0].waypoint_order) {
      const order = data.routes[0].waypoint_order;
      const optimizedActivities = [activities[0]]; // Start with first activity
      
      // Add waypoints in optimized order
      order.forEach((index: number) => {
        optimizedActivities.push(activities[index + 1]);
      });
      
      // Add last activity
      optimizedActivities.push(activities[activities.length - 1]);
      
      return optimizedActivities;
    }

    return activities;

  } catch (error) {
    functions.logger.warn('Failed to optimize route:', error);
    return activities;
  }
};
