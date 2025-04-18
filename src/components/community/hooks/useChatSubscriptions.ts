
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TypingIndicator } from '../types/ChatTypes';
import { nullToUndefined } from '@/utils/typeUtils';

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
          let userData = null;
          if (payload.new.user_id) {
            const { data } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', payload.new.user_id)
              .single();
            userData = data;
          }
            
          const newMessage = {
            ...payload.new,
            username: userData?.username || 'Unknown User',
            avatar_url: userData?.avatar_url,
            read_by: [payload.new.user_id]
          };
          
          // When a user sends a message, clear their typing indicator
          if (typingTimeoutsRef.current[payload.new.user_id]) {
            clearTimeout(typingTimeoutsRef.current[payload.new.user_id]);
            delete typingTimeoutsRef.current[payload.new.user_id];
            
            // Immediately inform UI that user is no longer typing
            onTypingUpdate({
              user_id: payload.new.user_id, 
              expired: true, 
              timestamp: new Date().toISOString()
            });
          }
          
          onNewMessage(newMessage);
        }
      )
      .subscribe();
      
    // Presence subscription for online users
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId
        }
      }
    });
    
    presenceChannel
      .on('presence', { event: 'sync' }, async () => {
        const presenceState = presenceChannel.presenceState();
        const onlineUsers = Object.values(presenceState).map((presence: any) => ({
          id: presence.user_id,
          online_at: presence.online_at
        }));
        
        // Fetch user profiles for online users
        if (onlineUsers.length > 0) {
          const userIds = onlineUsers.map(user => user.id).filter(Boolean);
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', userIds);
              
            if (profiles) {
              const enrichedUsers = onlineUsers.map(user => ({
                ...user,
                username: profiles.find(p => p.id === user.id)?.username || 'Unknown User',
                avatar_url: profiles.find(p => p.id === user.id)?.avatar_url
              }));
              onOnlineStatusChange();
            }
          }
        } else {
          onOnlineStatusChange();
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userId) {
          await presenceChannel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
          
          await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', userId);
        }
      });
      
    // Typing indicator subscription
    const typingChannel = supabase.channel('typing-indicator')
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id === userId) return;
        
        const fetchUserInfo = async () => {
          // If this is a "stopped typing" event, immediately clear the indicator
          if (payload.payload.isActive === false) {
            onTypingUpdate({
              user_id: payload.payload.user_id,
              expired: true,
              timestamp: payload.payload.timestamp
            });
            
            if (typingTimeoutsRef.current[payload.payload.user_id]) {
              clearTimeout(typingTimeoutsRef.current[payload.payload.user_id]);
              delete typingTimeoutsRef.current[payload.payload.user_id];
            }
            return;
          }
          
          const { data } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.payload.user_id)
            .single();
            
          const typingUser: TypingIndicator = {
            user_id: payload.payload.user_id,
            username: nullToUndefined(data?.username),
            avatar_url: nullToUndefined(data?.avatar_url),
            timestamp: payload.payload.timestamp
          };
          
          onTypingUpdate(typingUser);
          
          if (typingTimeoutsRef.current[typingUser.user_id]) {
            clearTimeout(typingTimeoutsRef.current[typingUser.user_id]);
          }
          
          typingTimeoutsRef.current[typingUser.user_id] = setTimeout(() => {
            onTypingUpdate({ ...typingUser, expired: true });
            delete typingTimeoutsRef.current[typingUser.user_id];
          }, 5000); // Extended timeout for better reliability
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
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(readReceiptChannel);
      
      Object.values(typingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [userId, roomId, onNewMessage, onTypingUpdate, onReadReceipt, onOnlineStatusChange]);
};
