import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';

export const useAdminAuth = () => {
  const { user, profile, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      const adminStatus = profile?.role === 'admin';
      setIsAdmin(adminStatus);
      setAdminLoading(false);
    }
  }, [profile, loading]);

  return {
    user,
    profile,
    isAdmin,
    loading: loading || adminLoading
  };
};