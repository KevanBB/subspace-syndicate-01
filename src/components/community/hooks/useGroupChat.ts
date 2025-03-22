
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, MessageFromDB } from '../types/ChatTypes';

export const useGroupChat = (roomId: string, userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
            avatar_url: userData?.avatar_url
          };
          
          setMessages(previous => [...previous, newMessage as ChatMessage]);
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
    
    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(presenceSubscription);
    };
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
          avatar_url: profile?.avatar_url
        } as ChatMessage;
      });
      
      setMessages(enrichedMessages || []);
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
  };
};
