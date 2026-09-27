import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  onFreeAuthStateChange,
  onFreeProfileChange,
} from '@/services/auth';

export function useFirebaseAuth() {
  const { setUser, setProfile, setAuthLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    // Listen to Free Authentication state changes
    const unsubscribeAuth = onFreeAuthStateChange((currentUser) => {
      setUser(currentUser);

      // If previous profile listener existed, unsubscribe it
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        setProfile(currentUser);
        setAuthLoading(false);

        // Listen for live credit balance or profile updates
        unsubscribeProfile = onFreeProfileChange(currentUser.uid, (updatedProfile) => {
          if (updatedProfile) {
            setUser(updatedProfile);
            setProfile(updatedProfile);
          }
        });
      } else {
        setProfile(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [setUser, setProfile, setAuthLoading]);
}

export default useFirebaseAuth;
