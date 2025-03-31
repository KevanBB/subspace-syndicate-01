import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  date_of_birth: z.string().refine(value => {
    const date = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, {
    message: "You must be at least 18 years old.",
  }),
  address: z.string().min(5, {
    message: "Please provide your full address.",
  }),
  id_front: z.any()
    .refine(files => files?.length === 1, "Front ID image is required.")
    .refine(files => files?.[0]?.size <= 5000000, "Max file size is 5MB."),
  id_back: z.any()
    .refine(files => files?.length === 1, "Back ID image is required.")
    .refine(files => files?.[0]?.size <= 5000000, "Max file size is 5MB."),
  selfie: z.any()
    .refine(files => files?.length === 1, "Selfie with ID is required.")
    .refine(files => files?.[0]?.size <= 5000000, "Max file size is 5MB."),
  terms_agreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms." }),
  }),
});

const CreatorApplicationForm = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      address: "",
      terms_agreed: false,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (file: File, path: string) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive"
      });
      return null;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive"
      });
      return null;
    }
    
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    // Check if the bucket exists and create it if not
    const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('Error checking buckets:', bucketError);
      return null;
    }
    
    const bucketExists = bucketData.some(bucket => bucket.name === 'identity-documents');
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('identity-documents', {
        public: false,
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
        return null;
      }
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('identity-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        // Use progress tracking if supported
        onProgress: (event) => {
          const progress = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        }
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    return fileName;
  };

  const handleSelfieUpload = async (file: File) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG file for your selfie.",
        variant: "destructive"
      });
      return null;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive"
      });
      return null;
    }
    
    const fileName = `${userId}/selfie-${Date.now()}-${file.name}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('identity-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        // Use progress tracking if supported
        onProgress: (event) => {
          const progress = (event.loaded / event.total) * 100;
          console.log(`Selfie upload progress: ${progress.toFixed(2)}%`);
        }
      });
    
    if (error) {
      console.error('Error uploading selfie:', error);
      toast({
        title: "Selfie upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    return fileName;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your application.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload ID front
      const idFrontFile = values.id_front[0];
      const idFrontPath = await handleFileUpload(idFrontFile, 'id_front');
      if (!idFrontPath) {
        throw new Error("Failed to upload front ID");
      }

      // Upload ID back
      const idBackFile = values.id_back[0];
      const idBackPath = await handleFileUpload(idBackFile, 'id_back');
      if (!idBackPath) {
        throw new Error("Failed to upload back ID");
      }

      // Upload selfie
      const selfieFile = values.selfie[0];
      const selfiePath = await handleSelfieUpload(selfieFile);
      if (!selfiePath) {
        throw new Error("Failed to upload selfie");
      }

      // Submit application to database
      const { data, error } = await supabase
        .from('creator_applications')
        .insert({
          user_id: userId,
          full_name: values.full_name,
          date_of_birth: values.date_of_birth,
          address: values.address,
          id_front_storage_path: idFrontPath,
          id_back_storage_path: idBackPath,
          selfie_storage_path: selfiePath,
          status: 'pending_application',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update user profile to indicate application submitted
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          creator_status: 'application_submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Application submitted",
        description: "Your creator application has been submitted for review.",
      });

      // Redirect to dashboard or confirmation page
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your application.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Creator Application</CardTitle>
        <CardDescription>
          Submit your information to become a verified creator on our platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Legal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full legal name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Must match your government-issued ID.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      You must be at least 18 years old.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your full address including street, city, state/province, postal code, and country" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Identity Verification</h3>
              <p className="text-sm text-muted-foreground">
                Please upload clear photos of your government-issued ID and a selfie holding your ID.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="id_front"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>ID Front Side</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center">
                          {idFrontPreview ? (
                            <div className="relative w-full h-40 mb-2">
                              <img 
                                src={idFrontPreview} 
                                alt="ID Front Preview" 
                                className="w-full h-full object-contain border rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => {
                                  setIdFrontPreview(null);
                                  onChange(null);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center">
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-center text-gray-500">
                                Click to upload or drag and drop
                              </p>
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            className={idFrontPreview ? "hidden" : ""}
                            onChange={(e) => {
                              onChange(e.target.files);
                              handleFileChange(e, setIdFrontPreview);
                            }}
                            {...fieldProps}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="id_back"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>ID Back Side</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center">
                          {idBackPreview ? (
                            <div className="relative w-full h-40 mb-2">
                              <img 
                                src={idBackPreview} 
                                alt="ID Back Preview" 
                                className="w-full h-full object-contain border rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => {
                                  setIdBackPreview(null);
                                  onChange(null);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center">
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-center text-gray-500">
                                Click to upload or drag and drop
                              </p>
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            className={idBackPreview ? "hidden" : ""}
                            onChange={(e) => {
                              onChange(e.target.files);
                              handleFileChange(e, setIdBackPreview);
                            }}
                            {...fieldProps}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="selfie"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Selfie with ID</FormLabel>
                    <FormDescription>
                      Take a photo of yourself holding your ID next to your face.
                    </FormDescription>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        {selfiePreview ? (
                          <div className="relative w-full max-w-md h-60 mb-2">
                            <img 
                              src={selfiePreview} 
                              alt="Selfie Preview" 
                              className="w-full h-full object-contain border rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => {
                                setSelfiePreview(null);
                                onChange(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center">
                            <Camera className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-center text-gray-500">
                              Take a selfie with your ID
                            </p>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/jpeg,image/png"
                          className={selfiePreview ? "hidden" : ""}
                          onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e, setSelfiePreview);
                          }}
                          {...fieldProps}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-start space-x-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Important Notice</p>
                  <p>Your ID documents will be securely stored and only accessed by our verification team. We take your privacy seriously.</p>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="terms_agreed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the terms and conditions for creators
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you agree to our <a href="/terms" className="text-primary underline">Terms of Service</a>, <a href="/privacy" className="text-primary underline">Privacy Policy</a>, and <a href="/creator-terms" className="text-primary underline">Creator Agreement</a>.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Shield className="h-4 w-4 mr-1" />
          Your information is securely encrypted
        </div>
      </CardFooter>
    </Card>
  );
};

export default CreatorApplicationForm;
