
import React, { useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';

interface DateFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  disableFutureDates?: boolean;
  minAge?: number;
  placeholder?: string;
}

const DateField: React.FC<DateFieldProps> = ({
  form,
  name,
  label,
  disableFutureDates = false,
  minAge = 0,
  placeholder = "MM/DD/YYYY"
}) => {
  const [dateInputValue, setDateInputValue] = useState<string>("");

  const handleDateInput = (rawValue: string, field: any) => {
    setDateInputValue(rawValue);
    
    const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MM-dd-yyyy', 'dd-MM-yyyy'];
    
    for (const dateFormat of formats) {
      const parsedDate = parse(rawValue, dateFormat, new Date());
      if (isValid(parsedDate)) {
        if (minAge > 0) {
          const now = new Date();
          const cutoffDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
          
          if (parsedDate <= cutoffDate) {
            field.onChange(parsedDate);
          }
        } else {
          field.onChange(parsedDate);
        }
        return;
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder={placeholder}
                className="pl-10"
                value={dateInputValue || (field.value ? format(field.value, 'MM/dd/yyyy') : '')}
                onChange={(e) => handleDateInput(e.target.value, field)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    if (date) {
                      setDateInputValue(format(date, 'MM/dd/yyyy'));
                    }
                  }}
                  disabled={(date) => {
                    if (disableFutureDates) {
                      return date > new Date();
                    }
                    
                    if (minAge > 0) {
                      const now = new Date();
                      const cutoffDate = new Date(
                        now.getFullYear() - minAge,
                        now.getMonth(),
                        now.getDate()
                      );
                      return date > cutoffDate;
                    }
                    
                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateField;
