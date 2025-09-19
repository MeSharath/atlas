import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  View, 
  Container, 
  Text, 
  Button, 
  Card,
  Icon,
  Badge,
  Grid,
  Divider
} from 'reshaped';
import { useAuth } from '@/hooks/useAuth';
import { useItinerary } from '@/hooks/useItinerary';
import { analyticsService } from '@/services/analytics';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MapComponent from '@/components/MapComponent';
import { 
  MapPin, 
  Calendar, 
  Clock,
  DollarSign,
  Star,
  Navigation,
  Share,
  Edit,
  Download,
  Cloud,
  Sun,
  CloudRain,
  Thermometer
} from 'lucide-react';

const TripDetailsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const { getItinerary, isLoading } = useItinerary();
  const navigate = useNavigate();
  
  const [itinerary, setItinerary] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    if (tripId && user) {
      loadItinerary();
      analyticsService.trackPageView('trip_details', `Trip ${tripId}`);
    }
  }, [tripId, user]);

  const loadItinerary = async () => {
    try {
      if (!tripId) return;
      const data = await getItinerary(tripId);
      setItinerary(data);
      
      // Load weather data for the destination
      // This would typically call your weather service
      // setWeatherData(await getWeatherForDestination(data.destination));
      
      analyticsService.trackEvent('trip_details_viewed', {
        tripId,
        destination: data.destination,
        duration: data.days?.length || 0
      });
    } catch (error) {
      console.error('Error loading itinerary:', error);
      navigate('/dashboard');
    }
  };

  const getMapMarkers = () => {
    if (!itinerary || !itinerary.days || selectedDay >= itinerary.days.length) {
      return [];
    }

    const day = itinerary.days[selectedDay];
    return day.activities?.map((activity: any, index: number) => ({
      id: `activity-${index}`,
      position: activity.location?.coordinates || { lat: 0, lng: 0 },
      title: activity.name,
      description: activity.description,
      type: activity.type || 'activity'
    })) || [];
  };

  const getMapRoutes = () => {
    if (!itinerary || !itinerary.days || selectedDay >= itinerary.days.length) {
      return [];
    }

    const day = itinerary.days[selectedDay];
    const activities = day.activities || [];
    
    if (activities.length < 2) return [];

    return [{
      origin: activities[0].location?.coordinates,
      destination: activities[activities.length - 1].location?.coordinates,
      waypoints: activities.slice(1, -1).map((activity: any) => activity.location?.coordinates).filter(Boolean)
    }];
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'museum': return '🏛️';
      case 'park': return '🌳';
      case 'shopping': return '🛍️';
      case 'entertainment': return '🎭';
      case 'transport': return '🚇';
      default: return '📍';
    }
  };

  const handleShare = async () => {
    if (navigator.share && itinerary) {
      try {
        await navigator.share({
          title: `My ${itinerary.destination} Trip`,
          text: `Check out my AI-generated travel itinerary for ${itinerary.destination}!`,
          url: window.location.href
        });
        analyticsService.trackEvent('trip_shared', { tripId, method: 'native' });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        analyticsService.trackEvent('trip_shared', { tripId, method: 'clipboard' });
      }
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="7xl" padding={6}>
        <View align="center" justify="center" minHeight="400px">
          <LoadingSpinner size={6} text="Loading your trip details..." />
        </View>
      </Container>
    );
  }

  if (!itinerary) {
    return (
      <Container maxWidth="7xl" padding={6}>
        <View align="center" justify="center" minHeight="400px" gap={4}>
          <Icon svg={MapPin} size={12} color="neutral-faded" />
          <Text variant="title-4" weight="bold">
            Trip not found
          </Text>
          <Button variant="solid" color="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container maxWidth="7xl" padding={6}>
      <View gap={6}>
        {/* Header */}
        <View direction="row" align="center" justify="space-between" wrap gap={4}>
          <View gap={2}>
            <Text variant="title-1" weight="bold">
              {itinerary.destination}
            </Text>
            <View direction="row" align="center" gap={4} wrap>
              <View direction="row" align="center" gap={1}>
                <Icon svg={Calendar} size={4} color="neutral-faded" />
                <Text variant="body-2" color="neutral-faded">
                  {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                </Text>
              </View>
              <View direction="row" align="center" gap={1}>
                <Icon svg={DollarSign} size={4} color="neutral-faded" />
                <Text variant="body-2" color="neutral-faded">
                  ${itinerary.budget} budget
                </Text>
              </View>
              <Badge variant="outline" color="primary">
                {itinerary.days?.length || 0} days
              </Badge>
            </View>
          </View>

          <View direction="row" gap={2}>
            <Button variant="outline" color="neutral" onClick={handleShare}>
              <Icon svg={Share} />
            </Button>
            <Button variant="outline" color="neutral">
              <Icon svg={Download} />
            </Button>
            <Button variant="solid" color="primary">
              <Icon svg={Edit} />
              Edit Trip
            </Button>
          </View>
        </View>

        {/* Weather Info */}
        {weatherData && (
          <Card padding={4}>
            <View direction="row" align="center" gap={4}>
              <Icon svg={Sun} size={6} color="warning" />
              <View>
                <Text variant="body-2" weight="medium">
                  Current Weather in {itinerary.destination}
                </Text>
                <Text variant="body-3" color="neutral-faded">
                  {weatherData.temperature}°C, {weatherData.condition}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Grid columns={{ s: 1, l: 2 }} gap={6}>
          {/* Left Column - Itinerary */}
          <View gap={4}>
            {/* Day Selector */}
            <Card padding={4}>
              <View gap={3}>
                <Text variant="body-2" weight="medium">
                  Select Day
                </Text>
                <View direction="row" gap={2} wrap>
                  {itinerary.days?.map((day: any, index: number) => (
                    <Button
                      key={index}
                      variant={selectedDay === index ? 'solid' : 'outline'}
                      color={selectedDay === index ? 'primary' : 'neutral'}
                      size="small"
                      onClick={() => setSelectedDay(index)}
                    >
                      Day {index + 1}
                    </Button>
                  ))}
                </View>
              </View>
            </Card>

            {/* Day Details */}
            {itinerary.days && itinerary.days[selectedDay] && (
              <Card padding={6}>
                <View gap={4}>
                  <View direction="row" align="center" justify="space-between">
                    <Text variant="title-4" weight="bold">
                      Day {selectedDay + 1} - {new Date(itinerary.days[selectedDay].date).toLocaleDateString()}
                    </Text>
                    <Badge variant="outline" color="neutral">
                      {itinerary.days[selectedDay].activities?.length || 0} activities
                    </Badge>
                  </View>

                  <Divider />

                  {/* Activities */}
                  <View gap={4}>
                    {itinerary.days[selectedDay].activities?.map((activity: any, index: number) => (
                      <Card key={index} padding={4} backgroundColor="neutral-faded">
                        <View gap={3}>
                          <View direction="row" align="center" justify="space-between">
                            <View direction="row" align="center" gap={2}>
                              <Text variant="body-1">
                                {getActivityIcon(activity.type)}
                              </Text>
                              <Text variant="body-2" weight="medium">
                                {activity.name}
                              </Text>
                            </View>
                            <View direction="row" align="center" gap={2}>
                              {activity.rating && (
                                <View direction="row" align="center" gap={1}>
                                  <Icon svg={Star} size={3} color="warning" />
                                  <Text variant="body-3">
                                    {activity.rating}
                                  </Text>
                                </View>
                              )}
                              <Badge variant="outline" color="neutral" size="small">
                                {activity.type}
                              </Badge>
                            </View>
                          </View>

                          {activity.description && (
                            <Text variant="body-3" color="neutral-faded">
                              {activity.description}
                            </Text>
                          )}

                          <View direction="row" align="center" justify="space-between" wrap gap={2}>
                            <View direction="row" align="center" gap={4}>
                              {activity.duration && (
                                <View direction="row" align="center" gap={1}>
                                  <Icon svg={Clock} size={3} color="neutral-faded" />
                                  <Text variant="body-3" color="neutral-faded">
                                    {formatDuration(activity.duration)}
                                  </Text>
                                </View>
                              )}
                              {activity.cost && (
                                <View direction="row" align="center" gap={1}>
                                  <Icon svg={DollarSign} size={3} color="neutral-faded" />
                                  <Text variant="body-3" color="neutral-faded">
                                    ${activity.cost}
                                  </Text>
                                </View>
                              )}
                            </View>
                            
                            <Button variant="ghost" color="primary" size="small">
                              <Icon svg={Navigation} />
                              Directions
                            </Button>
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                </View>
              </Card>
            )}
          </View>

          {/* Right Column - Map */}
          <View gap={4}>
            <Card padding={4}>
              <View gap={3}>
                <Text variant="body-2" weight="medium">
                  Day {selectedDay + 1} Map
                </Text>
                <MapComponent
                  center={itinerary.location?.coordinates || { lat: 40.7128, lng: -74.0060 }}
                  zoom={13}
                  markers={getMapMarkers()}
                  routes={getMapRoutes()}
                  height="500px"
                  onMarkerClick={(markerId) => {
                    analyticsService.trackUserInteraction('click', 'activity_marker', { 
                      tripId, 
                      day: selectedDay, 
                      markerId 
                    });
                  }}
                />
              </View>
            </Card>

            {/* Trip Summary */}
            <Card padding={6}>
              <View gap={4}>
                <Text variant="title-4" weight="bold">
                  Trip Summary
                </Text>
                
                <View gap={3}>
                  <View direction="row" align="center" justify="space-between">
                    <Text variant="body-3" color="neutral-faded">
                      Total Activities
                    </Text>
                    <Text variant="body-3" weight="medium">
                      {itinerary.days?.reduce((total: number, day: any) => total + (day.activities?.length || 0), 0)}
                    </Text>
                  </View>
                  
                  <View direction="row" align="center" justify="space-between">
                    <Text variant="body-3" color="neutral-faded">
                      Estimated Cost
                    </Text>
                    <Text variant="body-3" weight="medium">
                      ${itinerary.estimatedCost || itinerary.budget}
                    </Text>
                  </View>
                  
                  <View direction="row" align="center" justify="space-between">
                    <Text variant="body-3" color="neutral-faded">
                      Travel Style
                    </Text>
                    <Text variant="body-3" weight="medium">
                      {itinerary.travelStyle || 'Balanced'}
                    </Text>
                  </View>
                  
                  <View direction="row" align="center" justify="space-between">
                    <Text variant="body-3" color="neutral-faded">
                      Safety Priority
                    </Text>
                    <Text variant="body-3" weight="medium">
                      {itinerary.safetyPriority || 8}/10
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </Grid>
      </View>
    </Container>
  );
};

export default TripDetailsPage;
