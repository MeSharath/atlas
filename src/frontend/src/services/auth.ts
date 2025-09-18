import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserPreferences, UserProfile } from '@/types';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // Create user profile in Firestore (this will be handled by the backend trigger)
      // But we'll also create a local version for immediate use
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

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || displayName,
        photoURL: firebaseUser.photoURL,
        preferences: defaultPreferences,
        profile: defaultProfile
      };

      this.currentUser = user;
      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const user = await this.getUserData(firebaseUser.uid);
      this.currentUser = user;
      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const user = await this.getUserData(firebaseUser.uid);
      this.currentUser = user;
      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const user = await this.getUserData(firebaseUser.uid);
          this.currentUser = user;
          callback(user);
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        preferences: {
          ...this.currentUser.preferences,
          ...preferences
        },
        updatedAt: new Date()
      });

      // Update local user object
      this.currentUser.preferences = {
        ...this.currentUser.preferences,
        ...preferences
      };
    } catch (error) {
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }

    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        profile: {
          ...this.currentUser.profile,
          ...profile
        },
        updatedAt: new Date()
      });

      // Update local user object
      this.currentUser.profile = {
        ...this.currentUser.profile,
        ...profile
      };
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Get user data from Firestore
   */
  private async getUserData(uid: string): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          preferences: userData.preferences,
          profile: userData.profile
        };
      } else {
        // User document doesn't exist, create default one
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          throw new Error('No authenticated user');
        }

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

        const user: User = {
          uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          preferences: defaultPreferences,
          profile: defaultProfile
        };

        // Create user document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          preferences: user.preferences,
          profile: user.profile,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return user;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      throw new Error('Failed to get user data');
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled';
      default:
        return 'An error occurred during authentication';
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
