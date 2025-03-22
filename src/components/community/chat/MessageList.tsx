
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from '../types/ChatTypes';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
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
            <MessageItem 
              key={message.id} 
              message={message} 
              currentUserId={currentUserId} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageList;
