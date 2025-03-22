import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, MessageFromDB, TypingIndicator } from '../types/ChatTypes';

export const useGroupChat = (roomId: string, userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    
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
          
          setMessages(previous => [...previous, newMessage as ChatMessage]);
          
          if (userId && userId !== payload.new.user_id) {
            markMessageAsRead(payload.new.id);
          }
        }
      )
      .subscribe();
      
    const presenceSubscription = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        fetchOnlineUsers();
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
          
          setTypingUsers(prev => {
            const existingUserIndex = prev.findIndex(user => user.user_id === typingUser.user_id);
            
            if (existingUserIndex >= 0) {
              const updatedUsers = [...prev];
              updatedUsers[existingUserIndex] = typingUser;
              return updatedUsers;
            } else {
              return [...prev, typingUser];
            }
          });
          
          if (typingTimeoutsRef.current[typingUser.user_id]) {
            clearTimeout(typingTimeoutsRef.current[typingUser.user_id]);
          }
          
          typingTimeoutsRef.current[typingUser.user_id] = setTimeout(() => {
            setTypingUsers(prev => prev.filter(user => user.user_id !== typingUser.user_id));
          }, 3000);
        };
        
        fetchUserInfo();
      })
      .subscribe();
      
    const readReceiptChannel = supabase.channel('read-receipts')
      .on('broadcast', { event: 'message_read' }, (payload) => {
        if (payload.payload.room_id === roomId) {
          setMessages(prev => prev.map(msg => {
            if (msg.id === payload.payload.message_id) {
              return {
                ...msg,
                read_by: [...(msg.read_by || []), payload.payload.user_id]
              };
            }
            return msg;
          }));
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
  }, [userId, roomId]);

  const markMessageAsRead = async (messageId: string) => {
    if (!userId) return;
    
    try {
      await supabase.channel('read-receipts')
        .send({
          type: 'broadcast',
          event: 'message_read',
          payload: {
            message_id: messageId,
            user_id: userId,
            room_id: roomId,
            timestamp: new Date().toISOString()
          }
        });
        
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && !msg.read_by?.includes(userId)) {
          return {
            ...msg,
            read_by: [...(msg.read_by || []), userId]
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

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
          read_by: userId ? [userId] : []
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

  const uploadMedia = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const filePath = `community/${roomId}/${fileName}`;
      
      const options = {
        cacheControl: '3600',
        upsert: false
      };
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, options);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      return { url: publicUrl, type: mediaType };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !userId) return;
    
    try {
      setIsSending(true);
      
      let mediaUrl = null;
      let mediaType = null;
      
      if (selectedFile) {
        const uploadResult = await uploadMedia(selectedFile);
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
      }
      
      const { error } = await supabase
        .from('community_chats')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: newMessage.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });
        
      if (error) throw error;
      
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);
      
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
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
