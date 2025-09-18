import { Loader } from '@googlemaps/js-api-loader';
import { Activity, Location, MapConfig, MapMarker, MapRoute } from '@/types';

export class MapsService {
  private static instance: MapsService;
  private loader: Loader;
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  /**
   * Initialize Google Maps
   */
  async initializeMap(
    container: HTMLElement,
    config: MapConfig
  ): Promise<google.maps.Map> {
    try {
      await this.loader.load();

      this.map = new google.maps.Map(container, {
        center: config.center,
        zoom: config.zoom,
        styles: this.getMapStyles(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 3,
          strokeOpacity: 0.8
        }
      });

      this.directionsRenderer.setMap(this.map);

      // Add markers
      if (config.markers) {
        this.addMarkers(config.markers);
      }

      // Add routes
      if (config.routes) {
        this.addRoutes(config.routes);
      }

      return this.map;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw new Error('Failed to initialize Google Maps');
    }
  }

  /**
   * Add markers to the map
   */
  addMarkers(markers: MapMarker[]): void {
    if (!this.map) return;

    // Clear existing markers
    this.clearMarkers();

    markers.forEach((markerData, index) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: this.map,
        title: markerData.title,
        icon: this.getMarkerIcon(markerData.type, index + 1),
        animation: google.maps.Animation.DROP
      });

      // Add info window
      if (markerData.description) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-gray-900 mb-1">${markerData.title}</h3>
              <p class="text-sm text-gray-600">${markerData.description}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });
      }

      this.markers.push(marker);
    });

    // Fit map to show all markers
    if (markers.length > 1) {
      this.fitBounds(markers.map(m => m.position));
    }
  }

  /**
   * Add routes to the map
   */
  async addRoutes(routes: MapRoute[]): Promise<void> {
    if (!this.map || !this.directionsService || !this.directionsRenderer) return;

    for (const route of routes) {
      if (route.waypoints.length < 2) continue;

      const origin = route.waypoints[0];
      const destination = route.waypoints[route.waypoints.length - 1];
      const waypoints = route.waypoints.slice(1, -1).map(point => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true
      }));

      try {
        const result = await this.calculateRoute(
          origin,
          destination,
          waypoints,
          route.mode || 'walking'
        );

        this.directionsRenderer.setDirections(result);
      } catch (error) {
        console.error('Error adding route:', error);
      }
    }
  }

  /**
   * Calculate route between points
   */
  private calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: google.maps.DirectionsWaypoint[],
    travelMode: 'walking' | 'driving' | 'transit'
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      if (!this.directionsService) {
        reject(new Error('Directions service not initialized'));
        return;
      }

      const mode = travelMode === 'walking' ? google.maps.TravelMode.WALKING :
                   travelMode === 'driving' ? google.maps.TravelMode.DRIVING :
                   google.maps.TravelMode.TRANSIT;

      this.directionsService.route({
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: mode,
        optimizeWaypoints: true
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Create map configuration from activities
   */
  createMapConfigFromActivities(activities: Activity[]): MapConfig {
    const markers: MapMarker[] = activities.map((activity, index) => ({
      id: activity.id,
      position: activity.location.coordinates,
      title: activity.name,
      description: activity.description,
      type: 'activity',
      icon: this.getMarkerIcon('activity', index + 1)
    }));

    // Calculate center point
    const center = this.calculateCenter(activities.map(a => a.location.coordinates));

    // Create route waypoints
    const routes: MapRoute[] = activities.length > 1 ? [{
      id: 'main-route',
      waypoints: activities.map(a => a.location.coordinates),
      mode: 'walking',
      color: '#3b82f6'
    }] : [];

    return {
      center,
      zoom: this.calculateOptimalZoom(activities.map(a => a.location.coordinates)),
      markers,
      routes
    };
  }

  /**
   * Search for places
   */
  async searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<google.maps.places.PlaceResult[]> {
    try {
      await this.loader.load();

      return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(
          document.createElement('div')
        );

        const request: google.maps.places.TextSearchRequest = {
          query,
          location: location ? new google.maps.LatLng(location.lat, location.lng) : undefined,
          radius: radius || 5000
        };

        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Failed to search places');
    }
  }

  /**
   * Geocode an address
   */
  async geocodeAddress(address: string): Promise<Location> {
    try {
      await this.loader.load();

      return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location: Location = {
              name: address,
              address: result.formatted_address,
              coordinates: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              },
              placeId: result.place_id
            };
            resolve(location);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Get marker icon based on type and number
   */
  private getMarkerIcon(type: string, number?: number): google.maps.Icon {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    switch (type) {
      case 'activity':
        return {
          url: `${baseUrl}red-dot.png`,
          scaledSize: new google.maps.Size(32, 32),
          labelOrigin: new google.maps.Point(16, 16)
        };
      case 'accommodation':
        return {
          url: `${baseUrl}blue-dot.png`,
          scaledSize: new google.maps.Size(32, 32)
        };
      case 'transport':
        return {
          url: `${baseUrl}green-dot.png`,
          scaledSize: new google.maps.Size(32, 32)
        };
      default:
        return {
          url: `${baseUrl}red-dot.png`,
          scaledSize: new google.maps.Size(32, 32)
        };
    }
  }

  /**
   * Calculate center point from coordinates
   */
  private calculateCenter(coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } {
    if (coordinates.length === 0) {
      return { lat: 0, lng: 0 };
    }

    const sum = coordinates.reduce(
      (acc, coord) => ({
        lat: acc.lat + coord.lat,
        lng: acc.lng + coord.lng
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: sum.lat / coordinates.length,
      lng: sum.lng / coordinates.length
    };
  }

  /**
   * Calculate optimal zoom level
   */
  private calculateOptimalZoom(coordinates: { lat: number; lng: number }[]): number {
    if (coordinates.length <= 1) return 15;

    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(coord => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });

    // Estimate zoom level based on bounds
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const latDiff = Math.abs(ne.lat() - sw.lat());
    const lngDiff = Math.abs(ne.lng() - sw.lng());
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff > 10) return 8;
    if (maxDiff > 5) return 10;
    if (maxDiff > 2) return 12;
    if (maxDiff > 1) return 13;
    if (maxDiff > 0.5) return 14;
    return 15;
  }

  /**
   * Fit map bounds to show all coordinates
   */
  private fitBounds(coordinates: { lat: number; lng: number }[]): void {
    if (!this.map || coordinates.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(coord => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });

    this.map.fitBounds(bounds);
  }

  /**
   * Clear all markers
   */
  private clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  /**
   * Get custom map styles
   */
  private getMapStyles(): google.maps.MapTypeStyle[] {
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];
  }

  /**
   * Cleanup map resources
   */
  cleanup(): void {
    this.clearMarkers();
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
    }
    this.map = null;
  }
}

// Export singleton instance
export const mapsService = MapsService.getInstance();
