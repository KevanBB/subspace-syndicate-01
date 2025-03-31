import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/messages';
import { nullToUndefinedString } from '@/utils/typeUtils';

interface RealtimeSubscriptionsProps {
  currentUserId: string | null;
  conversations: any[];
  selectedConversation: { id: string } | null;
  onFetchConversations: () => Promise<void>;
  onUpdateSelectedConversation: (conversationId: string) => Promise<void>;
}

const RealtimeSubscriptions: React.FC<RealtimeSubscriptionsProps> = ({
  currentUserId,
  conversations,
  selectedConversation,
  onFetchConversations,
  onUpdateSelectedConversation,
}) => {
  useEffect(() => {
    if (!currentUserId) return;
  
    const messagesChannel = supabase
      .channel(`messages-${currentUserId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        }, 
        (payload) => {
          // Convert payload.new to proper Message type
          const newMessage = payload.new as Message;
          
          // Check if message belongs to a conversation we're in
          const conversationExists = conversations.some(c => c.id === newMessage.conversation_id);
          
          // If it's a new conversation, refresh the list
          if (!conversationExists) {
            onFetchConversations();
            return;
          }
          
          // If we're in this conversation, update it
          if (selectedConversation && selectedConversation.id === newMessage.conversation_id) {
            onUpdateSelectedConversation(nullToUndefinedString(newMessage.conversation_id) || '');
          } else {
            // Otherwise just refresh the conversations list
            onFetchConversations();
          }
        }
      )
      .subscribe();
      
    const presenceChannel = supabase
      .channel('online-users', {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync event');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
          
          // Update user's last active time
          await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', currentUserId);
        }
      });
      
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUserId, conversations, selectedConversation, onFetchConversations, onUpdateSelectedConversation]);

  return null;
};

export default RealtimeSubscriptions;
