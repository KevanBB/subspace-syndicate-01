'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

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
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleAction = async (action: 'approve' | 'deny') => {
    try {
      setIsSubmitting(true);

      // Update application status
      const { error: applicationError } = await supabase
        .from('creator_applications')
        .update({
          status: action === 'approve' ? 'approved' : 'denied',
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
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
          })
          .eq('id', application.user_id);

        if (profileError) throw profileError;
      }

      toast.success(`Application ${action}d successfully`);
      setIsOpen(false);
      router.refresh();
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
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction('deny')}
                disabled={isSubmitting}
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