import { useState, useEffect } from 'react';
import { Itinerary, ItineraryGenerationRequest, LoadingState } from '@/types';
import { itineraryService } from '@/services/itinerary';
import { analyticsService } from '@/services/analytics';

interface UseItineraryReturn {
  itineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  loading: LoadingState;
  generateItinerary: (request: ItineraryGenerationRequest) => Promise<Itinerary>;
  getItinerary: (id: string) => Promise<Itinerary | null>;
  updateItineraryStatus: (id: string, status: Itinerary['status']) => Promise<void>;
  updateItineraryPreferences: (id: string, preferences: Partial<Itinerary['preferences']>) => Promise<Itinerary>;
  deleteItinerary: (id: string) => Promise<void>;
  refreshItineraries: () => Promise<void>;
  exportItinerary: (itinerary: Itinerary, format: 'json' | 'pdf' | 'calendar') => string | Blob;
  getPopularDestinations: () => Promise<Array<{ city: string; country: string; count: number }>>;
}

export const useItinerary = (userId?: string): UseItineraryReturn => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: undefined,
    progress: 0
  });

  // Load user's itineraries on mount
  useEffect(() => {
    if (userId) {
      refreshItineraries();
    }
  }, [userId]);

  const refreshItineraries = async (): Promise<void> => {
    if (!userId) return;

    try {
      setLoading({ isLoading: true, progress: 0 });
      const userItineraries = await itineraryService.getUserItineraries(userId);
      setItineraries(userItineraries);
      setLoading({ isLoading: false, progress: 100 });
    } catch (error: any) {
      setLoading({ 
        isLoading: false, 
        error: error.message,
        progress: 0 
      });
      analyticsService.trackError(error.message, 'itinerary_load');
    }
  };

  const generateItinerary = async (request: ItineraryGenerationRequest): Promise<Itinerary> => {
    try {
      setLoading({ isLoading: true, progress: 0 });
      
      // Track generation start
      const startTime = Date.now();
      analyticsService.trackEvent('itinerary_generation_started', {
        destination: `${request.destination.city}, ${request.destination.country}`,
        duration: request.dates.duration,
        preferences: request.preferences
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoading(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 500);

      const itinerary = await itineraryService.generateItinerary(request);
      
      clearInterval(progressInterval);
      setLoading({ isLoading: false, progress: 100 });

      // Update local state
      setItineraries(prev => [itinerary, ...prev]);
      setCurrentItinerary(itinerary);

      // Track successful generation
      const generationTime = Date.now() - startTime;
      analyticsService.trackItineraryGeneration(
        `${request.destination.city}, ${request.destination.country}`,
        request.dates.duration,
        request.preferences.interests
      );
      analyticsService.trackPerformance('itinerary_generation_time', generationTime);

      return itinerary;
    } catch (error: any) {
      setLoading({ 
        isLoading: false, 
        error: error.message,
        progress: 0 
      });
      
      analyticsService.trackError(error.message, 'itinerary_generation', {
        destination: `${request.destination.city}, ${request.destination.country}`,
        duration: request.dates.duration
      });
      
      throw error;
    }
  };

  const getItinerary = async (id: string): Promise<Itinerary | null> => {
    try {
      setLoading({ isLoading: true, progress: 50 });
      
      const itinerary = await itineraryService.getItinerary(id);
      setCurrentItinerary(itinerary);
      setLoading({ isLoading: false, progress: 100 });
      
      if (itinerary) {
        analyticsService.trackEvent('itinerary_viewed', {
          itineraryId: id,
          destination: `${itinerary.destination.city}, ${itinerary.destination.country}`,
          status: itinerary.status
        });
      }
      
      return itinerary;
    } catch (error: any) {
      setLoading({ 
        isLoading: false, 
        error: error.message,
        progress: 0 
      });
      
      analyticsService.trackError(error.message, 'itinerary_fetch', { itineraryId: id });
      throw error;
    }
  };

  const updateItineraryStatus = async (
    id: string, 
    status: Itinerary['status']
  ): Promise<void> => {
    try {
      await itineraryService.updateItineraryStatus(id, status);
      
      // Update local state
      setItineraries(prev => 
        prev.map(itinerary => 
          itinerary.id === id ? { ...itinerary, status } : itinerary
        )
      );
      
      if (currentItinerary?.id === id) {
        setCurrentItinerary(prev => prev ? { ...prev, status } : null);
      }
      
      analyticsService.trackEvent('itinerary_status_updated', {
        itineraryId: id,
        newStatus: status,
        previousStatus: itineraries.find(i => i.id === id)?.status
      });
    } catch (error: any) {
      analyticsService.trackError(error.message, 'itinerary_status_update', {
        itineraryId: id,
        status
      });
      throw error;
    }
  };

  const updateItineraryPreferences = async (
    id: string,
    preferences: Partial<Itinerary['preferences']>
  ): Promise<Itinerary> => {
    try {
      setLoading({ isLoading: true, progress: 0 });
      
      const updatedItinerary = await itineraryService.updateItineraryPreferences(id, preferences);
      
      // Update local state
      setItineraries(prev => 
        prev.map(itinerary => 
          itinerary.id === id ? updatedItinerary : itinerary
        )
      );
      
      if (currentItinerary?.id === id) {
        setCurrentItinerary(updatedItinerary);
      }
      
      setLoading({ isLoading: false, progress: 100 });
      
      analyticsService.trackPreferencesUpdate(preferences, 'itinerary_modification');
      analyticsService.trackEvent('itinerary_regenerated', {
        itineraryId: id,
        updatedPreferences: Object.keys(preferences)
      });
      
      return updatedItinerary;
    } catch (error: any) {
      setLoading({ 
        isLoading: false, 
        error: error.message,
        progress: 0 
      });
      
      analyticsService.trackError(error.message, 'itinerary_preferences_update', {
        itineraryId: id,
        preferences
      });
      
      throw error;
    }
  };

  const deleteItinerary = async (id: string): Promise<void> => {
    try {
      await itineraryService.deleteItinerary(id);
      
      // Update local state
      setItineraries(prev => prev.filter(itinerary => itinerary.id !== id));
      
      if (currentItinerary?.id === id) {
        setCurrentItinerary(null);
      }
      
      analyticsService.trackEvent('itinerary_deleted', {
        itineraryId: id
      });
    } catch (error: any) {
      analyticsService.trackError(error.message, 'itinerary_delete', {
        itineraryId: id
      });
      throw error;
    }
  };

  const exportItinerary = (
    itinerary: Itinerary, 
    format: 'json' | 'pdf' | 'calendar'
  ): string | Blob => {
    try {
      const result = itineraryService.exportItinerary(itinerary, format);
      
      analyticsService.trackExport(format, itinerary.id);
      
      return result;
    } catch (error: any) {
      analyticsService.trackError(error.message, 'itinerary_export', {
        itineraryId: itinerary.id,
        format
      });
      throw error;
    }
  };

  const getPopularDestinations = async (): Promise<Array<{ city: string; country: string; count: number }>> => {
    try {
      const destinations = await itineraryService.getPopularDestinations();
      
      analyticsService.trackEvent('popular_destinations_viewed', {
        count: destinations.length
      });
      
      return destinations;
    } catch (error: any) {
      analyticsService.trackError(error.message, 'popular_destinations_fetch');
      return [];
    }
  };

  // Helper function to get itinerary statistics
  const getItineraryStatistics = (itinerary: Itinerary) => {
    return itineraryService.calculateStatistics(itinerary);
  };

  // Helper function to check if itinerary needs weather update
  const needsWeatherUpdate = (itinerary: Itinerary): boolean => {
    const now = new Date();
    const startDate = itinerary.dates.startDate;
    const daysDifference = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Update weather if trip is within 7 days
    return daysDifference <= 7 && daysDifference >= 0;
  };

  return {
    itineraries,
    currentItinerary,
    loading,
    generateItinerary,
    getItinerary,
    updateItineraryStatus,
    updateItineraryPreferences,
    deleteItinerary,
    refreshItineraries,
    exportItinerary,
    getPopularDestinations
  };
};
