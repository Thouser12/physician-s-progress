import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PatientRequest, PatientLevel } from '@/types/doctor';

function normalizeLevel(level: string): PatientLevel {
  const capitalized = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  if (capitalized === 'Bronze' || capitalized === 'Silver' || capitalized === 'Gold' || capitalized === 'Platinum') {
    return capitalized;
  }
  return 'Bronze';
}

export function useRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    const { data: connections, error } = await supabase
      .from('doctor_connections')
      .select('id, user_id, created_at')
      .eq('doctor_user_id', user.id)
      .eq('status', 'pending');

    if (error || !connections) {
      setLoading(false);
      return;
    }

    if (connections.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const patientIds = connections.map(c => c.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, level')
      .in('id', patientIds);

    const requestList: PatientRequest[] = connections.map(conn => {
      const profile = profiles?.find(p => p.id === conn.user_id);
      return {
        id: conn.id,
        patientName: profile?.name ?? 'Paciente',
        level: normalizeLevel(profile?.level ?? 'bronze'),
        requestDate: new Date(conn.created_at).toLocaleDateString('pt-BR'),
      };
    });

    setRequests(requestList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const acceptRequest = useCallback(async (connectionId: string) => {
    await supabase
      .from('doctor_connections')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    await fetchRequests();
  }, [fetchRequests]);

  const rejectRequest = useCallback(async (connectionId: string) => {
    await supabase
      .from('doctor_connections')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    await fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, acceptRequest, rejectRequest, refetch: fetchRequests };
}
