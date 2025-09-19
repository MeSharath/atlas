import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  View, 
  Container, 
  Text, 
  Button, 
  Card,
  TextField,
  Select,
  Checkbox,
  RadioGroup,
  Slider,
  DatePicker,
  Icon,
  Badge,
  Divider
} from 'reshaped';
import { useAuth } from '@/hooks/useAuth';
import { useItinerary } from '@/hooks/useItinerary';
import { analyticsService } from '@/services/analytics';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  Heart,
  Zap,
  Shield
} from 'lucide-react';

interface TripPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  budgetCurrency: string;
  travelStyle: string;
  interests: string[];
  accommodationType: string;
  transportPreference: string;
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
  safetyPriority: number;
  weatherAdaptation: boolean;
  localExperiences: boolean;
}

const CreateTripPage: React.FC = () => {
  const { user } = useAuth();
  const { generateItinerary, isLoading } = useItinerary();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 1000,
    budgetCurrency: 'USD',
    travelStyle: 'balanced',
    interests: [],
    accommodationType: 'hotel',
    transportPreference: 'mixed',
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    safetyPriority: 8,
    weatherAdaptation: true,
    localExperiences: true
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const travelStyles = [
    { value: 'budget', label: 'Budget Explorer', description: 'Maximize experiences, minimize costs' },
    { value: 'balanced', label: 'Balanced Traveler', description: 'Good mix of comfort and adventure' },
    { value: 'luxury', label: 'Luxury Seeker', description: 'Premium experiences and comfort' },
    { value: 'adventure', label: 'Adventure Enthusiast', description: 'Thrilling and active experiences' }
  ];

  const interests = [
    'Culture & History', 'Food & Dining', 'Nature & Outdoors', 'Art & Museums',
    'Nightlife & Entertainment', 'Shopping', 'Photography', 'Architecture',
    'Local Markets', 'Wellness & Spa', 'Adventure Sports', 'Music & Festivals'
  ];

  const accommodationTypes = [
    { value: 'hotel', label: 'Hotels' },
    { value: 'hostel', label: 'Hostels' },
    { value: 'airbnb', label: 'Airbnb/Vacation Rentals' },
    { value: 'boutique', label: 'Boutique Hotels' },
    { value: 'resort', label: 'Resorts' }
  ];

  const handleInputChange = (field: keyof TripPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    try {
      analyticsService.trackEvent('trip_creation_started', preferences);
      
      const itinerary = await generateItinerary(preferences);
      
      analyticsService.trackEvent('trip_creation_completed', {
        destination: preferences.destination,
        duration: preferences.endDate && preferences.startDate 
          ? Math.ceil((new Date(preferences.endDate).getTime() - new Date(preferences.startDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        budget: preferences.budget,
        interests_count: preferences.interests.length
      });

      navigate(`/trip/${itinerary.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      analyticsService.trackEvent('trip_creation_failed', { error: error.message });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View gap={6}>
            <View gap={2}>
              <Text variant="title-3" weight="bold">
                Where would you like to go?
              </Text>
              <Text variant="body-2" color="neutral-faded">
                Tell us about your destination and travel dates
              </Text>
            </View>

            <View gap={4}>
              <TextField
                label="Destination"
                placeholder="e.g., Tokyo, Japan"
                value={preferences.destination}
                onChange={(value) => handleInputChange('destination', value)}
                startIcon={<Icon svg={MapPin} />}
                required
              />

              <View direction="row" gap={4}>
                <DatePicker
                  label="Start Date"
                  value={preferences.startDate}
                  onChange={(value) => handleInputChange('startDate', value)}
                  required
                />
                <DatePicker
                  label="End Date"
                  value={preferences.endDate}
                  onChange={(value) => handleInputChange('endDate', value)}
                  required
                />
              </View>

              <View gap={2}>
                <Text variant="body-2" weight="medium">
                  Budget: ${preferences.budget} {preferences.budgetCurrency}
                </Text>
                <Slider
                  value={preferences.budget}
                  onChange={(value) => handleInputChange('budget', value)}
                  min={100}
                  max={10000}
                  step={100}
                />
                <View direction="row" justify="space-between">
                  <Text variant="body-3" color="neutral-faded">$100</Text>
                  <Text variant="body-3" color="neutral-faded">$10,000+</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View gap={6}>
            <View gap={2}>
              <Text variant="title-3" weight="bold">
                What's your travel style?
              </Text>
              <Text variant="body-2" color="neutral-faded">
                Choose the style that best describes your ideal trip
              </Text>
            </View>

            <RadioGroup
              value={preferences.travelStyle}
              onChange={(value) => handleInputChange('travelStyle', value)}
            >
              <View gap={3}>
                {travelStyles.map((style) => (
                  <Card key={style.value} padding={4}>
                    <RadioGroup.Item value={style.value}>
                      <View direction="row" align="center" gap={3}>
                        <View grow>
                          <Text variant="body-2" weight="medium">
                            {style.label}
                          </Text>
                          <Text variant="body-3" color="neutral-faded">
                            {style.description}
                          </Text>
                        </View>
                      </View>
                    </RadioGroup.Item>
                  </Card>
                ))}
              </View>
            </RadioGroup>
          </View>
        );

      case 3:
        return (
          <View gap={6}>
            <View gap={2}>
              <Text variant="title-3" weight="bold">
                What interests you?
              </Text>
              <Text variant="body-2" color="neutral-faded">
                Select all that apply to personalize your itinerary
              </Text>
            </View>

            <View direction="row" wrap gap={2}>
              {interests.map((interest) => (
                <Button
                  key={interest}
                  variant={preferences.interests.includes(interest) ? 'solid' : 'outline'}
                  color={preferences.interests.includes(interest) ? 'primary' : 'neutral'}
                  size="small"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Button>
              ))}
            </View>

            <Divider />

            <View gap={4}>
              <Select
                label="Accommodation Preference"
                value={preferences.accommodationType}
                onChange={(value) => handleInputChange('accommodationType', value)}
                options={accommodationTypes}
              />

              <View gap={2}>
                <Text variant="body-2" weight="medium">
                  Safety Priority: {preferences.safetyPriority}/10
                </Text>
                <Slider
                  value={preferences.safetyPriority}
                  onChange={(value) => handleInputChange('safetyPriority', value)}
                  min={1}
                  max={10}
                  step={1}
                />
                <Text variant="body-3" color="neutral-faded">
                  Higher values prioritize safer, well-reviewed locations
                </Text>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View gap={6}>
            <View gap={2}>
              <Text variant="title-3" weight="bold">
                Final preferences
              </Text>
              <Text variant="body-2" color="neutral-faded">
                Configure additional options for your perfect trip
              </Text>
            </View>

            <View gap={4}>
              <Checkbox
                checked={preferences.weatherAdaptation}
                onChange={(checked) => handleInputChange('weatherAdaptation', checked)}
              >
                <View gap={1}>
                  <Text variant="body-2" weight="medium">
                    Weather Adaptation
                  </Text>
                  <Text variant="body-3" color="neutral-faded">
                    Automatically suggest indoor alternatives during bad weather
                  </Text>
                </View>
              </Checkbox>

              <Checkbox
                checked={preferences.localExperiences}
                onChange={(checked) => handleInputChange('localExperiences', checked)}
              >
                <View gap={1}>
                  <Text variant="body-2" weight="medium">
                    Local Experiences
                  </Text>
                  <Text variant="body-3" color="neutral-faded">
                    Include authentic local activities and hidden gems
                  </Text>
                </View>
              </Checkbox>
            </View>

            <Card padding={4} backgroundColor="primary-faded">
              <View direction="row" align="center" gap={3}>
                <Icon svg={Shield} color="primary" />
                <View>
                  <Text variant="body-2" weight="medium" color="primary">
                    Solo Travel Safety
                  </Text>
                  <Text variant="body-3" color="primary-faded">
                    All recommendations are optimized for solo traveler safety
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="2xl" padding={6}>
      <View gap={8}>
        {/* Progress Header */}
        <View gap={4}>
          <View direction="row" align="center" justify="space-between">
            <Text variant="title-2" weight="bold">
              Create Your Trip
            </Text>
            <Badge variant="outline" color="primary">
              Step {currentStep} of {totalSteps}
            </Badge>
          </View>

          {/* Progress Bar */}
          <View backgroundColor="neutral-faded" height={2} borderRadius="full">
            <View 
              backgroundColor="primary" 
              height={2} 
              borderRadius="full"
              width={`${(currentStep / totalSteps) * 100}%`}
            />
          </View>
        </View>

        {/* Step Content */}
        <Card padding={8}>
          {renderStep()}
        </Card>

        {/* Navigation */}
        <View direction="row" justify="space-between">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              variant="solid"
              color="primary"
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={currentStep === 1 && !preferences.destination}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="solid"
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading || !preferences.destination}
              startIcon={isLoading ? <LoadingSpinner size={3} /> : <Icon svg={Zap} />}
            >
              {isLoading ? 'Creating Trip...' : 'Create My Trip'}
            </Button>
          )}
        </View>
      </View>
    </Container>
  );
};

export default CreateTripPage;
