
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface MessageViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({
  conversation,
  currentUserId,
  onBack
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherParticipant = conversation.participants?.find(p => p.user_id !== currentUserId);
  const username = otherParticipant?.profile?.username || 'User';
  const avatarUrl = otherParticipant?.profile?.avatar_url;
  const initials = username.substring(0, 2).toUpperCase();

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        }, 
        (payload) => {
          // Fetch the sender info to attach to the message
          const fetchSenderInfo = async () => {
            const { data } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();
              
            const newMessage = {
              ...payload.new,
              sender: data
            };
            
            setMessages(prev => [...prev, newMessage]);
          };
          
          fetchSenderInfo();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setMessages(data || []);
      
      // Mark unread messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => !msg.read && msg.sender_id !== currentUserId);
        
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(msg => msg.id);
          
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadIds);
        }
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error loading messages',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content: newMessage.trim(),
        });
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
          <AvatarFallback className="bg-crimson text-white">{initials}</AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-medium text-white">{username}</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-white/60 my-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => {
            const isMine = message.sender_id === currentUserId;
            const messageDate = new Date(message.created_at);
            const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true });
            
            return (
              <div 
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex max-w-[75%]">
                  {!isMine && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-crimson text-white text-xs">
                        {(message.sender?.username || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isMine 
                          ? 'bg-crimson text-white' 
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <div className="text-xs text-white/50 mt-1 px-2">
                      {timeAgo}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-black/30"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isSending}
            className="bg-crimson hover:bg-crimson/80"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </>
  );
};

export default MessageView;
