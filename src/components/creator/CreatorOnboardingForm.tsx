'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { SubscriptionTierEditor } from '@/components/creator/SubscriptionTierEditor';
import { toast } from 'sonner';

const profileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  avatar_url: z.string().optional(),
  banner_image_url: z.string().optional(),
});

const subscriptionTierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().min(1, 'Price must be at least $1'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SubscriptionTierFormData = z.infer<typeof subscriptionTierSchema>;

export function CreatorOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTierFormData[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          bio: data.bio,
          avatar_url: data.avatar_url,
          banner_image_url: data.banner_image_url,
          creator_status: 'active',
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Create subscription tiers
      if (subscriptionTiers.length > 0) {
        const { error: tiersError } = await supabase
          .from('subscription_tiers')
          .insert(
            subscriptionTiers.map(tier => ({
              creator_id: session.user.id,
              name: tier.name,
              price: tier.price * 100, // Convert to cents
              description: tier.description,
              benefits: tier.benefits,
            }))
          );

        if (tiersError) throw tiersError;
      }

      toast.success('Profile setup completed successfully!');
      router.push('/creator/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (type: 'avatar' | 'banner', url: string) => {
    setValue(type === 'avatar' ? 'avatar_url' : 'banner_image_url', url);
  };

  const handleAddTier = (tier: SubscriptionTierFormData) => {
    setSubscriptionTiers([...subscriptionTiers, tier]);
  };

  const handleRemoveTier = (index: number) => {
    setSubscriptionTiers(subscriptionTiers.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Basic Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                {...register('display_name')}
                placeholder="Your public display name"
              />
              {errors.display_name && (
                <p className="text-sm text-red-500">{errors.display_name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                {...register('bio')}
                placeholder="Tell your audience about yourself"
                className="min-h-[100px]"
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>
            <Button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={isSubmitting}
            >
              Next Step
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Profile Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Profile Picture</label>
              <ImageUpload
                onUpload={(url) => handleImageUpload('avatar', url)}
                aspectRatio={1}
                maxSize={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Banner Image</label>
              <ImageUpload
                onUpload={(url) => handleImageUpload('banner', url)}
                aspectRatio={16/9}
                maxSize={5}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
              >
                Previous Step
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={isSubmitting}
              >
                Next Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Subscription Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubscriptionTierEditor
              tiers={subscriptionTiers}
              onAdd={handleAddTier}
              onRemove={handleRemoveTier}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                disabled={isSubmitting}
              >
                Previous Step
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || subscriptionTiers.length === 0}
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
} 