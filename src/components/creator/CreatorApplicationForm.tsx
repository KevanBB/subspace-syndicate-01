'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Icons } from '@/components/ui/icons';
import { ensureNonNull } from '@/utils/supabaseUtils';

const CreatorApplicationForm: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryOfResidence, setCountryOfResidence] = useState('');
  const [address, setAddress] = useState('');
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [agreesToTerms, setAgreesToTerms] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [frontProgress, setFrontProgress] = useState(0);
  const [backProgress, setBackProgress] = useState(0);
  const [selfieProgress, setSelfieProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to submit an application.');
      return;
    }

    if (!fullName || !dateOfBirth || !countryOfResidence || !address || !frontIdFile || !backIdFile) {
      setError('All fields are required');
      return;
    }

    if (!agreesToTerms || !isOver18) {
      setError('You must agree to the terms and confirm you are over 18.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create application record
      const { data: application, error: appError } = await supabase
        .from('creator_applications')
        .insert({
          user_id: user.id,
          date_submitted: new Date().toISOString(),
          agrees_to_terms: agreesToTerms,
          is_over_18: isOver18,
          status: 'pending',
        })
        .select()
        .single();

      if (appError) throw appError;

      const userId = user.id;

      // 2. Upload files and get URLs
      const uploadFiles = async () => {
        if (!frontIdFile || !backIdFile) {
          setError('Both front and back ID images are required');
          return false;
        }

        try {
          setUploading(true);
          const frontKey = `${userId}/id_front.${frontIdFile.name.split('.').pop()}`;
          const backKey = `${userId}/id_back.${backIdFile.name.split('.').pop()}`;

          // Upload front ID
          const { error: frontError } = await supabase.storage
            .from('identity-documents')
            .upload(frontKey, frontIdFile, {
              cacheControl: '3600',
              upsert: true,
              // Use a different approach for upload progress
              onUpload: (event: any) => {
                if (event.progress) {
                  setFrontProgress(event.progress);
                }
              }
            });

          if (frontError) throw frontError;

          // Upload back ID
          const { error: backError } = await supabase.storage
            .from('identity-documents')
            .upload(backKey, backIdFile, {
              cacheControl: '3600',
              upsert: true,
              // Use a different approach for upload progress
              onUpload: (event: any) => {
                if (event.progress) {
                  setBackProgress(event.progress);
                }
              }
            });

          if (backError) throw backError;

          return { frontKey, backKey };
        } catch (error) {
          console.error('Error uploading files:', error);
          setError('Failed to upload identity documents');
          return false;
        } finally {
          setUploading(false);
        }
      };

      const fileKeys = await uploadFiles();

      if (!fileKeys) {
        setSubmitting(false);
        return;
      }

      // 3. Create identity record
      const { error: identityError } = await supabase
        .from('identities')
        .insert({
          application_id: application.id,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          country_of_residence: countryOfResidence,
          address: address,
          government_id_front_url: fileKeys.frontKey,
          government_id_back_url: fileKeys.backKey,
          selfie_url: '', // Implement selfie upload later
        });

      if (identityError) throw identityError;

      toast.success('Application submitted successfully!');
      router.push('/profile');
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card className="bg-black/30 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Creator Application</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-black/30 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="bg-black/30 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="countryOfResidence">Country of Residence</Label>
              <Input
                type="text"
                id="countryOfResidence"
                value={countryOfResidence}
                onChange={(e) => setCountryOfResidence(e.target.value)}
                required
                className="bg-black/30 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="bg-black/30 border-white/10 resize-none"
              />
            </div>
            <div>
              <Label htmlFor="frontId">Front of Government-Issued ID</Label>
              <Input
                type="file"
                id="frontId"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFrontIdFile)}
                required
                className="bg-black/30 border-white/10 file:bg-black/50 file:border-0 file:text-white"
              />
              {uploading && <progress value={frontProgress} max="100"> {frontProgress}% </progress>}
            </div>
            <div>
              <Label htmlFor="backId">Back of Government-Issued ID</Label>
              <Input
                type="file"
                id="backId"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setBackIdFile)}
                required
                className="bg-black/30 border-white/10 file:bg-black/50 file:border-0 file:text-white"
              />
              {uploading && <progress value={backProgress} max="100"> {backProgress}% </progress>}
            </div>
            <div>
              <Label htmlFor="terms">
                <Checkbox
                  id="terms"
                  checked={agreesToTerms}
                  onCheckedChange={(checked) => setAgreesToTerms(!!checked)}
                  required
                  className="mr-2"
                />
                I agree to the <a href="/terms" className="text-blue-500" target="_blank">Terms and Conditions</a>
              </Label>
            </div>
            <div>
              <Label htmlFor="over18">
                <Checkbox
                  id="over18"
                  checked={isOver18}
                  onCheckedChange={(checked) => setIsOver18(!!checked)}
                  required
                  className="mr-2"
                />
                I confirm that I am over 18 years of age.
              </Label>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorApplicationForm;
