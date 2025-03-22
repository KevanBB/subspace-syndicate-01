import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import GroupChat from './GroupChat';
import { Badge } from '@/components/ui/badge';

interface GroupChatButtonProps {
  onlineCount?: number;
}

const GroupChatButton: React.FC<GroupChatButtonProps> = ({ onlineCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div 
        className="fixed bottom-4 right-4 z-50"
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        initial={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button 
          onClick={() => setIsOpen(true)} 
          size="lg"
          className="bg-crimson hover:bg-crimson/90 rounded-full h-14 w-14 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
          {onlineCount > 0 && (
            <Badge 
              variant="crimson" 
              className="absolute -top-2 -right-2 bg-white text-crimson font-bold"
            >
              {onlineCount}
            </Badge>
          )}
        </Button>
      </motion.div>
      
      {/* The group chat component */}
      <GroupChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default GroupChatButton; 