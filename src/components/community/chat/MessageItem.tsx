import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '../types/ChatTypes';
import MessageMedia from './MessageMedia';
import { Check, MoreHorizontal, Edit, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageItemProps {
  message: ChatMessage;
  currentUserId?: string;
  onlineUsers: any[];
  onEditMessage?: (messageId: string, newContent: string) => Promise<boolean>;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
  onSilenceUser?: (userId: string, duration: number | null) => Promise<boolean>;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  currentUserId, 
  onlineUsers,
  onEditMessage,
  onDeleteMessage,
  onSilenceUser
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUserId) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUserId)
        .single();
        
      setIsAdmin(data?.is_admin || false);
    };
    
    checkAdminStatus();
  }, [currentUserId]);

  const isOwnMessage = message.user_id === currentUserId;
  const hasBeenRead = message.read_by && message.read_by.length > 0;
  const readByOthers = message.read_by?.filter(id => id !== currentUserId).length || 0;

  const handleEdit = async () => {
    if (!onEditMessage) return;
    
    const success = await onEditMessage(message.id, editedContent);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteMessage) return;
    await onDeleteMessage(message.id);
  };

  const handleSilenceUser = async (duration: number | null = null) => {
    if (!onSilenceUser) return;
    await onSilenceUser(message.user_id, duration);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[85%]">
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mr-2 mt-1">
            <AvatarImage src={message.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-crimson text-white text-xs">
              {(message.username || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div>
          {!isOwnMessage && (
            <div className="text-xs text-white/70 ml-1 mb-1">
              {message.username || 'Anonymous'}
            </div>
          )}
          
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage 
                ? 'bg-crimson text-white' 
                : 'bg-gray-800 text-white'
            }`}
          >
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="bg-black/20 border-white/20"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleEdit}
                    className="bg-crimson hover:bg-crimson/90"
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {message.content && (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}
                
                <MessageMedia message={message} />
              </>
            )}
          </div>
          
          <div className="text-xs text-white/50 mt-1 px-2 flex items-center justify-between">
            <div className="flex items-center">
              {format(new Date(message.created_at), 'HH:mm')}
              
              {isOwnMessage && (
                <span className="ml-2 flex items-center">
                  {readByOthers > 0 ? (
                    <Check className="h-3 w-3 text-green-500" strokeWidth={3} />
                  ) : hasBeenRead ? (
                    <Check className="h-3 w-3 text-gray-400" />
                  ) : null}
                </span>
              )}
            </div>
            
            {isAdmin && !isOwnMessage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 border-white/20">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSilenceUser(300)}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Silence for 5 minutes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSilenceUser(3600)}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Silence for 1 hour
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSilenceUser(null)}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Permanently Silence
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
