
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  read: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
    last_active: string | null;
  } | null;
}

// Enhanced Message type that guarantees the sender is present
export interface MessageWithSender extends Message {
  sender: {
    username: string;
    avatar_url: string | null;
    last_active: string | null;
  } | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: {
    user_id: string;
    profile?: {
      username: string;
      avatar_url?: string;
      last_active?: string;
    } | null;
  }[];
  lastMessage?: Message;
}
