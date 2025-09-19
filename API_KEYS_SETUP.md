# API Keys Setup Guide for SoloAI

This document provides detailed instructions for obtaining and configuring all required API keys for the SoloAI travel planner application.

## 🔑 Required API Keys Overview

| Service | Purpose | Key Type | Restrictions |
|---------|---------|----------|--------------|
| Firebase | Authentication, Database, Functions | Web API Key | Domain restrictions |
| Google Maps (Frontend) | Interactive maps, autocomplete | JavaScript API Key | HTTP referrer restrictions |
| Google Maps (Backend) | Places data, directions, geocoding | Server API Key | IP address restrictions |
| Weather API | Real-time weather data | API Key | Rate limiting |
| Vertex AI | Gemini Pro AI model | Service Account | IAM permissions |

## 🚀 Step-by-Step Setup

### 1. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `soloai-travel-planner`
4. Enable Google Analytics (recommended)
5. Choose or create Analytics account

#### Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app (</>) 
4. Register app name: `SoloAI Frontend`
5. Copy the configuration object:

```javascript
// Your Firebase config object will look like this:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};
```

#### Enable Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. Enable "Google" (configure OAuth consent screen)

#### Setup Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll deploy security rules later)
4. Select location (choose closest to your users)

### 2. Google Cloud Platform Setup

#### Create/Link Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Your Firebase project should already be linked
3. Enable billing for the project

#### Enable Required APIs
```bash
# Run these commands in Google Cloud Shell or local terminal with gcloud CLI
gcloud services enable aiplatform.googleapis.com
gcloud services enable maps-backend.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable directions-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com
gcloud services enable bigquery.googleapis.com
```

### 3. Google Maps API Keys

#### Create Frontend API Key (JavaScript)
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Name it: `SoloAI Frontend Maps Key`
4. Click "Restrict Key"
5. **Application restrictions**: HTTP referrers (web sites)
   - Add: `localhost:3000/*` (development)
   - Add: `localhost:5000/*` (Firebase hosting emulator)
   - Add: `your-domain.com/*` (production)
   - Add: `*.your-domain.com/*` (production subdomains)
6. **API restrictions**: Select these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
7. Save the key

#### Create Backend API Key (Server-side)
1. Create another API key: `SoloAI Backend Maps Key`
2. **Application restrictions**: IP addresses (web servers, cron jobs, etc.)
   - Add your server IPs (for production)
   - For development, you can leave unrestricted temporarily
3. **API restrictions**: Select these APIs:
   - Places API
   - Directions API
   - Geocoding API
   - Distance Matrix API
   - **DO NOT** include Maps JavaScript API
4. Save the key

### 4. Weather API Key

#### Option A: WeatherAPI.com (Recommended)
1. Go to [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for free account
3. Go to dashboard and copy your API key
4. Free tier: 1 million calls/month

#### Option B: OpenWeatherMap
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Go to API keys section
4. Copy your API key
5. Free tier: 1,000 calls/day

### 5. Vertex AI / Gemini Pro Setup

#### Create Service Account
1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `soloai-backend-service`
4. Description: `Service account for SoloAI backend functions`
5. Grant roles:
   - `Vertex AI User`
   - `BigQuery Data Editor`
   - `Firebase Admin SDK Administrator Service Agent`

#### Download Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose JSON format
5. Download and save as `service-account-key.json`
6. **NEVER commit this file to version control**

### 6. BigQuery Setup

#### Create Dataset
1. Go to BigQuery in Google Cloud Console
2. Click on your project ID
3. Click "Create Dataset"
4. Dataset ID: `soloai_analytics`
5. Location: `US` (or your preferred region)
6. Click "Create Dataset"

## 📝 Environment Files Configuration

### Frontend Environment (.env.local)
Create `src/frontend/.env.local` and fill in your keys:

```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_frontend_maps_api_key
```

### Backend Environment (.env.local)
Create `src/functions/.env.local` and fill in your keys:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_MAPS_API_KEY=your_backend_maps_api_key
WEATHER_API_KEY=your_weather_api_key
VERTEX_AI_PROJECT_ID=your-project-id
BIGQUERY_DATASET_ID=soloai_analytics
```

## 🔒 Security Best Practices

### API Key Security
1. **Never commit API keys to version control**
2. Use different keys for development and production
3. Implement proper key restrictions
4. Rotate keys regularly
5. Monitor API usage for anomalies

### Key Restrictions Summary
- **Frontend Maps Key**: HTTP referrer restrictions to your domains
- **Backend Maps Key**: IP address restrictions to your servers
- **Firebase Key**: Automatic domain restrictions
- **Weather API Key**: Rate limiting (built-in)
- **Service Account**: IAM role restrictions

### Environment File Security
1. Add `.env.local` to `.gitignore`
2. Use environment variables in production
3. Never expose keys in client-side code
4. Use Firebase Functions config for sensitive data

## 🧪 Testing Your Setup

### Verify Firebase Connection
```bash
cd src/frontend
npm run dev
# Check browser console for Firebase connection
```

### Test Maps API
```bash
# Test geocoding
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=YOUR_BACKEND_MAPS_KEY"
```

### Test Weather API
```bash
# Test WeatherAPI
curl "https://api.weatherapi.com/v1/current.json?key=YOUR_WEATHER_KEY&q=Paris"
```

### Test Vertex AI
```bash
# This will be tested when you deploy functions
firebase deploy --only functions
```

## 💰 Cost Management

### Set Up Billing Alerts
1. Go to Google Cloud Console → Billing
2. Set up budget alerts
3. Recommended: $50/month alert for development

### API Usage Monitoring
1. Monitor Google Maps API usage
2. Set quotas to prevent unexpected charges
3. Use caching to reduce API calls

### Free Tier Limits
- **Firebase**: Generous free tier for small apps
- **Google Maps**: $200/month free credit
- **WeatherAPI**: 1M calls/month free
- **Vertex AI**: Pay-per-use (estimate $0.01-0.05 per itinerary)

## 🚨 Troubleshooting

### Common Issues
1. **CORS errors**: Check domain restrictions
2. **API key invalid**: Verify key restrictions match your setup
3. **Quota exceeded**: Check API usage in Google Cloud Console
4. **Firebase connection failed**: Verify project configuration

### Getting Help
1. Check Google Cloud Console error logs
2. Review Firebase Console for authentication issues
3. Monitor API usage and quotas
4. Check browser developer tools for client-side errors

---

**⚠️ Important**: Keep this document updated as you add new API keys or change configurations. Never share actual API keys in documentation or code repositories.
