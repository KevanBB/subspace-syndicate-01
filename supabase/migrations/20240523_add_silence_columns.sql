-- Add silence-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS silenced_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_silenced BOOLEAN DEFAULT FALSE;

-- Add RLS policy to prevent silenced users from sending messages
CREATE POLICY "Silenced users cannot send messages"
  ON public.community_chats
  FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (is_silenced = true OR (silenced_until IS NOT NULL AND silenced_until > NOW()))
    )
  ); 