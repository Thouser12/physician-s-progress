import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatThread, ChatMessage } from '@/types/doctor';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchChats = useCallback(async () => {
    if (!user) return;

    // Get all accepted connections
    const { data: connections, error: connError } = await supabase
      .from('doctor_connections')
      .select('id, user_id')
      .eq('doctor_user_id', user.id)
      .eq('status', 'accepted');

    if (connError || !connections || connections.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    // Get patient names + avatars
    const patientIds = connections.map(c => c.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', patientIds);

    // Get all messages for these connections
    const connectionIds = connections.map(c => c.id);
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .in('connection_id', connectionIds)
      .order('created_at', { ascending: true });

    const threads: ChatThread[] = connections.map(conn => {
      const profile = profiles?.find(p => p.id === conn.user_id);
      const connMessages = messages?.filter(m => m.connection_id === conn.id) ?? [];

      return {
        patientId: conn.user_id,
        connectionId: conn.id,
        patientName: profile?.name ?? 'Paciente',
        patientAvatar: profile?.avatar_url ?? null,
        messages: connMessages.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderType: m.sender_type as 'doctor' | 'patient',
          text: m.text,
          timestamp: m.created_at,
        })),
      };
    });

    setChats(threads);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!user) return;
    if (channelRef.current) return;

    const channel = supabase.channel(`chat-messages-${crypto.randomUUID()}`);
    channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            connection_id: string;
            sender_id: string;
            sender_type: string;
            text: string;
            created_at: string;
          };

          setChats(prev =>
            prev.map(chat => {
              if (chat.connectionId !== newMsg.connection_id) return chat;
              const message: ChatMessage = {
                id: newMsg.id,
                senderId: newMsg.sender_id,
                senderType: newMsg.sender_type as 'doctor' | 'patient',
                text: newMsg.text,
                timestamp: newMsg.created_at,
              };
              return { ...chat, messages: [...chat.messages, message] };
            })
          );
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
  }, [user]);

  const sendMessage = useCallback(async (patientId: string, text: string) => {
    if (!user) return;

    const chat = chats.find(c => c.patientId === patientId);
    if (!chat) return;

    await supabase.from('chat_messages').insert({
      connection_id: chat.connectionId,
      sender_id: user.id,
      sender_type: 'doctor',
      text,
    });
  }, [user, chats]);

  return { chats, loading, sendMessage, refetch: fetchChats };
}
