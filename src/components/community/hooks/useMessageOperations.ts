import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '../types/ChatTypes';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface UseMessageOperationsProps {
  roomId: string;
  userId?: string;
}

export const useMessageOperations = ({ roomId, userId }: UseMessageOperationsProps) => {
  const [isSending, setIsSending] = useState(false);

  const markMessageAsRead = async (messageId: string) => {
    if (!userId) return;
    
    try {
      await supabase.channel('read-receipts')
        .send({
          type: 'broadcast',
          event: 'message_read',
          payload: {
            message_id: messageId,
            user_id: userId,
            room_id: roomId,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessageWithMedia = async (
    content: string, 
    mediaUrl: string | null, 
    mediaType: string | null
  ) => {
    if (!userId) return;
    
    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('community_chats')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });
        
      if (error) throw error;
      
      // Update user's last active timestamp
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  // Moderating functions
  const editMessage = async (messageId: string, newContent: string) => {
    if (!userId) return false;
    
    try {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
      if (!userData?.is_admin) {
        toast({
          title: 'Permission denied',
          description: 'Only administrators can edit messages',
          variant: 'destructive',
        });
        return false;
      }
      
      const { error } = await supabase
        .from('community_chats')
        .update({ content: newContent.trim() })
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast({
        title: 'Message edited',
        description: 'The message has been updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error editing message',
        description: 'Failed to update the message',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!userId) return false;
    
    try {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
      if (!userData?.is_admin) {
        toast({
          title: 'Permission denied',
          description: 'Only administrators can delete messages',
          variant: 'destructive',
        });
        return false;
      }
      
      const { error } = await supabase
        .from('community_chats')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast({
        title: 'Message deleted',
        description: 'The message has been removed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error deleting message',
        description: 'Failed to remove the message',
        variant: 'destructive',
      });
      return false;
    }
  };

  const silenceUser = async (targetUserId: string, duration: number | null = null) => {
    if (!userId) return false;
    
    try {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
      if (!userData?.is_admin) {
        toast({
          title: 'Permission denied',
          description: 'Only administrators can silence users',
          variant: 'destructive',
        });
        return false;
      }
      
      // If duration is null, it means permanent silence
      const silenceUntil = duration ? new Date(Date.now() + duration * 1000) : null;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_silenced: true,
          silenced_until: silenceUntil?.toISOString() ?? null
        } satisfies ProfileUpdate)
        .eq('id', targetUserId);
        
      if (error) throw error;
      
      toast({
        title: 'User silenced',
        description: duration 
          ? `User has been silenced for ${duration} seconds`
          : 'User has been permanently silenced',
      });
      
      return true;
    } catch (error) {
      console.error('Error silencing user:', error);
      toast({
        title: 'Error silencing user',
        description: 'Failed to silence the user',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    isSending,
    markMessageAsRead,
    sendMessageWithMedia,
    editMessage,
    deleteMessage,
    silenceUser
  };
};
