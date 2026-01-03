import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAdminAuthStateChange,
  getAdminProfile,
  logOutAdmin,
} from '../utils/adminAuth';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAdminAuthStateChange(async (authUser) => {
      if (authUser) {
        setAdmin(authUser);
        // Fetch admin profile from Firestore
        try {
          const profile = await getAdminProfile(authUser.uid);
          setAdminProfile(profile);
        } catch (error) {
          console.error('Error fetching admin profile:', error);
          setAdminProfile(null);
        }
      } else {
        setAdmin(null);
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await logOutAdmin();
      setAdmin(null);
      setAdminProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value = {
    admin,
    adminProfile,
    loading,
    logout,
    isAuthenticated: !!admin,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};




