
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface NewConversationButtonProps {
  onConversationCreated: () => void;
}

const NewConversationButton: React.FC<NewConversationButtonProps> = ({ onConversationCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery.trim()}%`)
        .neq('id', user?.id)
        .limit(10);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching for users:', error);
      toast({
        title: 'Error searching for users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      setIsCreating(true);
      
      // Check if conversation already exists using RPC
      const { data: existingConversations } = await supabase.rpc(
        'get_user_conversations',
        { user_id: user.id }
      );
      
      if (existingConversations && existingConversations.length > 0) {
        // Check if the recipient is in any of these conversations
        const { data: participations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', existingConversations);
          
        if (participations && participations.length > 0) {
          toast({
            title: 'Conversation already exists',
            description: 'You already have a conversation with this user.',
          });
          setIsOpen(false);
          return;
        }
      }
      
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConversation.id,
            user_id: user.id,
          },
          {
            conversation_id: newConversation.id,
            user_id: otherUserId,
          }
        ]);
        
      if (participantsError) throw participantsError;
      
      toast({
        title: 'Conversation created',
        description: 'You can now start messaging!',
      });
      
      onConversationCreated();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error creating conversation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Button 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="bg-crimson hover:bg-crimson/80"
      >
        <Plus className="h-5 w-5" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-2 my-4">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for username..."
                className="bg-black/30 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {searchResults.length === 0 && searchQuery && !isSearching ? (
              <div className="text-center text-white/60 py-8">
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(profile => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-md cursor-pointer"
                    onClick={() => startConversation(profile.id)}
                  >
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
                      <AvatarFallback className="bg-crimson text-white">
                        {profile.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{profile.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewConversationButton;
