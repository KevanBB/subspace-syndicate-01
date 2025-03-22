import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, TypingIndicator } from '../types/ChatTypes';
import { useChatSubscriptions } from './useChatSubscriptions';
import { useMessageOperations } from './useMessageOperations';
import { useMediaUpload } from './useMediaUpload';
import { useTypingIndicator } from './useTypingIndicator';

export const useGroupChat = (roomId: string, userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { isSending: messageOperationsSending, markMessageAsRead, sendMessageWithMedia } = useMessageOperations({ roomId, userId });
  const { selectedFile, setSelectedFile, isUploading, uploadProgress, uploadMedia } = useMediaUpload({ roomId });
  const { handleInputChange } = useTypingIndicator({ roomId, userId });

  // Handle new messages from subscription
  const handleNewMessage = (newMsg: ChatMessage) => {
    setMessages(previous => [...previous, newMsg]);
    
    if (userId && userId !== newMsg.user_id) {
      markMessageAsRead(newMsg.id);
    }
  };

  // Handle typing indicator updates
  const handleTypingUpdate = (typingUser: TypingIndicator) => {
    setTypingUsers(prev => {
      // If expired flag is set, remove the user
      if (typingUser.expired) {
        return prev.filter(user => user.user_id !== typingUser.user_id);
      }
      
      const existingUserIndex = prev.findIndex(user => user.user_id === typingUser.user_id);
      
      if (existingUserIndex >= 0) {
        const updatedUsers = [...prev];
        updatedUsers[existingUserIndex] = typingUser;
        return updatedUsers;
      } else {
        return [...prev, typingUser];
      }
    });
  };

  // Handle read receipts
  const handleReadReceipt = (payload: any) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === payload.message_id) {
        return {
          ...msg,
          read_by: [...(msg.read_by || []), payload.user_id]
        };
      }
      return msg;
    }));
  };

  // Function to fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, last_active')
        .gt('last_active', fiveMinutesAgo.toISOString())
        .limit(20);
        
      if (error) throw error;
      
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  // Set up all subscriptions
  useChatSubscriptions({
    roomId,
    userId,
    onNewMessage: handleNewMessage,
    onTypingUpdate: handleTypingUpdate,
    onReadReceipt: handleReadReceipt,
    onOnlineStatusChange: fetchOnlineUsers
  });

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
  }, [userId, roomId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('community_chats')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (error) throw error;
      
      const userIds = [...new Set(data?.map(m => m.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          username: profile.username,
          avatar_url: profile.avatar_url
        });
      });
      
      const enrichedMessages = data?.map((message) => {
        const profile = profilesMap.get(message.user_id);
        return {
          id: message.id,
          room_id: message.room_id,
          user_id: message.user_id,
          content: message.content,
          media_url: message.media_url,
          media_type: message.media_type,
          created_at: message.created_at,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          read_by: userId ? [userId] : [],
          isOptimistic: false
        } as ChatMessage;
      });
      
      setMessages(enrichedMessages || []);
      
      if (userId && enrichedMessages?.length) {
        enrichedMessages.forEach(msg => {
          markMessageAsRead(msg.id);
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !userId) return;
    
    try {
      setIsSending(true);
      let mediaUrl = null;
      let mediaType = null;
      
      // Create an optimistic message to show immediately
      const optimisticMessageId = `temp-${Date.now()}`;
      const { data: userData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
        
      // Add optimistic message to the UI immediately
      const optimisticMessage: ChatMessage = {
        id: optimisticMessageId,
        room_id: roomId,
        user_id: userId,
        content: newMessage.trim(),
        media_url: null,
        media_type: null,
        created_at: new Date().toISOString(),
        username: userData?.username,
        avatar_url: userData?.avatar_url,
        read_by: [userId],
        isOptimistic: true
      };
      
      // Update UI immediately
      setMessages(previous => [...previous, optimisticMessage]);
      
      if (selectedFile) {
        const uploadResult = await uploadMedia(selectedFile);
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
        
        // Update the optimistic message with media info
        setMessages(previous => previous.map(msg => 
          msg.id === optimisticMessageId 
            ? { ...msg, media_url: mediaUrl, media_type: mediaType } 
            : msg
        ));
      }
      
      const success = await sendMessageWithMedia(newMessage, mediaUrl, mediaType);
      
      if (success) {
        setNewMessage('');
        setSelectedFile(null);
      } else {
        // If sending failed, remove the optimistic message
        setMessages(previous => previous.filter(msg => msg.id !== optimisticMessageId));
      }
    } catch (error) {
      console.error('Error in send message process:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Custom setNewMessage that also handles typing indicators
  const updateNewMessage = (value: string) => {
    setNewMessage(handleInputChange(value));
  };

  return {
    messages,
    newMessage,
    setNewMessage: updateNewMessage,
    isLoading,
    isSending,
    onlineUsers,
    selectedFile,
    setSelectedFile,
    isUploading,
    uploadProgress,
    sendMessage,
    typingUsers,
  };
};
