
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';

interface TermsCheckboxProps {
  form: UseFormReturn<any>;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="terms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal">
              I agree to the{" "}
              <a href="#" className="text-crimson hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-crimson hover:underline">
                Privacy Policy
              </a>
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default TermsCheckbox;
