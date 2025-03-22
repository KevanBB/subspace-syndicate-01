
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import OnlineUsersSidebar from './chat/OnlineUsersSidebar';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import { useGroupChat } from './hooks/useGroupChat';

interface GroupChatProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
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
  } = useGroupChat(COMMUNITY_ROOM_ID, user?.id);

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
            <OnlineUsersSidebar onlineUsers={onlineUsers} />
            
            <div className="flex-grow">
              <MessageList 
                messages={messages} 
                isLoading={isLoading} 
                currentUserId={user?.id} 
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-0">
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
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default GroupChat;
