
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureNonNullString } from '@/utils/typeUtils';

interface UseMessageOperationsProps {
  roomId: string;
  userId?: string;
}

export const useMessageOperations = ({ roomId, userId }: UseMessageOperationsProps) => {
  const [isSending, setIsSending] = useState(false);
  
  /**
   * Mark a message as read
   */
  const markMessageAsRead = async (messageId: string) => {
    if (!userId) return;
    
    try {
      // We'll use a direct SQL query since message_reads might not be in the TypeScript types
      const { error } = await supabase.rpc('mark_message_as_read', {
        p_message_id: messageId,
        p_user_id: userId,
        p_room_id: roomId
      });
      
      if (error) {
        console.error('Error marking message as read:', error);
        return;
      }
        
      // Notify other clients
      await supabase
        .channel('read-receipts')
        .send({
          type: 'broadcast',
          event: 'message_read',
          payload: {
            message_id: messageId,
            user_id: userId,
            room_id: roomId,
            read_at: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  /**
   * Send a message with optional media
   */
  const sendMessageWithMedia = async (
    message: string,
    mediaUrl?: string,
    mediaType?: string
  ): Promise<boolean> => {
    if (!userId) {
      toast.error("You must be logged in to send messages");
      return false;
    }
    
    try {
      setIsSending(true);
      
      // Check if user is allowed to send messages
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('allow_messages, user_role')
        .eq('id', userId)
        .single();
        
      if (userProfile && userProfile.allow_messages === false) {
        toast.error("You've been temporarily restricted from sending messages");
        return false;
      }
      
      // Insert the message
      const { data, error } = await supabase
        .from('community_chats')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: message.trim() || '',
          media_url: mediaUrl,
          media_type: mediaType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in sendMessageWithMedia:', error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  /**
   * Delete a message
   */
  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // First check if user is the sender or an admin
      const { data: message } = await supabase
        .from('community_chats')
        .select('user_id')
        .eq('id', messageId)
        .single();
        
      if (!message) {
        toast.error("Message not found");
        return false;
      }
      
      // Check if user is admin
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', userId)
        .single();
        
      const isAdmin = userProfile?.user_role === 'admin' || userProfile?.user_role === 'moderator';
      const isOwner = message.user_id === userId;
      
      if (!isAdmin && !isOwner) {
        toast.error("You don't have permission to delete this message");
        return false;
      }
      
      // Delete the message
      const { error } = await supabase
        .from('community_chats')
        .delete()
        .eq('id', messageId);
        
      if (error) {
        console.error('Error deleting message:', error);
        toast.error("Failed to delete message");
        return false;
      }
      
      toast.success("Message deleted");
      return true;
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };
  
  /**
   * Silence a user (admin only)
   */
  const silenceUser = async (targetUserId: string, duration: number): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Check if current user is admin
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', userId)
        .single();
        
      if (!userProfile || (userProfile.user_role !== 'admin' && userProfile.user_role !== 'moderator')) {
        toast.error("You don't have permission to silence users");
        return false;
      }
      
      // Calculate silence end time
      const silenceEndTime = new Date();
      silenceEndTime.setMinutes(silenceEndTime.getMinutes() + duration);
      
      // Update the user's profile to disallow messages
      const { error } = await supabase
        .from('profiles')
        .update({
          allow_messages: false,
          silence_until: silenceEndTime.toISOString()
        })
        .eq('id', targetUserId);
        
      if (error) {
        console.error('Error silencing user:', error);
        toast.error("Failed to silence user");
        return false;
      }
      
      toast.success(`User silenced for ${duration} minutes`);
      return true;
    } catch (error) {
      console.error('Error in silenceUser:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };
  
  return {
    isSending,
    markMessageAsRead,
    sendMessageWithMedia,
    deleteMessage,
    silenceUser
  };
};
