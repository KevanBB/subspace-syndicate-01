import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  date_of_birth: z.string().refine((date) => {
    const dob = new Date(date);
    const age = new Date().getFullYear() - dob.getFullYear();
    return age >= 18;
  }, "You must be at least 18 years old"),
  id_front_storage_path: z.string().min(1, "Front ID image is required"),
  id_back_storage_path: z.string().min(1, "Back ID image is required"),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: "personal", title: "Personal Information" },
  { id: "identity", title: "Identity Verification" },
  { id: "terms", title: "Terms & Conditions" },
];

export default function CreatorApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      address: {
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      },
      date_of_birth: "",
      id_front_storage_path: "",
      id_back_storage_path: "",
      terms_accepted: false,
    },
  });

  const handleFileUpload = async (file: File, type: "front" | "back") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${type}_id.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("identity-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (event) => {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          },
        });

      if (uploadError) throw uploadError;

      form.setValue(
        type === "front" ? "id_front_storage_path" : "id_back_storage_path",
        filePath
      );

      toast({
        title: "Success",
        description: `${type === "front" ? "Front" : "Back"} ID uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload ID image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Insert application
      const { error: applicationError } = await supabase
        .from("creator_applications")
        .insert({
          user_id: session.user.id,
          full_name: data.full_name,
          address: data.address,
          date_of_birth: data.date_of_birth,
          id_front_storage_path: data.id_front_storage_path,
          id_back_storage_path: data.id_back_storage_path,
          status: "pending_application",
        });

      if (applicationError) throw applicationError;

      // Update profile status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ creator_status: "pending_application" })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      });

      router.push("/settings");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Progress value={(currentStep / (steps.length - 1)) * 100} className="w-full" />

      <Card>
        <CardContent className="pt-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...form.register("full_name")}
                  placeholder="Enter your full legal name"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  {...form.register("address.street")}
                  placeholder="Enter your street address"
                />
                {form.formState.errors.address?.street && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.address.street.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register("address.city")}
                    placeholder="City"
                  />
                  {form.formState.errors.address?.city && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.address.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    {...form.register("address.state")}
                    placeholder="State/Province"
                  />
                  {form.formState.errors.address?.state && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.address.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    {...form.register("address.postal_code")}
                    placeholder="Postal Code"
                  />
                  {form.formState.errors.address?.postal_code && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.address.postal_code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...form.register("address.country")}
                    placeholder="Country"
                  />
                  {form.formState.errors.address?.country && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.address.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...form.register("date_of_birth")}
                />
                {form.formState.errors.date_of_birth && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.date_of_birth.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Front of ID</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "front");
                  }}
                />
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
                {form.formState.errors.id_front_storage_path && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.id_front_storage_path.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Back of ID</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "back");
                  }}
                />
                {form.formState.errors.id_back_storage_path && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.id_back_storage_path.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Terms of Service</h3>
                  <p className="text-sm text-muted-foreground">
                    Please read our{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Creator Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/acceptable-use"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Acceptable Use Policy
                    </a>
                    .
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms_accepted"
                    {...form.register("terms_accepted")}
                  />
                  <Label htmlFor="terms_accepted">
                    I agree to the Terms of Service and Acceptable Use Policy
                  </Label>
                </div>
                {form.formState.errors.terms_accepted && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.terms_accepted.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous
          </Button>
        )}
        <Button
          type="submit"
          className="ml-auto"
          disabled={isSubmitting}
        >
          {currentStep === steps.length - 1
            ? isSubmitting
              ? "Submitting..."
              : "Submit Application"
            : "Next"}
        </Button>
      </div>
    </form>
  );
} 