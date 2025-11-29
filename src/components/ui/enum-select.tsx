
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEnumValues, type EnumOption } from '@/hooks/useEnumValues';

interface EnumSelectProps {
  enumName?: string;
  options?: EnumOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const EnumSelect: React.FC<EnumSelectProps> = ({
  enumName,
  options: providedOptions,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className
}) => {
  const { options: fetchedOptions, loading } = useEnumValues(enumName || '');
  
  const options = providedOptions || fetchedOptions;

  if (loading && !providedOptions) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
