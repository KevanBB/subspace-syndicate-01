
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Form } from "@/components/ui/form";
import InputWithIcon from './InputWithIcon';
import PasswordInput from './PasswordInput';
import TermsCheckbox from './TermsCheckbox';
import { signupSchema, SignupFormValues } from './signupValidation';

interface SignupFormProps {
  onSignupSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: undefined as unknown as true,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Only pass username to metadata, as it's the only profile data we need now
      const userData = {
        username: data.username,
      };

      const { error } = await signUp(data.email, data.password, userData);
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <InputWithIcon
            form={form}
            name="username"
            label="Username"
            placeholder="Choose a unique username"
            icon={<User className="h-4 w-4" />}
          />

          <InputWithIcon
            form={form}
            name="email"
            label="Email"
            placeholder="your@email.com"
            icon={<Mail className="h-4 w-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              form={form}
              name="password"
              label="Password"
            />

            <PasswordInput
              form={form}
              name="confirmPassword"
              label="Confirm Password"
            />
          </div>
        </div>

        <TermsCheckbox form={form} />

        <Button
          type="submit"
          className="w-full bg-crimson hover:bg-crimson/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
