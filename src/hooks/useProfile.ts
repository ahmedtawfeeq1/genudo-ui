
import { useState, useEffect } from 'react';
 
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  timezone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(res => setTimeout(res, 150));
      setProfile({
        id: user!.id,
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@genu.do',
        company: 'GenuDo',
        job_title: 'Product',
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    try {
      setError(null);
      await new Promise(res => setTimeout(res, 120));
      setProfile(prev => {
        const next = { ...(prev || { id: user.id }), ...updates, updated_at: new Date().toISOString() } as Profile;
        return next;
      });
      return { ...(profile || { id: user.id }), ...updates } as Profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const createProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    try {
      setError(null);
      await new Promise(res => setTimeout(res, 120));
      const created = { id: user.id, ...profileData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Profile;
      setProfile(created);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refetch: fetchProfile,
  };
};
