import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { Analytics } from '@/types';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Clear the current user ID
   */
  clearUserId(): void {
    this.userId = undefined;
  }

  /**
   * Track a generic event
   */
  async trackEvent(event: string, properties?: Record<string, any>): Promise<void> {
    try {
      const logFunction = httpsCallable(functions, 'logEvent');
      
      await logFunction({
        eventType: event,
        data: {
          ...properties,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          deviceType: this.getDeviceType()
        },
        userId: this.userId
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  /**
   * Track page view
   */
  async trackPageView(page: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      page,
      title: title || document.title,
      referrer: document.referrer
    });
  }

  /**
   * Track itinerary generation
   */
  async trackItineraryGeneration(
    destination: string,
    duration: number,
    preferences: string[]
  ): Promise<void> {
    await this.trackEvent('itinerary_generated', {
      destination,
      duration,
      preferences,
      generationTime: Date.now()
    });
  }

  /**
   * Track user interaction
   */
  async trackUserInteraction(
    action: string,
    target: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('user_interaction', {
      action,
      target,
      ...metadata
    });
  }

  /**
   * Track button click
   */
  async trackButtonClick(buttonName: string, context?: string): Promise<void> {
    await this.trackUserInteraction('click', 'button', {
      buttonName,
      context
    });
  }

  /**
   * Track form submission
   */
  async trackFormSubmission(formName: string, success: boolean, errors?: string[]): Promise<void> {
    await this.trackEvent('form_submission', {
      formName,
      success,
      errors: errors || [],
      timestamp: Date.now()
    });
  }

  /**
   * Track search
   */
  async trackSearch(query: string, results: number, filters?: Record<string, any>): Promise<void> {
    await this.trackEvent('search', {
      query,
      results,
      filters: filters || {},
      timestamp: Date.now()
    });
  }

  /**
   * Track error
   */
  async trackError(
    error: string,
    context: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('error', {
      error,
      context,
      stack: metadata?.stack,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent('feature_usage', {
      feature,
      action,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    type: 'signup' | 'itinerary_created' | 'itinerary_completed',
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('conversion', {
      type,
      value: value || 0,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(
    metric: string,
    value: number,
    unit: string = 'ms'
  ): Promise<void> {
    await this.trackEvent('performance', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    });
  }

  /**
   * Track user preferences update
   */
  async trackPreferencesUpdate(
    preferences: Record<string, any>,
    source: 'onboarding' | 'settings' | 'itinerary_modification'
  ): Promise<void> {
    await this.trackEvent('preferences_updated', {
      preferences,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track weather adaptation
   */
  async trackWeatherAdaptation(
    itineraryId: string,
    adaptations: number,
    weatherCondition: string
  ): Promise<void> {
    await this.trackEvent('weather_adaptation', {
      itineraryId,
      adaptations,
      weatherCondition,
      timestamp: Date.now()
    });
  }

  /**
   * Track map interaction
   */
  async trackMapInteraction(
    action: 'zoom' | 'pan' | 'marker_click' | 'route_view',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('map_interaction', {
      action,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Track booking attempt
   */
  async trackBookingAttempt(
    activityId: string,
    activityName: string,
    success: boolean
  ): Promise<void> {
    await this.trackEvent('booking_attempt', {
      activityId,
      activityName,
      success,
      timestamp: Date.now()
    });
  }

  /**
   * Track export action
   */
  async trackExport(
    format: 'json' | 'pdf' | 'calendar',
    itineraryId: string
  ): Promise<void> {
    await this.trackEvent('export', {
      format,
      itineraryId,
      timestamp: Date.now()
    });
  }

  /**
   * Track session duration when user leaves
   */
  trackSessionEnd(): void {
    const sessionStart = sessionStorage.getItem('sessionStart');
    if (sessionStart) {
      const duration = Date.now() - parseInt(sessionStart);
      this.trackEvent('session_end', {
        duration,
        sessionId: this.sessionId
      });
    }
  }

  /**
   * Initialize session tracking
   */
  initializeSession(): void {
    // Store session start time
    if (!sessionStorage.getItem('sessionStart')) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
    }

    // Track session start
    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { timestamp: Date.now() });
      } else {
        this.trackEvent('page_visible', { timestamp: Date.now() });
      }
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Get user location (with permission)
   */
  private async getUserLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  }

  /**
   * Batch events for better performance
   */
  private eventQueue: Analytics[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  /**
   * Add event to batch queue
   */
  private queueEvent(event: Analytics): void {
    this.eventQueue.push(event);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushEventQueue();
    }, 1000); // Flush every second
  }

  /**
   * Flush event queue
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const logFunction = httpsCallable(functions, 'logEventBatch');
      await logFunction({ events });
    } catch (error) {
      console.error('Error flushing event queue:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
