
import React from 'react';
import { Conversation } from '@/types/messages';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

interface MessageHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
  onDeleteConversation: () => void;
  isDeleting: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  conversation, 
  currentUserId,
  onBack, 
  onDeleteConversation,
  isDeleting
}) => {
  const otherParticipant = conversation.participants?.find(p => p.user_id !== currentUserId);
  const username = otherParticipant?.profile?.username || 'User';
  const avatarUrl = otherParticipant?.profile?.avatar_url;
  const lastActive = otherParticipant?.profile?.last_active;
  const initials = username.substring(0, 2).toUpperCase();

  return (
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
              onClick={onDeleteConversation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MessageHeader;
