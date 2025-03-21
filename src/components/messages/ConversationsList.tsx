
import React from 'react';
import { Conversation } from '@/types/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
  currentUserId: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  currentUserId
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-white/60">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Click the + button to start chatting</p>
      </div>
    );
  }

  const getOtherParticipant = (conversation: Conversation) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(p => p.user_id !== currentUserId);
  };

  return (
    <div className="overflow-y-auto max-h-[calc(80vh-64px)]">
      {conversations.map(conversation => {
        const otherParticipant = getOtherParticipant(conversation);
        const username = otherParticipant?.profile?.username || 'User';
        const avatarUrl = otherParticipant?.profile?.avatar_url;
        const initials = username.substring(0, 2).toUpperCase();
        const isSelected = selectedConversation?.id === conversation.id;
        const lastMessageText = conversation.lastMessage?.content || 'No messages yet';
        const lastMessageTime = conversation.lastMessage?.created_at 
          ? formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })
          : '';

        return (
          <div
            key={conversation.id}
            className={`p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-colors ${
              isSelected ? 'bg-white/10' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                <AvatarFallback className="bg-crimson text-white">{initials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-white truncate">{username}</p>
                  {lastMessageTime && (
                    <span className="text-xs text-white/50">{lastMessageTime}</span>
                  )}
                </div>
                <p className="text-sm text-white/70 truncate">{lastMessageText}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;
