import React, { useEffect, useRef, useState } from 'react';
import { View, Card, Text, Button, Icon } from 'reshaped';
import { Loader } from '@googlemaps/js-api-loader';
import { analyticsService } from '@/services/analytics';
import LoadingSpinner from './ui/LoadingSpinner';
import { MapPin, Navigation, Layers } from 'lucide-react';

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    description?: string;
    type?: 'activity' | 'accommodation' | 'restaurant' | 'transport';
  }>;
  routes?: Array<{
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: Array<{ lat: number; lng: number }>;
  }>;
  onMarkerClick?: (markerId: string) => void;
  height?: string;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  markers = [],
  routes = [],
  onMarkerClick,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not found');
      setIsLoading(false);
      return;
    }

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeId: mapType,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });

          setMap(mapInstance);
          analyticsService.trackEvent('map_initialized', { center, zoom });
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map');
        analyticsService.trackEvent('map_load_failed', { error: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [GOOGLE_MAPS_API_KEY, center.lat, center.lng, zoom, mapType]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: getMarkerIcon(markerData.type)
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              ${markerData.title}
            </h3>
            ${markerData.description ? `<p style="margin: 0; font-size: 12px; color: #666;">${markerData.description}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onMarkerClick) {
          onMarkerClick(markerData.id);
        }
        analyticsService.trackUserInteraction('click', 'map_marker', { 
          markerId: markerData.id, 
          type: markerData.type 
        });
      });

      markersRef.current.push(marker);
    });

    // Adjust map bounds to fit all markers
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.position));
      map.fitBounds(bounds);
    }
  }, [map, markers, onMarkerClick]);

  // Update routes when routes prop changes
  useEffect(() => {
    if (!map || routes.length === 0) return;

    // Clear existing directions
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll use our custom markers
      polylineOptions: {
        strokeColor: '#4F46E5',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsRenderer.setMap(map);
    directionsRendererRef.current = directionsRenderer;

    // For now, handle the first route
    if (routes[0]) {
      const route = routes[0];
      const waypoints = route.waypoints?.map(point => ({
        location: point,
        stopover: true
      })) || [];

      directionsService.route({
        origin: route.origin,
        destination: route.destination,
        waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      }, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          analyticsService.trackEvent('route_displayed', { 
            waypoints: waypoints.length,
            distance: result.routes[0]?.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0)
          });
        } else {
          console.error('Directions request failed:', status);
        }
      });
    }
  }, [map, routes]);

  const getMarkerIcon = (type?: string) => {
    const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    switch (type) {
      case 'activity':
        return `${iconBase}placemark_circle_highlight.png`;
      case 'accommodation':
        return `${iconBase}lodging.png`;
      case 'restaurant':
        return `${iconBase}dining.png`;
      case 'transport':
        return `${iconBase}airports.png`;
      default:
        return undefined; // Use default marker
    }
  };

  const toggleMapType = () => {
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newType);
    if (map) {
      map.setMapTypeId(newType);
      analyticsService.trackUserInteraction('click', 'map_type_toggle', { type: newType });
    }
  };

  const centerOnUserLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userLocation);
          map.setZoom(15);
          
          // Add user location marker
          new google.maps.Marker({
            position: userLocation,
            map,
            title: 'Your Location',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });

          analyticsService.trackEvent('user_location_centered', userLocation);
        },
        (error) => {
          console.error('Error getting user location:', error);
          analyticsService.trackEvent('geolocation_failed', { error: error.message });
        }
      );
    }
  };

  if (error) {
    return (
      <Card padding={6} height={height}>
        <View align="center" justify="center" height="100%" gap={3}>
          <Icon svg={MapPin} size={8} color="critical" />
          <Text variant="body-2" color="critical" align="center">
            {error}
          </Text>
          <Button variant="outline" color="critical" size="small">
            Retry
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card className={className} height={height} position="relative">
      {isLoading && (
        <View 
          position="absolute" 
          inset={0} 
          backgroundColor="neutral-faded" 
          align="center" 
          justify="center"
          zIndex={10}
        >
          <LoadingSpinner size={6} text="Loading map..." />
        </View>
      )}

      {/* Map Controls */}
      <View position="absolute" insetTop={3} insetRight={3} zIndex={5} gap={2}>
        <Button
          variant="solid"
          color="neutral"
          size="small"
          onClick={toggleMapType}
          title={`Switch to ${mapType === 'roadmap' ? 'satellite' : 'road'} view`}
        >
          <Icon svg={Layers} />
        </Button>
        
        <Button
          variant="solid"
          color="primary"
          size="small"
          onClick={centerOnUserLocation}
          title="Center on your location"
        >
          <Icon svg={Navigation} />
        </Button>
      </View>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px'
        }}
      />

      {/* Map Info */}
      {markers.length > 0 && (
        <View 
          position="absolute" 
          insetBottom={3} 
          insetLeft={3} 
          backgroundColor="neutral-faded" 
          padding={2} 
          borderRadius="medium"
        >
          <Text variant="body-3" color="neutral">
            {markers.length} location{markers.length !== 1 ? 's' : ''} shown
          </Text>
        </View>
      )}
    </Card>
  );
};

export default MapComponent;
