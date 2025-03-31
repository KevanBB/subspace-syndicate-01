
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { logAdminAction } from '@/lib/admin-logger';

interface Application {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'denied';
  admin_notes?: string;
}

interface ApplicationActionsProps {
  application: Application;
}

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleAction = async (action: 'approve' | 'deny') => {
    try {
      setIsSubmitting(true);

      // Get current admin user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      // Start a transaction
      const { error: applicationError } = await supabase
        .from('creator_applications')
        .update({
          status: action === 'approve' ? 'approved' : 'denied',
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id,
        })
        .eq('id', application.id);

      if (applicationError) throw applicationError;

      // If approved, update user's profile
      if (action === 'approve') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            creator_status: 'active',
            role: 'creator',
            updated_at: new Date().toISOString(),
          })
          .eq('id', application.user_id);

        if (profileError) throw profileError;
      }

      // Log the action
      await logAdminAction({
        admin_id: session.user.id,
        action: action === 'approve' ? 'approve_application' : 'deny_application',
        target_id: application.id,
        details: {
          application_id: application.id,
          user_id: application.user_id,
          notes: notes,
        },
      });

      toast.success(`Application ${action}d successfully`);
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error('Failed to process application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-end gap-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Deny Application</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason for denial..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction('deny')}
                disabled={isSubmitting || !notes.trim()}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Denial'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => handleAction('approve')}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Approve Application'}
      </Button>
    </div>
  );
}
