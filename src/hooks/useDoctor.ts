import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCachedProfile, setCachedProfile } from '@/lib/profileCache';

interface DoctorProfile {
  id: string;
  name: string;
  crm_number: string | null;
  specialty: string | null;
  doctor_code: string;
  avatar_url: string | null;
}

export function useDoctor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Hydrate from cache for instant render. Supabase is still the source
    // of truth and overwrites the local state once it responds.
    const cached = getCachedProfile(user.id);
    if (cached && cached.doctorCode) {
      setProfile({
        id: user.id,
        name: cached.name,
        avatar_url: cached.avatarUrl,
        crm_number: cached.crmNumber,
        specialty: cached.specialty,
        doctor_code: cached.doctorCode,
      });
      setLoading(false);
    }

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setCachedProfile(user.id, {
        name: data.name,
        avatarUrl: data.avatar_url,
        crmNumber: data.crm_number,
        specialty: data.specialty,
        doctorCode: data.doctor_code,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
