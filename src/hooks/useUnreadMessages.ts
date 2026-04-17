import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchCount = useCallback(async () => {
    if (!user) return;

    // Get accepted connections for this doctor
    const { data: conns } = await supabase
      .from('doctor_connections')
      .select('id')
      .eq('doctor_user_id', user.id)
      .eq('status', 'accepted');

    if (!conns || conns.length === 0) {
      setCount(0);
      return;
    }

    // Get last_chat_read_at from doctor profile
    const { data: profile } = await supabase
      .from('doctor_profiles')
      .select('last_chat_read_at')
      .eq('id', user.id)
      .single();

    const lastRead = profile?.last_chat_read_at ?? '1970-01-01T00:00:00Z';

    // Count messages from patients (not doctor) after lastRead
    const connIds = conns.map(c => c.id);
    const { count: msgCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('connection_id', connIds)
      .eq('sender_type', 'patient')
      .gt('created_at', lastRead);

    setCount(msgCount ?? 0);
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!user) return;
    if (channelRef.current) return;

    const channel = supabase.channel(`doctor-unread-${crypto.randomUUID()}`);
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
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

  const markAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('doctor_profiles')
      .update({ last_chat_read_at: new Date().toISOString() })
      .eq('id', user.id);
    setCount(0);
  }, [user]);

  return { count, markAsRead, refetch: fetchCount };
}
