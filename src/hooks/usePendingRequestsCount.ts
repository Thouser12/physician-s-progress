import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Counts pending connection requests (patients waiting for this doctor to accept).
 */
export function usePendingRequestsCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchCount = useCallback(async () => {
    if (!user) return;

    const { count: pendingCount } = await supabase
      .from('doctor_connections')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_user_id', user.id)
      .eq('status', 'pending');

    setCount(pendingCount ?? 0);
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!user) return;
    if (channelRef.current) return;

    const channel = supabase.channel(`doctor-requests-${crypto.randomUUID()}`);
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'doctor_connections' },
      () => {
        fetchCount();
      }
    );
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchCount]);

  return { count, refetch: fetchCount };
}
