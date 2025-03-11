
import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';

interface InputWithIconProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  icon: ReactNode;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
  form,
  name,
  label,
  placeholder,
  icon,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                {icon}
              </div>
              <Input
                placeholder={placeholder}
                className="pl-10"
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InputWithIcon;
