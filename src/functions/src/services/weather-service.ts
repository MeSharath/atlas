import axios from 'axios';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { 
  Itinerary, 
  WeatherInfo, 
  Activity, 
  WeatherResponse 
} from '../types';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.weatherapi.com/v1';

/**
 * Gets weather data for a location and date
 */
export const getWeatherData = async (
  city: string,
  country: string,
  date: string
): Promise<WeatherInfo | null> => {
  try {
    if (!WEATHER_API_KEY) {
      functions.logger.warn('Weather API key not configured');
      return null;
    }

    // Check cache first
    const cacheKey = `${city.toLowerCase()}_${date}`;
    const cachedWeather = await getCachedWeather(cacheKey);
    
    if (cachedWeather && cachedWeather.expiresAt.toDate() > new Date()) {
      return cachedWeather.weather;
    }

    // Fetch from API
    const location = `${city}, ${country}`;
    const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        dt: date,
        aqi: 'no'
      }
    });

    const data: WeatherResponse = response.data;
    const weatherInfo = parseWeatherResponse(data);

    // Cache the result
    await cacheWeatherData(cacheKey, city, date, weatherInfo);

    return weatherInfo;

  } catch (error) {
    functions.logger.error(`Error fetching weather data for ${city}:`, error);
    return null;
  }
};

/**
 * Updates itinerary based on weather conditions
 */
export const updateItineraryForWeather = async (
  itinerary: Partial<Itinerary>
): Promise<Partial<Itinerary>> => {
  try {
    if (!itinerary.days || !itinerary.destination) {
      return itinerary;
    }

    let weatherAdaptations = itinerary.metadata?.weatherAdaptations || 0;
    const updatedDays = await Promise.all(
      itinerary.days.map(async (day) => {
        const dateStr = day.date.toDate().toISOString().split('T')[0];
        const weather = await getWeatherData(
          itinerary.destination!.city,
          itinerary.destination!.country,
          dateStr
        );

        if (!weather) {
          return { ...day, weatherForecast: undefined };
        }

        // Check if weather adaptations are needed
        const adaptedActivities = await adaptActivitiesForWeather(
          day.activities,
          weather
        );

        // Count adaptations
        const adaptationsMade = adaptedActivities.filter(
          (activity, index) => activity.id !== day.activities[index]?.id
        ).length;

        weatherAdaptations += adaptationsMade;

        return {
          ...day,
          activities: adaptedActivities,
          weatherForecast: weather
        };
      })
    );

    return {
      ...itinerary,
      days: updatedDays,
      metadata: {
        ...itinerary.metadata!,
        weatherAdaptations
      }
    };

  } catch (error) {
    functions.logger.error('Error updating itinerary for weather:', error);
    return itinerary;
  }
};

/**
 * Adapts activities based on weather conditions
 */
async function adaptActivitiesForWeather(
  activities: Activity[],
  weather: WeatherInfo
): Promise<Activity[]> {
  const isRainy = weather.precipitation.probability > 70;
  const isVeryHot = weather.temperature.max > 35; // Celsius
  const isVeryCold = weather.temperature.max < 5; // Celsius
  const isWindy = weather.wind.speed > 25; // km/h

  const adaptedActivities: Activity[] = [];

  for (const activity of activities) {
    let adaptedActivity = activity;

    // Check if activity needs weather adaptation
    if (activity.weatherDependent) {
      if (isRainy && isOutdoorActivity(activity)) {
        // Find indoor alternative
        const alternative = await findIndoorAlternative(activity);
        if (alternative) {
          adaptedActivity = {
            ...alternative,
            id: activity.id, // Keep original ID for tracking
            timing: activity.timing, // Keep original timing
            originalActivity: activity // Store original for reference
          };
        }
      } else if ((isVeryHot || isVeryCold) && isOutdoorActivity(activity)) {
        // Suggest time adjustment or indoor alternative
        if (isVeryHot) {
          // Move outdoor activities to early morning or evening
          adaptedActivity = adjustTimingForHeat(activity);
        } else if (isVeryCold) {
          // Find indoor alternative or suggest warmer timing
          const alternative = await findIndoorAlternative(activity);
          if (alternative) {
            adaptedActivity = {
              ...alternative,
              id: activity.id,
              timing: activity.timing,
              originalActivity: activity
            };
          }
        }
      } else if (isWindy && isWindSensitiveActivity(activity)) {
        // Find sheltered alternative
        const alternative = await findShelteredAlternative(activity);
        if (alternative) {
          adaptedActivity = {
            ...alternative,
            id: activity.id,
            timing: activity.timing,
            originalActivity: activity
          };
        }
      }
    }

    adaptedActivities.push(adaptedActivity);
  }

  return adaptedActivities;
}

/**
 * Checks if an activity is outdoor
 */
