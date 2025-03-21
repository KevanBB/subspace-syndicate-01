
import React, { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import MessageHeader from './MessageHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    username: string;
    avatar_url?: string;
    last_active?: string;
  } | null>(null);

  // Fetch current user profile on component mount
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!currentUserId) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url, last_active')
          .eq('id', currentUserId)
          .single();
          
        if (data) {
          setCurrentUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };
    
    fetchCurrentUserProfile();
  }, [currentUserId]);

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
          // Only add the message if it's not already in the list (avoid duplicates from optimistic updates)
          if (!messages.some(msg => msg.id === payload.new.id)) {
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
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

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

  const handleSendMessage = async (messageContent: string) => {
    try {
      setIsSending(true);
      
      // Create a temporary message ID for optimistic update
      const tempId = crypto.randomUUID();
      
      // Add optimistic message
      const optimisticMessage: MessageWithSender = {
        id: tempId,
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: messageContent,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: currentUserProfile
      };
      
      // Add message to state immediately (optimistic update)
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send to server
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content: messageContent,
        })
        .select();
        
      if (error) throw error;
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
        
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
      <MessageHeader 
        conversation={conversation}
        currentUserId={currentUserId}
        onBack={onBack}
        onDeleteConversation={handleDeleteConversation}
        isDeleting={isDeleting}
      />
      
      <MessageList 
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        isSending={isSending}
      />
    </>
  );
};

export default MessageView;
