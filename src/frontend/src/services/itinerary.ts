import { httpsCallable } from 'firebase/functions';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { functions, db } from './firebase';
import { 
  Itinerary, 
  ItineraryGenerationRequest, 
  ApiResponse, 
  UserPreferences 
} from '@/types';

export class ItineraryService {
  private static instance: ItineraryService;

  static getInstance(): ItineraryService {
    if (!ItineraryService.instance) {
      ItineraryService.instance = new ItineraryService();
    }
    return ItineraryService.instance;
  }

  /**
   * Generate a new itinerary
   */
  async generateItinerary(request: ItineraryGenerationRequest): Promise<Itinerary> {
    try {
      const generateFunction = httpsCallable(functions, 'generateTravelItinerary');
      
      const result = await generateFunction(request);
      const data = result.data as ApiResponse<{ itinerary: Itinerary; itineraryId: string }>;

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to generate itinerary');
      }

      // Convert Firestore timestamps to Date objects
      const itinerary = this.convertTimestamps(data.data.itinerary);
      return { ...itinerary, id: data.data.itineraryId };
    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      throw new Error(error.message || 'Failed to generate itinerary');
    }
  }

  /**
   * Get user's itineraries
   */
  async getUserItineraries(userId: string): Promise<Itinerary[]> {
    try {
      const itinerariesRef = collection(db, 'itineraries');
      const q = query(
        itinerariesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const itineraries: Itinerary[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const itinerary = this.convertTimestamps({
          id: doc.id,
          ...data
        } as Itinerary);
        itineraries.push(itinerary);
      });

      return itineraries;
    } catch (error) {
      console.error('Error getting user itineraries:', error);
      throw new Error('Failed to load itineraries');
    }
  }

  /**
   * Get a specific itinerary
   */
  async getItinerary(itineraryId: string): Promise<Itinerary | null> {
    try {
      const itineraryRef = doc(db, 'itineraries', itineraryId);
      const itinerarySnap = await getDoc(itineraryRef);

      if (!itinerarySnap.exists()) {
        return null;
      }

      const data = itinerarySnap.data();
      return this.convertTimestamps({
        id: itinerarySnap.id,
        ...data
      } as Itinerary);
    } catch (error) {
      console.error('Error getting itinerary:', error);
      throw new Error('Failed to load itinerary');
    }
  }

  /**
   * Update itinerary status
   */
  async updateItineraryStatus(
    itineraryId: string, 
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<void> {
    try {
      const itineraryRef = doc(db, 'itineraries', itineraryId);
      await updateDoc(itineraryRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating itinerary status:', error);
      throw new Error('Failed to update itinerary status');
    }
  }

  /**
   * Update itinerary preferences and regenerate
   */
  async updateItineraryPreferences(
    itineraryId: string,
    preferences: Partial<UserPreferences>
  ): Promise<Itinerary> {
    try {
      // Get current itinerary
      const currentItinerary = await this.getItinerary(itineraryId);
      if (!currentItinerary) {
        throw new Error('Itinerary not found');
      }

      // Create new generation request with updated preferences
      const request: ItineraryGenerationRequest = {
        destination: {
          city: currentItinerary.destination.city,
          country: currentItinerary.destination.country
        },
        dates: {
          startDate: currentItinerary.dates.startDate.toISOString().split('T')[0],
          endDate: currentItinerary.dates.endDate.toISOString().split('T')[0],
          duration: currentItinerary.dates.duration
        },
        preferences: {
          ...currentItinerary.preferences,
          ...preferences
        }
      };

      // Generate new itinerary
      const newItinerary = await this.generateItinerary(request);

      // Update the existing document
      const itineraryRef = doc(db, 'itineraries', itineraryId);
      await updateDoc(itineraryRef, {
        ...newItinerary,
        id: itineraryId, // Keep the same ID
        metadata: {
          ...newItinerary.metadata,
          userModifications: (currentItinerary.metadata.userModifications || 0) + 1
        },
        updatedAt: Timestamp.now()
      });

      return { ...newItinerary, id: itineraryId };
    } catch (error) {
      console.error('Error updating itinerary preferences:', error);
      throw new Error('Failed to update itinerary preferences');
    }
  }

  /**
   * Delete an itinerary
   */
  async deleteItinerary(itineraryId: string): Promise<void> {
    try {
      const itineraryRef = doc(db, 'itineraries', itineraryId);
      await deleteDoc(itineraryRef);
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw new Error('Failed to delete itinerary');
    }
  }

  /**
   * Get itineraries by destination
   */
  async getItinerariesByDestination(city: string, country: string): Promise<Itinerary[]> {
    try {
      const itinerariesRef = collection(db, 'itineraries');
      const q = query(
        itinerariesRef,
        where('destination.city', '==', city),
        where('destination.country', '==', country),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const itineraries: Itinerary[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const itinerary = this.convertTimestamps({
          id: doc.id,
          ...data
        } as Itinerary);
        itineraries.push(itinerary);
      });

      return itineraries;
    } catch (error) {
      console.error('Error getting itineraries by destination:', error);
      throw new Error('Failed to load destination itineraries');
    }
  }

  /**
   * Get popular destinations
   */
  async getPopularDestinations(): Promise<Array<{ city: string; country: string; count: number }>> {
    try {
      // This would typically be done with a more complex query or aggregation
      // For now, we'll get recent itineraries and count destinations
      const itinerariesRef = collection(db, 'itineraries');
      const q = query(
        itinerariesRef,
        where('status', 'in', ['active', 'completed']),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const destinationCounts: Record<string, { city: string; country: string; count: number }> = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const key = `${data.destination.city}, ${data.destination.country}`;
        
        if (destinationCounts[key]) {
          destinationCounts[key].count++;
        } else {
          destinationCounts[key] = {
            city: data.destination.city,
            country: data.destination.country,
            count: 1
          };
        }
      });

      return Object.values(destinationCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 destinations
    } catch (error) {
      console.error('Error getting popular destinations:', error);
      return [];
    }
  }

  /**
   * Convert Firestore timestamps to Date objects
   */
  private convertTimestamps(itinerary: any): Itinerary {
    return {
      ...itinerary,
      createdAt: itinerary.createdAt?.toDate?.() || new Date(itinerary.createdAt),
      updatedAt: itinerary.updatedAt?.toDate?.() || new Date(itinerary.updatedAt),
      dates: {
        ...itinerary.dates,
        startDate: itinerary.dates.startDate?.toDate?.() || new Date(itinerary.dates.startDate),
        endDate: itinerary.dates.endDate?.toDate?.() || new Date(itinerary.dates.endDate)
      },
      days: itinerary.days?.map((day: any) => ({
        ...day,
        date: day.date?.toDate?.() || new Date(day.date)
      })) || []
    };
  }

  /**
   * Calculate itinerary statistics
   */
  calculateStatistics(itinerary: Itinerary): {
    totalCost: number;
    totalDuration: number;
    activitiesCount: number;
    averageCostPerDay: number;
    weatherDependentActivities: number;
  } {
    const totalCost = itinerary.days.reduce((sum, day) => sum + day.totalEstimatedCost, 0);
    const totalDuration = itinerary.dates.duration;
    const activitiesCount = itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
    const averageCostPerDay = totalCost / totalDuration;
    const weatherDependentActivities = itinerary.days.reduce(
      (sum, day) => sum + day.activities.filter(activity => activity.weatherDependent).length,
      0
    );

    return {
      totalCost,
      totalDuration,
      activitiesCount,
      averageCostPerDay,
      weatherDependentActivities
    };
  }

  /**
   * Export itinerary to different formats
   */
  exportItinerary(itinerary: Itinerary, format: 'json' | 'pdf' | 'calendar'): string | Blob {
    switch (format) {
      case 'json':
        return JSON.stringify(itinerary, null, 2);
      
      case 'pdf':
        // This would require a PDF generation library
        throw new Error('PDF export not implemented yet');
      
      case 'calendar':
        // Generate ICS format for calendar import
        return this.generateICSFormat(itinerary);
      
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Generate ICS calendar format
   */
  private generateICSFormat(itinerary: Itinerary): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:-//SoloAI//Travel Itinerary//EN\n';
    ics += `X-WR-CALNAME:${itinerary.title}\n`;

    itinerary.days.forEach((day) => {
      day.activities.forEach((activity) => {
        const startDateTime = new Date(day.date);
        const [startHour, startMinute] = activity.timing.startTime.split(':');
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + activity.timing.duration);

        ics += 'BEGIN:VEVENT\n';
        ics += `UID:${activity.id}@soloai.travel\n`;
        ics += `DTSTART:${formatDate(startDateTime)}\n`;
        ics += `DTEND:${formatDate(endDateTime)}\n`;
        ics += `SUMMARY:${activity.name}\n`;
        ics += `DESCRIPTION:${activity.description}\n`;
        ics += `LOCATION:${activity.location.address}\n`;
        ics += 'END:VEVENT\n';
      });
    });

    ics += 'END:VCALENDAR\n';
    return ics;
  }
}

// Export singleton instance
export const itineraryService = ItineraryService.getInstance();
