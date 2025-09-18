import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// CORS configuration
const corsHandler = cors({ origin: true });

// Import function modules
import { generateItinerary } from './services/itinerary-generator';
import { enrichWithMapsData } from './services/maps-service';
import { logAnalyticsEvent } from './services/analytics-service';
import { createUserProfile } from './services/user-service';
import { getWeatherData, updateItineraryForWeather } from './services/weather-service';

// User Management Functions
export const onUserCreate = functions.auth.user().onCreate(createUserProfile);

// Itinerary Generation Functions
export const generateTravelItinerary = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }

        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const { destination, dates, preferences } = req.body;

        if (!destination || !dates || !preferences) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        // Generate itinerary using Gemini
        const baseItinerary = await generateItinerary({
          destination,
          dates,
          preferences,
          userId
        });

        // Enrich with Google Maps data
        const enrichedItinerary = await enrichWithMapsData(baseItinerary);

        // Get weather data and adapt if necessary
        const weatherAdaptedItinerary = await updateItineraryForWeather(enrichedItinerary);

        // Save to Firestore
        const itineraryRef = await admin.firestore().collection('itineraries').add({
          ...weatherAdaptedItinerary,
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log analytics event
        await logAnalyticsEvent({
          userId,
          eventType: 'itinerary_generated',
          data: {
            destination: destination.city,
            duration: dates.duration,
            preferences: preferences.interests
          }
        });

        res.status(200).json({
          success: true,
          itineraryId: itineraryRef.id,
          itinerary: weatherAdaptedItinerary
        });

      } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({ 
          error: 'Failed to generate itinerary',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  });

// Weather Update Functions
export const updateWeatherData = functions
  .region('us-central1')
  .pubsub.schedule('every 6 hours')
  .onRun(async (context) => {
    try {
      // Get all active itineraries
      const activeItineraries = await admin.firestore()
        .collection('itineraries')
        .where('status', '==', 'active')
        .get();

      const updatePromises = activeItineraries.docs.map(async (doc) => {
        const itinerary = doc.data();
        const updatedItinerary = await updateItineraryForWeather(itinerary);
        
        if (JSON.stringify(updatedItinerary) !== JSON.stringify(itinerary)) {
          await doc.ref.update({
            ...updatedItinerary,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Log weather adaptation
          await logAnalyticsEvent({
            userId: itinerary.userId,
            eventType: 'weather_adaptation',
            data: {
              itineraryId: doc.id,
              destination: itinerary.destination.city
            }
          });
        }
      });

      await Promise.all(updatePromises);
      console.log(`Updated weather data for ${activeItineraries.size} itineraries`);
    } catch (error) {
      console.error('Error updating weather data:', error);
    }
  });

// Analytics Functions
export const logEvent = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { eventType, data, userId } = req.body;

        if (!eventType) {
          res.status(400).json({ error: 'Event type is required' });
          return;
        }

        await logAnalyticsEvent({
          userId,
          eventType,
          data: data || {}
        });

        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error logging event:', error);
        res.status(500).json({ error: 'Failed to log event' });
      }
    });
  });

// Health Check Function
export const healthCheck = functions
  .region('us-central1')
  .https.onRequest((req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
