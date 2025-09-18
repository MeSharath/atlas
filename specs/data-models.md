# Data Models Specification

## Overview
This document defines the data structures used in the SoloAI travel planner application, stored in Firebase Firestore.

## Collections

### 1. Users Collection (`users`)

**Document ID**: Firebase Auth UID

```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: UserPreferences;
  profile: UserProfile;
}

interface UserPreferences {
  travelStyle: 'adventure' | 'relaxation' | 'cultural' | 'foodie' | 'budget' | 'luxury';
  interests: string[]; // e.g., ['history', 'museums', 'cafes', 'nightlife', 'nature']
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  accommodationType: 'hostel' | 'hotel' | 'apartment' | 'any';
  transportPreference: 'walking' | 'public-transport' | 'taxi' | 'rental-car';
  dietaryRestrictions?: string[];
  accessibility?: string[];
  languagePreference: string; // ISO language code
}

interface UserProfile {
  age?: number;
  gender?: string;
  nationality?: string;
  travelExperience: 'beginner' | 'intermediate' | 'expert';
  safetyPriority: 'low' | 'medium' | 'high';
}
```

### 2. Itineraries Collection (`itineraries`)

**Document ID**: Auto-generated

```typescript
interface Itinerary {
  id: string;
  userId: string;
  title: string;
  destination: Destination;
  dates: {
    startDate: Timestamp;
    endDate: Timestamp;
    duration: number; // days
  };
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  days: DayPlan[];
  metadata: ItineraryMetadata;
  preferences: UserPreferences; // Snapshot of preferences at creation time
}

interface Destination {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  placeId?: string; // Google Places ID
}

interface DayPlan {
  dayNumber: number;
  date: Timestamp;
  activities: Activity[];
  accommodation?: Accommodation;
  totalEstimatedCost: number;
  totalTravelTime: number; // minutes
  weatherForecast?: WeatherInfo;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., 'museum', 'restaurant', 'attraction'
  location: Location;
  timing: {
    startTime: string; // HH:MM format
    endTime: string;
    duration: number; // minutes
  };
  cost: {
    estimated: number;
    currency: string;
    priceLevel?: 1 | 2 | 3 | 4 | 5; // Google Places price level
  };
  booking?: {
    required: boolean;
    url?: string;
    phone?: string;
  };
  soloFriendly: boolean;
  safetyRating: number; // 1-5 scale
  weatherDependent: boolean;
  alternatives?: Activity[]; // Alternative activities for bad weather
}

interface Location {
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

interface Accommodation {
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

interface ItineraryMetadata {
  generatedBy: 'gemini-pro';
  generationTime: number; // milliseconds
  version: string;
  totalEstimatedCost: number;
  currency: string;
  weatherAdaptations: number; // Count of weather-based changes
  userModifications: number; // Count of user-made changes
}
```

### 3. Weather Data Collection (`weather_cache`)

**Document ID**: `{city}_{date}` (e.g., "paris_2024-03-15")

```typescript
interface WeatherCache {
  id: string;
  city: string;
  date: string; // YYYY-MM-DD format
  coordinates: {
    lat: number;
    lng: number;
  };
  weather: WeatherInfo;
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

interface WeatherInfo {
  condition: string; // e.g., 'sunny', 'rainy', 'cloudy'
  temperature: {
    current: number;
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  precipitation: {
    probability: number; // 0-100
    amount?: number; // mm
  };
  wind: {
    speed: number;
    direction: string;
  };
  humidity: number; // 0-100
  uvIndex?: number;
  visibility?: number; // km
}
```

### 4. Analytics Collection (`analytics`)

**Document ID**: Auto-generated

```typescript
interface AnalyticsEvent {
  id: string;
  userId?: string; // Optional for privacy
  sessionId: string;
  eventType: 'itinerary_generated' | 'weather_adaptation' | 'user_modification' | 'activity_clicked' | 'booking_initiated';
  timestamp: Timestamp;
  data: Record<string, any>;
  metadata: {
    userAgent?: string;
    location?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
  };
}
```

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own itineraries
    match /itineraries/{itineraryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Weather cache is read-only for authenticated users
    match /weather_cache/{weatherId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
    
    // Analytics is write-only for authenticated users
    match /analytics/{eventId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false; // Only backend can read
    }
  }
}
```

## Indexes

### Composite Indexes Required

1. **Itineraries by User and Status**
   - Collection: `itineraries`
   - Fields: `userId` (Ascending), `status` (Ascending), `createdAt` (Descending)

2. **Weather Cache by Location and Date**
   - Collection: `weather_cache`
   - Fields: `city` (Ascending), `date` (Ascending)

3. **Analytics by Event Type and Timestamp**
   - Collection: `analytics`
   - Fields: `eventType` (Ascending), `timestamp` (Descending)

## Migration Strategy

### Version 1.0 → 1.1
- Add new fields with default values
- Use Cloud Functions to backfill existing documents
- Maintain backward compatibility for 30 days

### Data Validation
- Use Firebase Functions triggers to validate data integrity
- Implement client-side validation before writes
- Use TypeScript interfaces for compile-time type checking
