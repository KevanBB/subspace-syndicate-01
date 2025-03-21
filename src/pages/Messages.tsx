
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/utils/useActivity';
import { useConversations } from '@/hooks/useConversations';
import RealtimeSubscriptions from '@/components/messages/RealtimeSubscriptions';
import MessagesContainer from '@/components/messages/MessagesContainer';

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Custom hook to fetch and manage conversations
  const { 
    conversations,
    selectedConversation,
    isLoading,
    fetchConversations,
    updateSelectedConversation,
    handleSelectConversation,
    setSelectedConversation
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

  const handleConversationDeleted = () => {
    setSelectedConversation(null);
    fetchConversations();
  };

  if (!user) return null;

  return (
    <>
      {/* Component to handle all real-time subscriptions */}
      <RealtimeSubscriptions 
        userId={user.id}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onFetchConversations={fetchConversations}
        onUpdateSelectedConversation={updateSelectedConversation}
      />
      
      {/* Main UI container */}
      <MessagesContainer
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoading}
        currentUserId={user.id}
        onFetchConversations={fetchConversations}
        onConversationDeleted={handleConversationDeleted}
        onBack={() => setSelectedConversation(null)}
      />
    </>
  );
};

export default Messages;
