
import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '../types/ChatTypes';
import MessageMedia from './MessageMedia';

interface MessageItemProps {
  message: ChatMessage;
  currentUserId?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId }) => {
  const isOwnMessage = message.user_id === currentUserId;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[85%]">
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mr-2 mt-1">
            <AvatarImage src={message.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-crimson text-white text-xs">
              {(message.username || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div>
          {!isOwnMessage && (
            <div className="text-xs text-white/70 ml-1 mb-1">
              {message.username || 'Anonymous'}
            </div>
          )}
          
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage 
                ? 'bg-crimson text-white' 
                : 'bg-gray-800 text-white'
            }`}
          >
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
            
            <MessageMedia message={message} />
          </div>
          
          <div className="text-xs text-white/50 mt-1 px-2">
            {format(new Date(message.created_at), 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
