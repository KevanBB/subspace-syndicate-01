import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, X, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import OnlineUsersSidebar from './chat/OnlineUsersSidebar';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import { useGroupChat } from './hooks/useGroupChat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from 'react-router-dom';

interface GroupChatProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const COMMUNITY_ROOM_ID = 'community_room'; // Fixed room ID for the community
  
  const {
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
  } = useGroupChat(COMMUNITY_ROOM_ID, user?.id);

  // Prevent background scrolling when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
    setIsPopoverOpen(false);
  };

  const handleMessageClick = (username: string) => {
    navigate(`/messages/${username}`);
    setIsPopoverOpen(false);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
      <div className="w-full h-full max-w-[100vw] max-h-[100vh] p-2 sm:p-4 md:p-6">
        <Card className="bg-black/60 border-white/20 backdrop-blur-lg shadow-xl overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-black/40 border-b border-white/10 p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Users className="mr-3 h-6 w-6 text-crimson" /> 
                Community Chat
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="ml-3 text-sm px-2.5 py-1 bg-crimson/90 text-white rounded-full hover:bg-crimson/80"
                    >
                      {onlineUsers.length} online
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 bg-black/90 border-white/20 backdrop-blur-lg p-4"
                    side="bottom"
                    align="start"
                  >
                    <div className="space-y-4">
                      <h4 className="font-medium text-white/90">Active Users</h4>
                      <div className="space-y-2">
                        {onlineUsers.map((onlineUser) => (
                          <div 
                            key={onlineUser.id} 
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-crimson/50">
                                <AvatarImage src={onlineUser.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback className="bg-crimson text-white text-xs">
                                  {(onlineUser.username || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-white/90">
                                {onlineUser.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleProfileClick(onlineUser.username)}
                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <User className="h-4 w-4 text-white/70" />
                              </button>
                              <button 
                                onClick={() => handleMessageClick(onlineUser.username)}
                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <MessageSquare className="h-4 w-4 text-white/70" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardTitle>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/60">
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="flex h-full">
              <OnlineUsersSidebar onlineUsers={onlineUsers} />
              
              <div className="flex-grow flex flex-col h-full overflow-hidden">
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading} 
                  currentUserId={user?.id} 
                  onlineUsers={onlineUsers}
                  typingUsers={typingUsers}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-0 border-t border-white/10 bg-black/30">
            <MessageInput 
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={sendMessage}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              isUploading={isUploading}
              isSending={isSending}
              uploadProgress={uploadProgress}
              isUserLoggedIn={!!user}
              roomId={COMMUNITY_ROOM_ID}
              userId={user?.id}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default GroupChat;
