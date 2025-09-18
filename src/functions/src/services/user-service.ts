import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { UserRecord } from 'firebase-functions/v1/auth';
import { User, UserPreferences, UserProfile } from '../types';

/**
 * Creates a user profile in Firestore when a new user signs up
 */
export const createUserProfile = async (user: UserRecord): Promise<void> => {
  try {
    const defaultPreferences: UserPreferences = {
      travelStyle: 'cultural',
      interests: ['museums', 'local-food', 'walking-tours'],
      budgetRange: 'mid-range',
      accommodationType: 'hotel',
      transportPreference: 'public-transport',
      languagePreference: 'en'
    };

    const defaultProfile: UserProfile = {
      travelExperience: 'intermediate',
      safetyPriority: 'medium'
    };

    const userDoc: Omit<User, 'uid'> = {
      email: user.email || '',
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
      preferences: defaultPreferences,
      profile: defaultProfile
    };

    await admin.firestore()
      .collection('users')
      .doc(user.uid)
      .set(userDoc);

    functions.logger.info(`Created user profile for ${user.uid}`);
  } catch (error) {
    functions.logger.error(`Error creating user profile for ${user.uid}:`, error);
    throw error;
  }
};

/**
 * Updates user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        preferences: {
          ...preferences
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    functions.logger.info(`Updated preferences for user ${userId}`);
  } catch (error) {
    functions.logger.error(`Error updating preferences for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Updates user profile
 */
export const updateUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> => {
  try {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        profile: {
          ...profile
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    functions.logger.info(`Updated profile for user ${userId}`);
  } catch (error) {
    functions.logger.error(`Error updating profile for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Gets user data including preferences and profile
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    return {
      uid: userId,
      ...userDoc.data()
    } as User;
  } catch (error) {
    functions.logger.error(`Error getting user data for ${userId}:`, error);
    throw error;
  }
};

/**
 * Deletes user data (GDPR compliance)
 */
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    const batch = admin.firestore().batch();

    // Delete user document
    const userRef = admin.firestore().collection('users').doc(userId);
    batch.delete(userRef);

    // Delete user's itineraries
    const itinerariesSnapshot = await admin.firestore()
      .collection('itineraries')
      .where('userId', '==', userId)
      .get();

    itinerariesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Anonymize analytics data (don't delete for insights)
    const analyticsSnapshot = await admin.firestore()
      .collection('analytics')
      .where('userId', '==', userId)
      .get();

    analyticsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        userId: admin.firestore.FieldValue.delete(),
        anonymized: true,
        anonymizedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    functions.logger.info(`Deleted user data for ${userId}`);
  } catch (error) {
    functions.logger.error(`Error deleting user data for ${userId}:`, error);
    throw error;
  }
};