function isOutdoorActivity(activity: Activity): boolean {
  const outdoorCategories = ['park', 'garden', 'beach', 'hiking', 'walking-tour', 'market'];
  const outdoorKeywords = ['outdoor', 'park', 'garden', 'beach', 'walk', 'hike', 'market', 'street'];
  
  return outdoorCategories.includes(activity.category) ||
         outdoorKeywords.some(keyword => 
           activity.name.toLowerCase().includes(keyword) ||
           activity.description.toLowerCase().includes(keyword)
         );
}

/**
 * Checks if an activity is sensitive to wind
 */
function isWindSensitiveActivity(activity: Activity): boolean {
  const windSensitiveKeywords = ['boat', 'ferry', 'cable car', 'observation deck', 'rooftop'];
  
  return windSensitiveKeywords.some(keyword =>
    activity.name.toLowerCase().includes(keyword) ||
    activity.description.toLowerCase().includes(keyword)
  );
}

/**
 * Finds indoor alternative for an outdoor activity
 */
async function findIndoorAlternative(activity: Activity): Promise<Activity | null> {
  // This is a simplified version - in a real implementation,
  // you might use AI to suggest alternatives or have a database of alternatives
  
  const indoorAlternatives: Record<string, Partial<Activity>> = {
    'park': {
      name: 'Local Museum or Gallery',
      description: 'Explore indoor cultural attractions instead of outdoor parks',
      category: 'museum',
      weatherDependent: false
    },
    'market': {
      name: 'Shopping Mall or Indoor Market',
      description: 'Browse indoor shopping areas and food courts',
      category: 'shopping',
      weatherDependent: false
    },
    'walking-tour': {
      name: 'Museum or Gallery Tour',
      description: 'Self-guided indoor cultural tour',
      category: 'museum',
      weatherDependent: false
    },
    'garden': {
      name: 'Conservatory or Indoor Garden',
      description: 'Visit botanical conservatories or indoor plant exhibitions',
      category: 'attraction',
      weatherDependent: false
    }
  };

  const alternative = indoorAlternatives[activity.category];
  if (alternative) {
    return {
      ...activity,
      ...alternative,
      name: alternative.name || activity.name,
      description: alternative.description || activity.description,
      category: alternative.category || activity.category,
      weatherDependent: false
    };
  }

  return null;
}

/**
 * Finds sheltered alternative for wind-sensitive activities
 */
async function findShelteredAlternative(activity: Activity): Promise<Activity | null> {
  // Similar to indoor alternatives but for wind protection
  if (activity.name.toLowerCase().includes('rooftop')) {
    return {
      ...activity,
      name: activity.name.replace(/rooftop/i, 'indoor'),
      description: activity.description + ' (moved indoors due to windy conditions)',
      weatherDependent: false
    };
  }

  return null;
}

/**
 * Adjusts timing for hot weather
 */
function adjustTimingForHeat(activity: Activity): Activity {
  const currentHour = parseInt(activity.timing.startTime.split(':')[0]);
  
  // If activity is during hot hours (11 AM - 4 PM), suggest earlier time
  if (currentHour >= 11 && currentHour <= 16) {
    const newStartHour = Math.max(8, currentHour - 3);
    const duration = activity.timing.duration;
    const newEndHour = newStartHour + Math.floor(duration / 60);
    
    return {
      ...activity,
      timing: {
        ...activity.timing,
        startTime: `${newStartHour.toString().padStart(2, '0')}:00`,
        endTime: `${newEndHour.toString().padStart(2, '0')}:00`
      },
      description: activity.description + ' (scheduled earlier to avoid peak heat)'
    };
  }

  return activity;
}

/**
 * Parses weather API response
 */
function parseWeatherResponse(data: WeatherResponse): WeatherInfo {
  const current = data.current;
  const forecast = data.forecast.forecastday[0];

  return {
    condition: current.condition.text.toLowerCase(),
    temperature: {
      current: current.temp_c,
      min: forecast.day.mintemp_c,
      max: forecast.day.maxtemp_c,
      unit: 'celsius'
    },
    precipitation: {
      probability: forecast.day.daily_chance_of_rain,
      amount: forecast.day.totalprecip_mm
    },
    wind: {
      speed: current.wind_kph,
      direction: current.wind_dir
    },
    humidity: current.humidity,
    uvIndex: current.uv,
    visibility: current.vis_km
  };
}

/**
 * Gets cached weather data
 */
async function getCachedWeather(cacheKey: string): Promise<any | null> {
  try {
    const doc = await admin.firestore()
      .collection('weather_cache')
      .doc(cacheKey)
      .get();

    return doc.exists ? doc.data() : null;
  } catch (error) {
    functions.logger.error('Error getting cached weather:', error);
    return null;
  }
}

/**
 * Caches weather data
 */
async function cacheWeatherData(
  cacheKey: string,
  city: string,
  date: string,
  weather: WeatherInfo
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6); // Cache for 6 hours

    await admin.firestore()
      .collection('weather_cache')
      .doc(cacheKey)
      .set({
        id: cacheKey,
        city,
        date,
        weather,
        cachedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
      });
  } catch (error) {
    functions.logger.error('Error caching weather data:', error);
  }
}
