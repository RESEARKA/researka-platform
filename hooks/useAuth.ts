import { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase/clientApp';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logger from '../utils/logger';
import { trackUserActivity, ActivityType } from '../utils/activityTracker';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  isVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              role: userData.role || 'author',
              isVerified: userData.isVerified || false
            });
          } else {
            // User exists in Auth but not in Firestore
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              role: 'author',
              isVerified: false
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        logger.error('Error in auth state change', { context: { error: err } });
        setError(err instanceof Error ? err.message : 'Unknown authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Track login activity
      if (userCredential.user) {
        trackUserActivity(
          userCredential.user.uid,
          ActivityType.LOGIN,
          undefined,
          {
            timestamp: Date.now()
          }
        ).catch(err => {
          logger.error('Failed to track login activity', { context: { error: err } });
        });
      }
      
      return userCredential;
    } catch (err) {
      logger.error('Login error', { context: { error: err } });
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Track signup activity
      if (userCredential.user) {
        trackUserActivity(
          userCredential.user.uid,
          ActivityType.SIGNUP,
          undefined,
          {
            timestamp: Date.now()
          }
        ).catch(err => {
          logger.error('Failed to track signup activity', { context: { error: err } });
        });
      }
      
      return userCredential;
    } catch (err) {
      logger.error('Signup error', { context: { error: err } });
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (err) {
      logger.error('Logout error', { context: { error: err } });
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout
  };
}
