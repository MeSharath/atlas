// Shared type definitions for the SoloAI backend

export interface UserPreferences {
  travelStyle: 'adventure' | 'relaxation' | 'cultural' | 'foodie' | 'budget' | 'luxury';
  interests: string[];
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  accommodationType: 'hostel' | 'hotel' | 'apartment' | 'any';
  transportPreference: 'walking' | 'public-transport' | 'taxi' | 'rental-car';
  dietaryRestrictions?: string[];
  accessibility?: string[];
  languagePreference: string;
}

export interface UserProfile {
  age?: number;
  gender?: string;
  nationality?: string;
  travelExperience: 'beginner' | 'intermediate' | 'expert';
  safetyPriority: 'low' | 'medium' | 'high';
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface Destination {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  placeId?: string;
}

export interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  openingHours?: string[];
  rating?: number;
  photos?: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  location: Location;
  timing: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  cost: {
    estimated: number;
    currency: string;
    priceLevel?: 1 | 2 | 3 | 4 | 5;
  };
  booking?: {
    required: boolean;
    url?: string;
    phone?: string;
  };
  soloFriendly: boolean;
  safetyRating: number;
  weatherDependent: boolean;
  alternatives?: Activity[];
}

export interface Accommodation {
  name: string;
  type: 'hostel' | 'hotel' | 'apartment' | 'guesthouse';
  location: Location;
  pricePerNight: number;
  currency: string;
  rating: number;
  soloFriendly: boolean;
  safetyFeatures: string[];
  bookingUrl?: string;
}

export interface WeatherInfo {
  condition: string;
  temperature: {
    current: number;
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  precipitation: {
    probability: number;
    amount?: number;
  };
  wind: {
    speed: number;
    direction: string;
  };
  humidity: number;
  uvIndex?: number;
  visibility?: number;
}

export interface DayPlan {
  dayNumber: number;
  date: FirebaseFirestore.Timestamp;
  activities: Activity[];
  accommodation?: Accommodation;
  totalEstimatedCost: number;
  totalTravelTime: number;
  weatherForecast?: WeatherInfo;
}

export interface ItineraryMetadata {
  generatedBy: 'gemini-pro';
  generationTime: number;
  version: string;
  totalEstimatedCost: number;
  currency: string;
  weatherAdaptations: number;
  userModifications: number;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  destination: Destination;
  dates: {
    startDate: FirebaseFirestore.Timestamp;
    endDate: FirebaseFirestore.Timestamp;
    duration: number;
  };
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  days: DayPlan[];
  metadata: ItineraryMetadata;
  preferences: UserPreferences;
}

export interface AnalyticsEvent {
  userId?: string;
  eventType: string;
  data: Record<string, any>;
  sessionId?: string;
  metadata?: {
    userAgent?: string;
    location?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
  };
}

export interface ItineraryGenerationRequest {
  destination: Destination;
  dates: {
    startDate: string;
    endDate: string;
    duration: number;
  };
  preferences: UserPreferences;
  userId: string;
}

export interface GeminiResponse {
  itinerary: {
    title: string;
    days: Array<{
      dayNumber: number;
      activities: Array<{
        name: string;
        description: string;
        category: string;
        location: string;
        startTime: string;
        endTime: string;
        estimatedCost: number;
        soloFriendly: boolean;
        weatherDependent: boolean;
      }>;
    }>;
  };
}

export interface GooglePlacesResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    price_level?: number;
    opening_hours?: {
      weekday_text: string[];
    };
    photos?: Array<{
      photo_reference: string;
    }>;
  }>;
}

export interface WeatherResponse {
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
    };
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    uv: number;
    vis_km: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
        };
        daily_chance_of_rain: number;
        totalprecip_mm: number;
      };
    }>;
  };
}
