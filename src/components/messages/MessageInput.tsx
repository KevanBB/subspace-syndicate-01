
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isSending: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isSending }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="p-4 border-t border-white/10">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-black/30"
          disabled={isSending}
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || isSending}
          className="bg-crimson hover:bg-crimson/80"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
