// Frontend type definitions for SoloAI

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: UserPreferences;
  profile: UserProfile;
}

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
  travelTimeToNext?: number;
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
  date: Date;
  activities: Activity[];
  accommodation?: {
    name: string;
    type: string;
    location: Location;
    pricePerNight: number;
    currency: string;
    rating: number;
    soloFriendly: boolean;
    safetyFeatures: string[];
    bookingUrl?: string;
  };
  totalEstimatedCost: number;
  totalTravelTime: number;
  weatherForecast?: WeatherInfo;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  destination: Destination;
  dates: {
    startDate: Date;
    endDate: Date;
    duration: number;
  };
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  days: DayPlan[];
  metadata: {
    generatedBy: string;
    generationTime: number;
    version: string;
    totalEstimatedCost: number;
    currency: string;
    weatherAdaptations: number;
    userModifications: number;
  };
  preferences: UserPreferences;
}

export interface ItineraryGenerationRequest {
  destination: {
    city: string;
    country: string;
  };
  dates: {
    startDate: string;
    endDate: string;
    duration: number;
  };
  preferences: UserPreferences;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}

export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers: MapMarker[];
  routes?: MapRoute[];
}

export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
  type: 'activity' | 'accommodation' | 'transport';
  icon?: string;
}

export interface MapRoute {
  id: string;
  waypoints: {
    lat: number;
    lng: number;
  }[];
  mode: 'walking' | 'driving' | 'transit';
  color?: string;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'multiselect' | 'date' | 'number' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface SearchFilters {
  destination?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  interests?: string[];
  travelStyle?: string;
}

export interface Analytics {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
