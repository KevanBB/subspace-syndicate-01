
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

interface ApplicationData {
  id: string;
  status: string;
  date_submitted: string;
  is_over_18: boolean;
  agrees_to_terms: boolean;
  user_id: string;
  identities: {
    full_name: string;
    date_of_birth: string;
    country_of_residence: string;
    government_id_front_url: string;
    government_id_back_url: string;
    selfie_url: string;
  } | null;
  tax_infos: {
    is_us_citizen: boolean;
    tax_country: string;
    tax_id: string;
    business_name: string | null;
    tax_address: string;
    tax_classification: string;
  } | null;
  payment_infos: {
    stripe_connect_id: string;
    payout_currency: string;
    payout_schedule: string;
  } | null;
  creator_profiles: {
    display_name: string;
    profile_photo_url: string;
    bio: string;
    content_categories: string[];
  } | null;
  agreements: {
    agrees_to_all_docs: boolean;
    signature: string;
    signature_date: string;
  } | null;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  applicationId,
}) => {
  const [denialReason, setDenialReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['applicationDetails', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_applications')
        .select(`
          *,
          identities (*),
          tax_infos (*),
          payment_infos (*),
          creator_profiles (*),
          agreements (*)
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      return data as ApplicationData;
    },
    enabled: isOpen && !!applicationId,
  });

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !denialReason.trim()) {
      toast.error('Please provide a reason for denial');
      return;
    }

    if (!application) {
      toast.error('Application data not found');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('creator_applications')
        .update({ status })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create message for the user
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          user_id: application.user_id,
          sender: 'Support',
          title: status === 'approved' 
            ? 'Creator Account Approved!' 
            : 'Creator Account Application Denied',
          content: status === 'approved'
            ? 'Congratulations! Your creator account application has been approved. You can now start creating content on SubSpace.'
            : `Your creator account application has been denied. Reason: ${denialReason}`,
          is_read: false,
        });

      if (messageError) throw messageError;

      // If approved, generate JWT token for Stripe Connect onboarding
      if (status === 'approved') {
        const { data: tokenData, error: tokenError } = await supabase
          .functions.invoke('generate-stripe-onboarding-token', {
            body: { userId: application.user_id }
          });

        if (tokenError) throw tokenError;

        // Store the token in the database
        const { error: tokenUpdateError } = await supabase
          .from('payment_infos')
          .update({ stripe_connect_id: tokenData.token })
          .eq('application_id', applicationId);

        if (tokenUpdateError) throw tokenUpdateError;
      }

      toast.success(`Application ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['creatorApplications'] });
      onClose();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) {
    return null;
  }

  // Make sure we handle potentially null properties
  const identities = application.identities || {
    full_name: 'N/A',
    date_of_birth: new Date().toISOString(),
    country_of_residence: 'N/A',
    government_id_front_url: '',
    government_id_back_url: '',
    selfie_url: '',
  };

  const tax_infos = application.tax_infos || {
    is_us_citizen: false,
    tax_country: 'N/A',
    tax_id: 'N/A',
    business_name: null,
    tax_address: 'N/A',
    tax_classification: 'N/A',
  };

  const payment_infos = application.payment_infos || {
    stripe_connect_id: 'Not connected',
    payout_currency: 'N/A',
    payout_schedule: 'N/A',
  };

  const creator_profiles = application.creator_profiles || {
    display_name: 'N/A',
    profile_photo_url: '',
    bio: 'N/A',
    content_categories: [],
  };

  const agreements = application.agreements || {
    agrees_to_all_docs: false,
    signature: 'N/A',
    signature_date: new Date().toISOString(),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creator Application Details</DialogTitle>
          <DialogDescription>
            Review application details and take action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Badge variant={application.status === 'approved' ? 'default' : 
                              application.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {application.status.charAt(0).toUpperCase() + 
                   application.status.slice(1)}
                </Badge>
              </div>
              <div>
                <Label>Date Submitted</Label>
                <p>{format(new Date(application.date_submitted), 'PPP')}</p>
              </div>
            </div>
          </div>

          {/* Identity Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Identity Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <p>{identities.full_name}</p>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <p>{format(new Date(identities.date_of_birth), 'PPP')}</p>
              </div>
              <div>
                <Label>Country of Residence</Label>
                <p>{identities.country_of_residence}</p>
              </div>
              <div>
                <Label>Government ID</Label>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => identities.government_id_front_url && window.open(identities.government_id_front_url)}>
                    Front
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => identities.government_id_back_url && window.open(identities.government_id_back_url)}>
                    Back
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => identities.selfie_url && window.open(identities.selfie_url)}>
                    Selfie
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tax Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>US Citizen</Label>
                <p>{tax_infos.is_us_citizen ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label>Tax Country</Label>
                <p>{tax_infos.tax_country}</p>
              </div>
              <div>
                <Label>Tax ID</Label>
                <p>{tax_infos.tax_id}</p>
              </div>
              <div>
                <Label>Business Name</Label>
                <p>{tax_infos.business_name || 'N/A'}</p>
              </div>
              <div>
                <Label>Tax Address</Label>
                <p>{tax_infos.tax_address}</p>
              </div>
              <div>
                <Label>Tax Classification</Label>
                <p>{tax_infos.tax_classification}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payout Currency</Label>
                <p>{payment_infos.payout_currency}</p>
              </div>
              <div>
                <Label>Payout Schedule</Label>
                <p>{payment_infos.payout_schedule}</p>
              </div>
              <div>
                <Label>Stripe Connect Status</Label>
                <p>{payment_infos.stripe_connect_id === 'connected' ? 'Connected' : 'Not Connected'}</p>
              </div>
            </div>
          </div>

          {/* Creator Profile */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Creator Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <p>{creator_profiles.display_name}</p>
              </div>
              <div>
                <Label>Bio</Label>
                <p>{creator_profiles.bio}</p>
              </div>
              <div>
                <Label>Content Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {creator_profiles.content_categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Agreements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agrees to All Documents</Label>
                <p>{agreements.agrees_to_all_docs ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label>Signature Date</Label>
                <p>{format(new Date(agreements.signature_date), 'PPP')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {application.status === 'pending' && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="denialReason">Reason for Denial (if applicable)</Label>
                <Textarea
                  id="denialReason"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="Enter reason for denial..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isSubmitting}
                >
                  Reject Application
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isSubmitting}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
