import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ChevronLeft, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import OnlineIndicator from '@/components/community/OnlineIndicator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MessageViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
  onConversationDeleted?: () => void;
}

interface MessageWithSender extends Message {
  sender: {
    username: string;
    avatar_url?: string;
    last_active?: string;
  } | null;
}

const MessageView: React.FC<MessageViewProps> = ({
  conversation,
  currentUserId,
  onBack,
  onConversationDeleted
}) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherParticipant = conversation.participants?.find(p => p.user_id !== currentUserId);
  const username = otherParticipant?.profile?.username || 'User';
  const avatarUrl = otherParticipant?.profile?.avatar_url;
  const lastActive = otherParticipant?.profile?.last_active;
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
              .select('username, avatar_url, last_active')
              .eq('id', payload.new.sender_id)
              .single();
              
            const newMsg: MessageWithSender = {
              id: payload.new.id,
              conversation_id: payload.new.conversation_id,
              sender_id: payload.new.sender_id,
              content: payload.new.content,
              read: payload.new.read || false,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              sender: data || null
            };
            
            setMessages(prev => [...prev, newMsg]);
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
      
      // Fetch messages first
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setIsLoading(false);
        return;
      }
      
      // Extract unique sender IDs
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      
      // Fetch sender profiles in a single query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', senderIds);
        
      if (profilesError) throw profilesError;
      
      // Create a map of profiles by ID for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Combine messages with sender information
      const messagesWithSenders: MessageWithSender[] = messagesData.map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id) || null
      }));
      
      setMessages(messagesWithSenders);
      
      // Mark unread messages as read
      if (messagesWithSenders.length > 0) {
        const unreadMessages = messagesWithSenders.filter(msg => !msg.read && msg.sender_id !== currentUserId);
        
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

  const handleDeleteConversation = async () => {
    try {
      setIsDeleting(true);
      
      // 1. Delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversation.id);
        
      if (messagesError) throw messagesError;
      
      // 2. Delete all conversation participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversation.id);
        
      if (participantsError) throw participantsError;
      
      // 3. Delete the conversation itself
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id);
        
      if (conversationError) throw conversationError;
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
      
      // Call the callback to notify parent component
      if (onConversationDeleted) {
        onConversationDeleted();
      }
      
      // Go back to conversation list
      onBack();
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error deleting conversation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
            <AvatarFallback className="bg-crimson text-white">{initials}</AvatarFallback>
          </Avatar>
          
          {lastActive && (
            <OnlineIndicator 
              lastActive={lastActive} 
              className="absolute -bottom-1 -right-1 border-2 border-gray-900" 
            />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-white">{username}</h3>
          {lastActive && (
            <p className="text-xs text-white/60">
              {new Date(lastActive).getTime() > Date.now() - 5 * 60 * 1000
                ? 'Online now'
                : `Last active ${formatDistanceToNow(new Date(lastActive), { addSuffix: true })}`}
            </p>
          )}
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-red-500/20"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-white border-white/10 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConversation}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

