
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TypingIndicator } from '../types/ChatTypes';

interface UseChatSubscriptionsProps {
  roomId: string;
  userId?: string;
  onNewMessage: (message: any) => void;
  onTypingUpdate: (typingUser: TypingIndicator) => void;
  onReadReceipt: (payload: any) => void;
  onOnlineStatusChange: () => void;
}

export const useChatSubscriptions = ({
  roomId,
  userId,
  onNewMessage,
  onTypingUpdate,
  onReadReceipt,
  onOnlineStatusChange
}: UseChatSubscriptionsProps) => {
  const typingTimeoutsRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  
  useEffect(() => {
    // Message subscription
    const messageSubscription = supabase
      .channel('public:community_chats')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_chats',
          filter: `room_id=eq.${roomId}`
        }, 
        async (payload) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
            
          const newMessage = {
            ...payload.new,
            username: userData?.username,
            avatar_url: userData?.avatar_url,
            read_by: [payload.new.user_id]
          };
          
          onNewMessage(newMessage);
        }
      )
      .subscribe();
      
    // Presence subscription for online users
    const presenceSubscription = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        onOnlineStatusChange();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userId) {
          await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', userId);
            
          const channel = supabase.channel('online-users');
          channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });
      
    // Typing indicator subscription
    const typingChannel = supabase.channel('typing-indicator')
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id === userId) return;
        
        const fetchUserInfo = async () => {
          const { data } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.payload.user_id)
            .single();
            
          const typingUser: TypingIndicator = {
            user_id: payload.payload.user_id,
            username: data?.username,
            avatar_url: data?.avatar_url,
            timestamp: payload.payload.timestamp
          };
          
          onTypingUpdate(typingUser);
          
          if (typingTimeoutsRef.current[typingUser.user_id]) {
            clearTimeout(typingTimeoutsRef.current[typingUser.user_id]);
          }
          
          typingTimeoutsRef.current[typingUser.user_id] = setTimeout(() => {
            onTypingUpdate({ ...typingUser, expired: true });
          }, 3000);
        };
        
        fetchUserInfo();
      })
      .subscribe();
      
    // Read receipt subscription
    const readReceiptChannel = supabase.channel('read-receipts')
      .on('broadcast', { event: 'message_read' }, (payload) => {
        if (payload.payload.room_id === roomId) {
          onReadReceipt(payload.payload);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(presenceSubscription);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(readReceiptChannel);
      
      Object.values(typingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [userId, roomId, onNewMessage, onTypingUpdate, onReadReceipt, onOnlineStatusChange]);
};
