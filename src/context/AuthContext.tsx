import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global state to store the Firebase Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Global state to store the custom user profile data from Firestore
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Loading state prevents the app from rendering protected routes before checking auth status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes (login, logout, token refresh)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // If a user is logged in, fetch their custom role and profile data from Firestore
          const userDocRef = doc(db, 'SOCIETY_001', 'data', 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // Profile missing: User might be newly registered or document creation failed
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        // No user is logged in, clear the profile
        setUserProfile(null);
      }
      
      // Auth check complete, allow the application to render
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading }}>
      {/* Only render children (the app) once the initial auth check finishes */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
