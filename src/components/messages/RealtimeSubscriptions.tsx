import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/messages';

interface RealtimeSubscriptionsProps {
  selectedConversation: { id: string } | null;
  currentUserId: string | null;
  onNewMessage: (message: Message) => void;
}

const RealtimeSubscriptions: React.FC<RealtimeSubscriptionsProps> = ({
  selectedConversation,
  currentUserId,
  onNewMessage,
}) => {
  useEffect(() => {
    if (!selectedConversation) return;
  
    const messagesChannel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        }, 
        (payload) => {
          if (payload.new && payload.new.conversation_id === selectedConversation?.id) {
            onNewMessage(payload.new);
          }
        }
      )
      .subscribe();
    
    const presenceChannel = supabase.channel(`presence-${selectedConversation.id}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });
    
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        // console.log("Presence sync:", presenceChannel.presenceState());
      })
      .on("presence", { event: "join" }, ({ key }) => {
        // console.log("User joined:", key);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        // console.log("User left:", key);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUserId) {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [selectedConversation, currentUserId, onNewMessage]);

  return null;
};

export default RealtimeSubscriptions;
