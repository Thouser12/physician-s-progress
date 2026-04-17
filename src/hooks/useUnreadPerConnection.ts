import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

const UNREAD_UPDATED_EVENT = 'doctor-unread-updated';

export interface UnreadState {
  perConnection: Record<string, number>; // connectionId -> count
  total: number;
}

/**
 * Tracks unread patient messages for the doctor, broken down by connection.
 * Uses connection_read_states to store last-read timestamp per conversation.
 */
export function useUnreadPerConnection() {
  const { user } = useAuth();
  const [state, setState] = useState<UnreadState>({ perConnection: {}, total: 0 });
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!user) return;

    const { data: conns } = await supabase
      .from('doctor_connections')
      .select('id')
      .eq('doctor_user_id', user.id)
      .eq('status', 'accepted');

    if (!conns || conns.length === 0) {
      setState({ perConnection: {}, total: 0 });
      return;
    }

    const connIds = conns.map(c => c.id);

    // Fetch all patient messages in these connections + all read states for this doctor
    const [messagesRes, readsRes] = await Promise.all([
      supabase
        .from('chat_messages')
        .select('connection_id, created_at')
        .in('connection_id', connIds)
        .eq('sender_type', 'patient'),
      supabase
        .from('connection_read_states')
        .select('connection_id, last_read_at')
        .eq('user_id', user.id)
        .in('connection_id', connIds),
    ]);

    const readMap = new Map<string, string>();
    (readsRes.data ?? []).forEach(r => readMap.set(r.connection_id, r.last_read_at));

    const perConnection: Record<string, number> = {};
    for (const id of connIds) perConnection[id] = 0;

    (messagesRes.data ?? []).forEach(msg => {
      const lastRead = readMap.get(msg.connection_id) ?? '1970-01-01T00:00:00Z';
      if (msg.created_at > lastRead) {
        perConnection[msg.connection_id] = (perConnection[msg.connection_id] ?? 0) + 1;
      }
    });

    const total = Object.values(perConnection).reduce((s, c) => s + c, 0);
    setState({ perConnection, total });
  }, [user]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Sync across hook instances (BottomNav, PatientList, ChatScreen) within the same tab
  useEffect(() => {
    const handler = () => fetchCounts();
    window.addEventListener(UNREAD_UPDATED_EVENT, handler);
    return () => window.removeEventListener(UNREAD_UPDATED_EVENT, handler);
  }, [fetchCounts]);

  useEffect(() => {
    if (!user) return;
    if (channelRef.current) return;

    const channel = supabase.channel(`doctor-unread-per-conn-${crypto.randomUUID()}`);
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      () => fetchCounts()
    );
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'connection_read_states' },
      () => fetchCounts()
    );
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchCounts]);

  const markConnectionAsRead = useCallback(async (connectionId: string) => {
    if (!user) return;
    await supabase.from('connection_read_states').upsert(
      {
        connection_id: connectionId,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'connection_id,user_id' }
    );
    // Optimistic local update
    setState(prev => {
      const newPer = { ...prev.perConnection, [connectionId]: 0 };
      const total = Object.values(newPer).reduce((s, c) => s + c, 0);
      return { perConnection: newPer, total };
    });
    window.dispatchEvent(new CustomEvent(UNREAD_UPDATED_EVENT));
  }, [user]);

  return { ...state, markConnectionAsRead, refetch: fetchCounts };
}
