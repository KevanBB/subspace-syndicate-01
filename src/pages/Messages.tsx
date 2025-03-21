
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/utils/useActivity';
import { useConversations } from '@/hooks/useConversations';
import RealtimeSubscriptions from '@/components/messages/RealtimeSubscriptions';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ConversationsList from '@/components/messages/ConversationsList';
import NewConversationButton from '@/components/messages/NewConversationButton';
import FloatingChatsContainer from '@/components/messages/FloatingChatsContainer';
import { Conversation } from '@/types/messages';

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  
  // State for tracking open chat windows
  const [openConversations, setOpenConversations] = useState<Conversation[]>([]);
  
  // Custom hook to fetch and manage conversations
  const { 
    conversations,
    selectedConversation,
    isLoading,
    fetchConversations,
    updateSelectedConversation,
    handleSelectConversation,
  } = useConversations();
  
  // Track user activity for online status
  useActivity();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchConversations();
    }
  }, [user, loading]);

  useEffect(() => {
    // If URL has a conversation ID, open that conversation
    if (conversationId && user) {
      const convo = conversations.find(c => c.id === conversationId);
      if (convo) {
        // Check if this conversation has exactly two participants
        if (convo.participants && convo.participants.length === 2) {
          openConversation(convo);
        } else {
          console.warn("Invalid conversation structure: must have exactly 2 participants");
          navigate('/messages', { replace: true });
        }
      } else if (conversations.length > 0) {
        // If conversation not found but we have conversations, try to load it
        updateSelectedConversation(conversationId);
      }
    }
  }, [conversationId, conversations, user]);

  const openConversation = (conversation: Conversation) => {
    // Validate that the conversation has exactly two participants
    if (!conversation.participants || conversation.participants.length !== 2) {
      console.warn("Cannot open conversation: must have exactly 2 participants");
      return;
    }
    
    // Check if conversation is already open
    if (!openConversations.some(c => c.id === conversation.id)) {
      setOpenConversations(prev => [...prev, conversation]);
    }
    
    // For URL tracking (optional)
    navigate(`/messages/${conversation.id}`, { replace: true });
  };

  const closeConversation = (conversationId: string) => {
    setOpenConversations(prev => prev.filter(c => c.id !== conversationId));
    
    // Reset URL if closing the current conversation in URL
    if (window.location.pathname.includes(conversationId)) {
      navigate('/messages', { replace: true });
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    // Validate that the conversation has exactly two participants
    if (!conversation.participants || conversation.participants.length !== 2) {
      console.warn("Cannot open conversation: must have exactly 2 participants");
      return;
    }
    
    handleSelectConversation(conversation); // Mark as read if needed
    openConversation(conversation);
  };

  if (!user) return null;

  return (
    <AuthenticatedLayout pageTitle="Messages" showSidebar={true}>
      {/* Component to handle all real-time subscriptions */}
      <RealtimeSubscriptions 
        userId={user.id}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onFetchConversations={fetchConversations}
        onUpdateSelectedConversation={updateSelectedConversation}
      />
      
      {/* Main conversations list */}
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
        <div className="container mx-auto py-6 px-4">
          <div className="bg-black/20 border border-white/10 backdrop-blur-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Messages</h2>
              <NewConversationButton onConversationCreated={fetchConversations} />
            </div>
            
            <ConversationsList 
              conversations={conversations.filter(c => c.participants && c.participants.length === 2)} 
              selectedConversation={selectedConversation}
              onSelectConversation={handleConversationClick}
              isLoading={isLoading}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
      
      {/* Floating chat windows */}
      <FloatingChatsContainer
        openConversations={openConversations}
        currentUserId={user.id}
        onCloseConversation={closeConversation}
      />
    </AuthenticatedLayout>
  );
};

export default Messages;
