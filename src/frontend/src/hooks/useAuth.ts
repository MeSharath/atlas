import { useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth';
import { analyticsService } from '@/services/analytics';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  updateProfile: (profile: Partial<User['profile']>) => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        analyticsService.setUserId(user.uid);
        analyticsService.trackEvent('user_authenticated', {
          method: 'state_change'
        });
      } else {
        analyticsService.clearUserId();
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.signIn(email, password);
      setUser(user);
      
      analyticsService.setUserId(user.uid);
      analyticsService.trackConversion('signin', undefined, {
        method: 'email_password'
      });
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_signin', {
        method: 'email_password'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.signUp(email, password, displayName);
      setUser(user);
      
      analyticsService.setUserId(user.uid);
      analyticsService.trackConversion('signup', undefined, {
        method: 'email_password',
        hasDisplayName: !!displayName
      });
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_signup', {
        method: 'email_password'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.signInWithGoogle();
      setUser(user);
      
      analyticsService.setUserId(user.uid);
      analyticsService.trackConversion('signin', undefined, {
        method: 'google'
      });
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_signin', {
        method: 'google'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signOut();
      setUser(null);
      
      analyticsService.trackEvent('user_signout');
      analyticsService.clearUserId();
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_signout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      
      await authService.resetPassword(email);
      
      analyticsService.trackEvent('password_reset_requested', {
        email: email.split('@')[1] // Only track domain for privacy
      });
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_password_reset');
      throw err;
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<void> => {
    try {
      setError(null);
      
      await authService.updatePreferences(preferences);
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences
          }
        });
      }
      
      analyticsService.trackPreferencesUpdate(preferences, 'settings');
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_update_preferences');
      throw err;
    }
  };

  const updateProfile = async (profile: Partial<User['profile']>): Promise<void> => {
    try {
      setError(null);
      
      await authService.updateProfile(profile);
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...profile
          }
        });
      }
      
      analyticsService.trackEvent('profile_updated', {
        fields: Object.keys(profile)
      });
    } catch (err: any) {
      setError(err.message);
      analyticsService.trackError(err.message, 'auth_update_profile');
      throw err;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePreferences,
    updateProfile,
    clearError
  };
};
