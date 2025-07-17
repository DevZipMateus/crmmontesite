
import { useState, useEffect } from 'react';

interface UserPermissions {
  userType: string | null;
  isAdmin: boolean;
  isSales: boolean;
  isLoading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserType = () => {
      try {
        const storedUserType = localStorage.getItem('userType');
        console.log('🔍 Debug - UserType from localStorage:', storedUserType);
        console.log('🔍 Debug - UserType type:', typeof storedUserType);
        console.log('🔍 Debug - UserType trimmed:', storedUserType?.trim());
        
        setUserType(storedUserType?.trim() || null);
      } catch (error) {
        console.error('❌ Error accessing localStorage:', error);
        setUserType(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserType();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userType') {
        console.log('🔄 UserType changed in localStorage:', e.newValue);
        setUserType(e.newValue?.trim() || null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAdmin = userType === 'admin';
  const isSales = userType === 'sales';

  console.log('👤 UserPermissions Hook Result:', {
    userType,
    isAdmin,
    isSales,
    isLoading
  });

  return {
    userType,
    isAdmin,
    isSales,
    isLoading
  };
};
