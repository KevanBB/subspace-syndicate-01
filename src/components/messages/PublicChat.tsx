
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageWithSender } from '@/types/messages';

const PUBLIC_CHANNEL_ID = 'public-chat';

interface PublicChatProps {
  className?: string;
}

const PublicChat: React.FC<PublicChatProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch messages on component mount
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            read,
            updated_at,
            conversation_id
          `)
          .eq('conversation_id', PUBLIC_CHANNEL_ID)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        // Fetch sender information for each message
        const messagesWithSenders = await Promise.all(
          (data || []).map(async (message) => {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username, avatar_url, last_active')
              .eq('id', message.sender_id)
              .single();

            return {
              ...message,
              sender: senderData || { 
                username: 'Unknown User', 
                avatar_url: null, 
                last_active: null 
              }
            } as MessageWithSender;
          })
        );

        setMessages(messagesWithSenders);
      } catch (error) {
        console.error('Error fetching public chat messages:', error);
        toast({
          title: 'Error loading chat',
          description: 'Could not load public chat messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('public-chat-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${PUBLIC_CHANNEL_ID}`
        }, 
        async (payload) => {
          // Get sender info for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('username, avatar_url, last_active')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: MessageWithSender = {
            ...payload.new as Message,
            sender: senderData || { 
              username: 'Unknown User', 
              avatar_url: null, 
              last_active: null 
            }
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleSendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      setIsSending(true);

      // Send the new message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: PUBLIC_CHANNEL_ID,
          sender_id: user.id,
          content,
          read: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Your message could not be sent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative ${className}`}>
      {isExpanded ? (
        <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5 w-full md:w-[450px] h-[500px] max-h-[80vh] flex flex-col">
          <CardHeader className="px-4 py-3 border-b border-white/10 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-white">Community Chat</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleChat}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Minimize</span>
              <span>×</span>
            </Button>
          </CardHeader>
          <div className="flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow p-4">
              <MessageList 
                messages={messages} 
                currentUserId={user?.id || ''} 
                isLoading={isLoading}
              />
            </ScrollArea>
            <MessageInput 
              onSendMessage={handleSendMessage} 
              isSending={isSending} 
            />
          </div>
        </Card>
      ) : (
        <Button 
          onClick={toggleChat}
          className="fixed bottom-4 right-4 bg-crimson hover:bg-crimson/80 shadow-lg z-10 flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Community Chat</span>
        </Button>
      )}
    </div>
  );
};

export default PublicChat;
