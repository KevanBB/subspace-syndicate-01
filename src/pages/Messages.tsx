
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/messages';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import ConversationsList from '@/components/messages/ConversationsList';
import MessageView from '@/components/messages/MessageView';
import NewConversationButton from '@/components/messages/NewConversationButton';
import { useActivity } from '@/utils/useActivity';

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track user activity for online status
  useActivity();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchConversations();
      
      // Set up real-time subscription for changes to conversations
      const conversationsChannel = supabase
        .channel('conversations-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'conversation_participants',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchConversations();
          }
        )
        .subscribe();
        
      // Set up real-time subscription for new messages to update conversation list ordering
      const messagesChannel = supabase
        .channel('messages-updates')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            // If the message belongs to one of our conversations, update the conversation list
            if (conversations.some(c => c.id === payload.new.conversation_id)) {
              fetchConversations();
              
              // If the new message is for our currently selected conversation and from the other user,
              // update the selected conversation object to include this message
              if (selectedConversation?.id === payload.new.conversation_id && 
                  payload.new.sender_id !== user.id) {
                updateSelectedConversation(selectedConversation.id);
              }
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(conversationsChannel);
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [user, loading, conversations]);

  const updateSelectedConversation = async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (!conversation) return;
      
      // Fetch participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          id, 
          conversation_id, 
          user_id, 
          created_at
        `);
        
      // Separately fetch profiles data for each participant
      const processedParticipants = await Promise.all(
        participants?.map(async (p) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url, last_active')
            .eq('id', p.user_id)
            .single();
            
          return {
            id: p.id,
            conversation_id: p.conversation_id,
            user_id: p.user_id,
            created_at: p.created_at,
            profile: {
              username: profileData?.username || 'Unknown',
              avatar_url: profileData?.avatar_url,
              last_active: profileData?.last_active
            }
          };
        }) || []
      );
        
      // Get latest message
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      const updatedConversation = {
        ...conversation,
        participants: processedParticipants,
        lastMessage: messages && messages.length > 0 ? messages[0] : undefined
      };
      
      setSelectedConversation(updatedConversation);
    } catch (error) {
      console.error("Error updating selected conversation:", error);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get conversation IDs where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
      if (participantError) throw participantError;
      
      if (!participantData || participantData.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }
      
      const conversationIds = participantData.map(p => p.conversation_id);
      
      // Get conversations with last message and participants
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });
        
      if (conversationsError) throw conversationsError;
      
      // For each conversation, get participants and latest message
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conversation) => {
          // Get participants
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              id, 
              conversation_id, 
              user_id, 
              created_at
            `);
            
          // Separately fetch profiles data for each participant
          const processedParticipants = await Promise.all(
            participants?.map(async (p) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('username, avatar_url, last_active')
                .eq('id', p.user_id)
                .single();
                
              return {
                id: p.id,
                conversation_id: p.conversation_id,
                user_id: p.user_id,
                created_at: p.created_at,
                profile: {
                  username: profileData?.username || 'Unknown',
                  avatar_url: profileData?.avatar_url,
                  last_active: profileData?.last_active
                }
              };
            }) || []
          );
            
          // Get latest message
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          return {
            ...conversation,
            participants: processedParticipants,
            lastMessage: messages && messages.length > 0 ? messages[0] : undefined
          };
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error loading conversations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationDeleted = () => {
    setSelectedConversation(null);
    fetchConversations();
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark unread messages as read when selecting a conversation
    if (conversation.lastMessage && !conversation.lastMessage.read && 
        conversation.lastMessage.sender_id !== user?.id) {
      supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversation.id)
        .eq('read', false)
        .neq('sender_id', user?.id)
        .then(() => {
          // Update the conversation in the list to show message as read
          fetchConversations();
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <div className="container mx-auto py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/20 border border-white/10 backdrop-blur-md rounded-lg overflow-hidden"
        >
          <div className="flex flex-col md:flex-row h-[80vh]">
            <div className="w-full md:w-1/3 border-r border-white/10">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Messages</h2>
                <NewConversationButton onConversationCreated={fetchConversations} />
              </div>
              
              <ConversationsList 
                conversations={conversations} 
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                isLoading={isLoading}
                currentUserId={user?.id || ''}
              />
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col">
              {selectedConversation ? (
                <MessageView 
                  conversation={selectedConversation}
                  currentUserId={user?.id || ''}
                  onBack={() => setSelectedConversation(null)}
                  onConversationDeleted={handleConversationDeleted}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <p className="text-lg">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;
