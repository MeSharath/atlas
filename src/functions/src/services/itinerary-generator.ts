import { VertexAI } from '@google-cloud/vertexai';
import * as functions from 'firebase-functions';
import { 
  ItineraryGenerationRequest, 
  Itinerary, 
  Activity, 
  DayPlan,
  GeminiResponse 
} from '../types';

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1'
});

const model = vertexAI.preview.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-pro'
});

/**
 * Generates a travel itinerary using Gemini Pro
 */
export const generateItinerary = async (
  request: ItineraryGenerationRequest
): Promise<Partial<Itinerary>> => {
  try {
    const startTime = Date.now();
    
    const prompt = buildItineraryPrompt(request);
    
    functions.logger.info(`Generating itinerary for ${request.destination.city}`);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response generated from Gemini');
    }

    // Parse the JSON response
    const parsedResponse = parseGeminiResponse(generatedText);
    
    // Convert to our itinerary format
    const itinerary = convertToItinerary(parsedResponse, request);
    
    const generationTime = Date.now() - startTime;
    
    functions.logger.info(`Generated itinerary in ${generationTime}ms`);
    
    return {
      ...itinerary,
      metadata: {
        generatedBy: 'gemini-pro',
        generationTime,
        version: '1.0',
        totalEstimatedCost: calculateTotalCost(itinerary.days || []),
        currency: getCurrencyForDestination(request.destination.country),
        weatherAdaptations: 0,
        userModifications: 0
      }
    };
    
  } catch (error) {
    functions.logger.error('Error generating itinerary:', error);
    throw new Error(`Failed to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Builds the prompt for Gemini based on user preferences
 */
function buildItineraryPrompt(request: ItineraryGenerationRequest): string {
  const { destination, dates, preferences } = request;
  
  return `
You are an expert travel planner specializing in solo travel. Create a detailed ${dates.duration}-day itinerary for a solo traveler visiting ${destination.city}, ${destination.country}.

TRAVELER PROFILE:
- Travel Style: ${preferences.travelStyle}
- Interests: ${preferences.interests.join(', ')}
- Budget: ${preferences.budgetRange}
- Accommodation Preference: ${preferences.accommodationType}
- Transport Preference: ${preferences.transportPreference}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Language: ${preferences.languagePreference}

REQUIREMENTS:
1. Prioritize solo-friendly activities and accommodations
2. Include safety considerations for solo travelers
3. Provide realistic timing and costs
4. Include a mix of must-see attractions and local experiences
5. Consider weather-dependent activities and provide indoor alternatives
6. Include practical details like opening hours and booking requirements

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:

{
  "title": "Solo Adventure in [City Name]",
  "days": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "name": "Activity Name",
          "description": "Detailed description including why it's good for solo travelers",
          "category": "museum|restaurant|attraction|shopping|entertainment|transport|accommodation",
          "location": "Specific address or area name",
          "startTime": "09:00",
          "endTime": "11:00",
          "estimatedCost": 25,
          "soloFriendly": true,
          "weatherDependent": false,
          "safetyRating": 5,
          "bookingRequired": false
        }
      ]
    }
  ]
}

Make sure the JSON is valid and complete. Include 6-8 activities per day, with realistic timing and costs in local currency.
`;
}

/**
 * Parses the Gemini response and extracts JSON
 */
function parseGeminiResponse(response: string): GeminiResponse {
  try {
    // Clean the response to extract JSON
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Parse JSON
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.title || !parsed.days || !Array.isArray(parsed.days)) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return { itinerary: parsed };
  } catch (error) {
    functions.logger.error('Error parsing Gemini response:', error);
    functions.logger.error('Raw response:', response);
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

/**
 * Converts Gemini response to our itinerary format
 */
function convertToItinerary(
  geminiResponse: GeminiResponse,
  request: ItineraryGenerationRequest
): Partial<Itinerary> {
  const { itinerary } = geminiResponse;
  
  const days: DayPlan[] = itinerary.days.map((day, index) => {
    const dayDate = new Date(request.dates.startDate);
    dayDate.setDate(dayDate.getDate() + index);
    
    const activities: Activity[] = day.activities.map((activity, actIndex) => ({
      id: `${day.dayNumber}-${actIndex}`,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      location: {
        name: activity.location,
        address: activity.location,
        coordinates: { lat: 0, lng: 0 }, // Will be filled by Maps service
      },
      timing: {
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: calculateDuration(activity.startTime, activity.endTime)
      },
      cost: {
        estimated: activity.estimatedCost,
        currency: getCurrencyForDestination(request.destination.country)
      },
      booking: {
        required: activity.bookingRequired || false
      },
      soloFriendly: activity.soloFriendly,
      safetyRating: activity.safetyRating || 4,
      weatherDependent: activity.weatherDependent
    }));
    
    return {
      dayNumber: day.dayNumber,
      date: admin.firestore.Timestamp.fromDate(dayDate),
      activities,
      totalEstimatedCost: activities.reduce((sum, act) => sum + act.cost.estimated, 0),
      totalTravelTime: 0 // Will be calculated by Maps service
    };
  });
  
  return {
    title: itinerary.title,
    destination: request.destination,
    dates: {
      startDate: admin.firestore.Timestamp.fromDate(new Date(request.dates.startDate)),
      endDate: admin.firestore.Timestamp.fromDate(new Date(request.dates.endDate)),
      duration: request.dates.duration
    },
    status: 'draft',
    days,
    preferences: request.preferences
  };
}

/**
 * Calculates duration between two time strings
 */
function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60)); // minutes
}

/**
 * Calculates total cost for all days
 */
function calculateTotalCost(days: DayPlan[]): number {
  return days.reduce((total, day) => total + day.totalEstimatedCost, 0);
}

/**
 * Gets currency code for a country
 */
function getCurrencyForDestination(country: string): string {
  const currencyMap: Record<string, string> = {
    'United States': 'USD',
    'United Kingdom': 'GBP',
    'France': 'EUR',
    'Germany': 'EUR',
    'Italy': 'EUR',
    'Spain': 'EUR',
    'Japan': 'JPY',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'India': 'INR',
    'Thailand': 'THB',
    'Singapore': 'SGD'
  };
  
  return currencyMap[country] || 'USD';
}

// Import admin for Timestamp
import * as admin from 'firebase-admin';
