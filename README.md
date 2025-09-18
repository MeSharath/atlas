# SoloAI - AI-Powered Travel Planner

An intelligent travel planning application designed specifically for solo travelers, leveraging Google's AI and cloud ecosystem.

## 🌟 Features

- **Personalized Itinerary Generation**: AI-powered travel plans based on your preferences
- **Real-time Weather Adaptation**: Dynamic itinerary adjustments based on weather conditions
- **Interactive Maps**: Visual representation of your travel route and destinations
- **Solo Traveler Safety**: Prioritizes safe and solo-friendly accommodations and activities
- **Adaptive Planning**: Modify preferences during your trip for real-time itinerary updates

## 🛠️ Tech Stack

- **AI & ML**: Vertex AI (Gemini Pro) for natural language processing
- **Maps & Location**: Google Maps API for geocoding, places, and directions
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Frontend**: React with Firebase Hosting
- **Analytics**: BigQuery for data insights
- **Weather**: Weather API integration

## 📁 Project Structure

```
atlas/
├── src/
│   ├── frontend/          # React frontend application
│   ├── functions/         # Firebase Cloud Functions
│   └── shared/           # Shared utilities and types
├── docs/                 # Documentation
├── specs/               # Technical specifications
├── tests/               # Test files
└── scripts/             # Build and deployment scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Google Cloud Account with billing enabled
- Firebase CLI installed

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Cloud Project**
   - Enable Vertex AI API
   - Enable Google Maps Platform APIs
   - Enable BigQuery API
   - Create service account credentials

4. **Setup Firebase**
   ```bash
   firebase login
   firebase init
   ```

5. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add your API keys and configuration

## 📋 Development Phases

### Phase 1: Foundation Setup
- [x] Project initialization
- [ ] Google Cloud Project setup
- [ ] Firebase project configuration
- [ ] Data model design

### Phase 2: Backend Development
- [ ] User authentication service
- [ ] Itinerary generation API (Gemini integration)
- [ ] Google Maps API integration
- [ ] Weather API integration

### Phase 3: Frontend Development
- [ ] React application setup
- [ ] User preference input forms
- [ ] Itinerary display with maps
- [ ] Real-time updates interface

### Phase 4: Integration & Analytics
- [ ] End-to-end integration
- [ ] BigQuery data logging
- [ ] Testing and optimization

## 🧪 Testing

Run the test suite:
```bash
npm test
```

For end-to-end testing:
```bash
npm run test:e2e
```

## 🚀 Deployment

Deploy to Firebase:
```bash
npm run deploy
```

## 📊 Success Metrics

- Generate complete 3-day itineraries for specified cities
- Real-time weather adaptation within 5 minutes
- 80% user satisfaction with personalized recommendations
- Sub-15 second response time for itinerary generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.
