
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Users, X, Image, Play, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import OnlineIndicator from './OnlineIndicator';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

interface MessageFromDB {
  id: string;
  content: string;
  sender_id?: string;
  conversation_id?: string;
  created_at: string;
  read?: boolean;
  updated_at?: string;
}

interface GroupChatProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ isOpen = true, onClose }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [onlineUsers, setOnlineUsers] = React.useState<any[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const COMMUNITY_ROOM_ID = 'community_room'; // Fixed room ID for the community

  React.useEffect(() => {
    if (isOpen) {
      fetchMessages();
      fetchOnlineUsers();
      
      const messageSubscription = supabase
        .channel('public:community_chats')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'community_chats',
            filter: `room_id=eq.${COMMUNITY_ROOM_ID}`
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
          if (status === 'SUBSCRIBED' && user) {
            await supabase
              .from('profiles')
              .update({ last_active: new Date().toISOString() })
              .eq('id', user.id);
              
            const channel = supabase.channel('online-users');
            channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
      
      return () => {
        supabase.removeChannel(messageSubscription);
        supabase.removeChannel(presenceSubscription);
      };
    }
  }, [isOpen, user]);
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('community_chats')
        .select('*')
        .eq('conversation_id', COMMUNITY_ROOM_ID)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (error) throw error;
      
      const userIds = [...new Set(data?.map(m => m.sender_id))];
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
      
      const enrichedMessages = data?.map((message: MessageFromDB) => {
        const profile = profilesMap.get(message.sender_id);
        return {
          id: message.id,
          room_id: message.conversation_id || COMMUNITY_ROOM_ID,
          user_id: message.sender_id || '',
          content: message.content,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        if (file.size <= 10 * 1024 * 1024) {
          setSelectedFile(file);
        } else {
          alert('File size exceeds 10MB limit');
        }
      } else {
        alert('Only image and video files are supported');
      }
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadMedia = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const filePath = `community/${COMMUNITY_ROOM_ID}/${fileName}`;
      
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
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !user) return;
    
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
          room_id: COMMUNITY_ROOM_ID,
          user_id: user.id,
          content: newMessage.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });
        
      if (error) throw error;
      
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', user.id);
      
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMediaPreview = () => {
    if (!selectedFile) return null;
    
    const objectUrl = URL.createObjectURL(selectedFile);
    const isImage = selectedFile.type.startsWith('image/');
    
    return (
      <div className="relative rounded-md overflow-hidden mb-2 border border-white/20">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 z-10"
          onClick={handleRemoveSelectedFile}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {isImage ? (
          <img 
            src={objectUrl} 
            alt="Selected media" 
            className="max-h-32 object-contain"
            onLoad={() => URL.revokeObjectURL(objectUrl)}
          />
        ) : (
          <div className="bg-black/40 h-32 flex items-center justify-center">
            <Play className="h-8 w-8 text-white/80" />
            <span className="ml-2 text-white/80 text-sm">{selectedFile.name}</span>
          </div>
        )}
      </div>
    );
  };

  const renderMessageMedia = (message: ChatMessage) => {
    if (!message.media_url) return null;
    
    if (message.media_type === 'image') {
      return (
        <div className="mt-1 rounded-md overflow-hidden">
          <img 
            src={message.media_url} 
            alt="Shared image" 
            className="max-w-full max-h-64 object-contain cursor-pointer"
            onClick={() => window.open(message.media_url!, '_blank')}
          />
        </div>
      );
    } else if (message.media_type === 'video') {
      return (
        <div className="mt-1 rounded-md overflow-hidden">
          <AspectRatio ratio={16/9} className="bg-black">
            <video 
              src={message.media_url} 
              controls 
              className="w-full h-full object-contain"
            />
          </AspectRatio>
        </div>
      );
    }
    
    return null;
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
      <Card className="bg-black/50 border-white/20 backdrop-blur-lg shadow-xl overflow-hidden">
        <CardHeader className="bg-black/30 border-b border-white/10 flex flex-row items-center justify-between p-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <Users className="mr-2 h-5 w-5 text-crimson" /> 
            Community Chat
            <span className="ml-2 text-xs px-2 py-0.5 bg-crimson text-white rounded-full">
              {onlineUsers.length} online
            </span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex">
            <div className="w-16 bg-black/40 p-2 max-h-96 overflow-auto">
              <div className="flex flex-col gap-2">
                <TooltipProvider>
                  {onlineUsers.map(user => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-crimson/40">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-crimson text-white text-xs">
                              {(user.username || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <OnlineIndicator 
                            lastActive={user.last_active} 
                            className="absolute -top-1 -right-1 ring-2 ring-black" 
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{user.username}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex-grow">
              <ScrollArea className="h-96 p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-white/50">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex max-w-[85%]">
                          {message.user_id !== user?.id && (
                            <Avatar className="h-8 w-8 mr-2 mt-1">
                              <AvatarImage src={message.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-crimson text-white text-xs">
                                {(message.username || 'U').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div>
                            {message.user_id !== user?.id && (
                              <div className="text-xs text-white/70 ml-1 mb-1">
                                {message.username || 'Anonymous'}
                              </div>
                            )}
                            
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                message.user_id === user?.id 
                                  ? 'bg-crimson text-white' 
                                  : 'bg-gray-800 text-white'
                              }`}
                            >
                              {message.content && (
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              )}
                              
                              {renderMessageMedia(message)}
                            </div>
                            
                            <div className="text-xs text-white/50 mt-1 px-2">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 border-t border-white/10 bg-black/30 flex-col">
          {renderMediaPreview()}
          
          {isUploading && (
            <div className="w-full mb-2">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-crimson" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/70 text-center mt-1">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-black/20 border-white/20"
              disabled={isSending || isUploading || !user}
            />
            
            <div className="flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending || isUploading || !user}
                  >
                    <Image className="h-5 w-5" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach image or video</p>
                </TooltipContent>
              </Tooltip>
              
              <Button 
                type="submit" 
                disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading || !user}
                className="bg-crimson hover:bg-crimson/80 ml-1"
              >
                {isSending || isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GroupChat;
