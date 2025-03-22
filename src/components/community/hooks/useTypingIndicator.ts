
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTypingIndicatorProps {
  roomId: string;
  userId?: string;
}

export const useTypingIndicator = ({ roomId, userId }: UseTypingIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const lastTypingTime = useRef<number>(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const sendTypingIndicator = async () => {
    if (!userId) return;
    
    const now = new Date().getTime();
    
    // Throttle typing events to not spam the server
    if (now - lastTypingTime.current < 3000) return;
    
    lastTypingTime.current = now;
    
    try {
      await supabase.channel('typing-indicator')
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: userId,
            room_id: roomId,
            timestamp: new Date().toISOString()
          }
        });
      
      // Clear any existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      // Set a timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  const handleInputChange = (value: string) => {
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator();
    }
    return value;
  };

  return {
    isTyping,
    handleInputChange
  };
};
