import { BigQuery } from '@google-cloud/bigquery';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { AnalyticsEvent } from '../types';

// Initialize BigQuery
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

const DATASET_ID = process.env.BIGQUERY_DATASET_ID || 'soloai_analytics';
const TABLE_ID = process.env.BIGQUERY_TABLE_ID || 'user_interactions';

/**
 * Logs an analytics event to both Firestore and BigQuery
 */
export const logAnalyticsEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const sessionId = event.sessionId || generateSessionId();

    // Create event document for Firestore
    const eventDoc = {
      userId: event.userId,
      sessionId,
      eventType: event.eventType,
      timestamp,
      data: event.data,
      metadata: {
        ...event.metadata,
        serverTimestamp: new Date().toISOString()
      }
    };

    // Log to Firestore
    await admin.firestore()
      .collection('analytics')
      .add(eventDoc);

    // Log to BigQuery (async, don't wait)
    logToBigQuery(eventDoc).catch(error => {
      functions.logger.error('Error logging to BigQuery:', error);
    });

    functions.logger.info(`Logged analytics event: ${event.eventType}`);

  } catch (error) {
    functions.logger.error('Error logging analytics event:', error);
    throw error;
  }
};

/**
 * Logs event to BigQuery
 */
async function logToBigQuery(event: any): Promise<void> {
  try {
    const dataset = bigquery.dataset(DATASET_ID);
    const table = dataset.table(TABLE_ID);

    // Transform event for BigQuery schema
    const row = {
      user_id: event.userId || null,
      session_id: event.sessionId,
      event_type: event.eventType,
      timestamp: new Date().toISOString(),
      event_data: JSON.stringify(event.data),
      user_agent: event.metadata?.userAgent || null,
      device_type: event.metadata?.deviceType || null,
      location: event.metadata?.location || null
    };

    await table.insert([row]);
    functions.logger.info('Successfully logged to BigQuery');

  } catch (error) {
    functions.logger.error('BigQuery insert error:', error);
    throw error;
  }
}

/**
 * Creates BigQuery dataset and table if they don't exist
 */
export const initializeBigQueryResources = async (): Promise<void> => {
  try {
    const dataset = bigquery.dataset(DATASET_ID);
    
    // Check if dataset exists
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      await dataset.create({
        location: 'US'
      });
      functions.logger.info(`Created BigQuery dataset: ${DATASET_ID}`);
    }

    // Define table schema
    const schema = [
      { name: 'user_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'session_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'event_type', type: 'STRING', mode: 'REQUIRED' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'event_data', type: 'JSON', mode: 'NULLABLE' },
      { name: 'user_agent', type: 'STRING', mode: 'NULLABLE' },
      { name: 'device_type', type: 'STRING', mode: 'NULLABLE' },
      { name: 'location', type: 'STRING', mode: 'NULLABLE' }
    ];

    const table = dataset.table(TABLE_ID);
    const [tableExists] = await table.exists();
    
    if (!tableExists) {
      await table.create({
        schema: schema,
        timePartitioning: {
          type: 'DAY',
          field: 'timestamp'
        }
      });
      functions.logger.info(`Created BigQuery table: ${TABLE_ID}`);
    }

  } catch (error) {
    functions.logger.error('Error initializing BigQuery resources:', error);
    throw error;
  }
};

/**
 * Generates a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Logs itinerary generation event
 */
export const logItineraryGeneration = async (
  userId: string,
  destination: string,
  duration: number,
  preferences: string[]
): Promise<void> => {
  await logAnalyticsEvent({
    userId,
    eventType: 'itinerary_generated',
    data: {
      destination,
      duration,
      preferences,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Logs weather adaptation event
 */
export const logWeatherAdaptation = async (
  userId: string,
  itineraryId: string,
  adaptations: number
): Promise<void> => {
  await logAnalyticsEvent({
    userId,
    eventType: 'weather_adaptation',
    data: {
      itineraryId,
      adaptations,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Logs user interaction event
 */
export const logUserInteraction = async (
  userId: string,
  action: string,
  target: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await logAnalyticsEvent({
    userId,
    eventType: 'user_interaction',
    data: {
      action,
      target,
      ...metadata,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Logs error event
 */
export const logError = async (
  userId: string | undefined,
  error: string,
  context: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await logAnalyticsEvent({
    userId,
    eventType: 'error',
    data: {
      error,
      context,
      ...metadata,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Gets analytics summary for a user
 */
export const getUserAnalyticsSummary = async (userId: string): Promise<any> => {
  try {
    const query = `
      SELECT 
        event_type,
        COUNT(*) as count,
        DATE(timestamp) as date
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE user_id = @userId
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY event_type, DATE(timestamp)
      ORDER BY date DESC, count DESC
    `;

    const options = {
      query,
      params: { userId }
    };

    const [rows] = await bigquery.query(options);
    return rows;

  } catch (error) {
    functions.logger.error('Error getting user analytics summary:', error);
    throw error;
  }
};

/**
 * Gets platform analytics summary
 */
export const getPlatformAnalyticsSummary = async (): Promise<any> => {
  try {
    const query = `
      SELECT 
        event_type,
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        DATE(timestamp) as date
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY event_type, DATE(timestamp)
      ORDER BY date DESC, total_events DESC
    `;

    const [rows] = await bigquery.query(query);
    return rows;

  } catch (error) {
    functions.logger.error('Error getting platform analytics summary:', error);
    throw error;
  }
};
