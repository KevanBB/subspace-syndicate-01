import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  bdsm_role: string;
  avatar_url: string;
  group_id: string;
  read: boolean;
  reply_to_message_id: string | null;
}

interface TypingUser {
  userId: string;
  username: string;
}

interface ReplyToMessage {
  id: string;
  content: string;
}

export const useGroupChat = (groupId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<ReplyToMessage | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef(new Set<string>());

  // Load initial messages and subscribe to new messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select('id, content, created_at, user_id, username, bdsm_role, avatar_url, group_id, read, reply_to_message_id')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: 'Error loading messages',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel(`group_messages_${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prevMessages => [...prevMessages, newMessage]);
        })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [groupId, toast, supabase]);

  // Subscribe to typing events
  useEffect(() => {
    const typingSubscription = supabase
      .channel(`group_typing_${groupId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = supabase.getPresence(`group_typing_${groupId}`);
        if (presenceState) {
          const userList = Object.values(presenceState).flat();
          // Use a Map to store the latest entry for each user
          const latestUsersMap = new Map<string, any>();
          userList.forEach((user) => {
            latestUsersMap.set(user.userId, user);
          });

          // Convert MapIterator to an array and then to a Set
          const existingTypingUserIdsArray = Array.from(latestUsersMap.values());
          const existingTypingUserIdsSet = new Set(existingTypingUserIdsArray);

          // Convert Set to Array before filtering
          const filteredTypingUsers = Array.from(existingTypingUserIdsSet).filter(user => user.isTyping);

          // Extract the userId and username from the filtered users
          const typingUsersDetails = filteredTypingUsers.map(user => ({
            userId: user.userId,
            username: user.username,
          }));
          setTypingUsers(typingUsersDetails);
        }
      })
      .on('presence', { event: 'join' }, (payload) => {
        //console.log('User joined typing presence:', payload);
      })
      .on('presence', { event: 'leave' }, (payload) => {
        //console.log('User left typing presence:', payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await supabase.presence.track({
            groupId: groupId,
            userId: user?.id,
            username: user?.user_metadata?.username,
            isTyping: isTyping,
          });
        }
      });

    return () => {
      supabase.removeChannel(typingSubscription);
    };
  }, [groupId, user, isTyping, supabase]);

  // Function to send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageId = uuidv4();

    const newMessageObject = {
      id: messageId,
      content: newMessage,
      created_at: new Date().toISOString(),
      user_id: user?.id,
      username: user?.user_metadata?.username,
      bdsm_role: user?.user_metadata?.bdsm_role,
      avatar_url: user?.user_metadata?.avatar_url,
      group_id: groupId,
      read: false,
      reply_to_message_id: replyToMessage ? replyToMessage.id : null,
    };

    setMessages(prevMessages => [...prevMessages, newMessageObject]);
    setNewMessage('');
    setReplyToMessage(null);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([newMessageObject]);

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Error sending message:', err.message);
      toast({
        title: 'Error sending message',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Function to handle marking messages as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!seenMessageIdsRef.current.has(messageId)) {
      seenMessageIdsRef.current.add(messageId);

      try {
        // Instead of using the function incorrectly, create a proper implementation or use an alternative
        // Temporarily implement as a direct Supabase call
        const { data, error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', messageId);

        if (error) {
          console.error('Error marking message as read:', error);
        }
      } catch (err: any) {
        console.error('Error marking message as read:', err);
      }
    }
  }, []);

  // Effect to mark messages as read when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              markAsRead(messageId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      }
    );

    const messageElements = document.querySelectorAll('.message-item');
    messageElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      messageElements.forEach(element => observer.unobserve(element));
    };
  }, [messages, markAsRead]);

  // Function to handle real-time typing indication
  const handleTyping = async () => {
    setIsTyping(newMessage.length > 0);
    await supabase.presence.track({
      groupId: groupId,
      userId: user?.id,
      username: user?.user_metadata?.username,
      isTyping: newMessage.length > 0,
    });
  };

  // Effect to manage typing status
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        supabase.presence.track({
          groupId: groupId,
          userId: user?.id,
          username: user?.user_metadata?.username,
          isTyping: false,
        });
      }
    }, 3000); // Stop typing after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [newMessage, isTyping, groupId, user, supabase]);

  // Function to set the message to reply to
  const setReply = (message: Message) => {
    setReplyToMessage({
      id: message.id || '',
      content: message.content || ''
    });
  };

  // Function to clear the reply
  const clearReply = () => {
    setReplyToMessage(null);
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    loading,
    error,
    typingUsers,
    handleTyping,
    replyToMessage,
    setReply,
    clearReply,
  };
};
