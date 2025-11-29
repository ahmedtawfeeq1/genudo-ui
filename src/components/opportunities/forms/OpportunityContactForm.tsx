

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpportunityContactFormProps {
  formData: {
    client_email: string;
    client_phone_number: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
}

const OpportunityContactForm: React.FC<OpportunityContactFormProps> = ({
  formData,
  errors,
  onInputChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="client_email" className="text-sm font-medium">
          Client Email
        </Label>
        <Input
          id="client_email"
          type="email"
          value={formData.client_email}
          onChange={(e) => onInputChange('client_email', e.target.value)}
          placeholder="client@example.com"
          className={`transition-colors ${errors.client_email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
        />
        {errors.client_email && (
          <p className="text-sm text-red-600">{errors.client_email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_phone_number" className="text-sm font-medium">
          Client Phone
        </Label>
        <Input
          id="client_phone_number"
          value={formData.client_phone_number}
          onChange={(e) => onInputChange('client_phone_number', e.target.value)}
          placeholder="+1 (555) 123-4567"
          className={`transition-colors ${errors.client_phone_number ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
        />
        {errors.client_phone_number && (
          <p className="text-sm text-red-600">{errors.client_phone_number}</p>
        )}
      </div>
    </div>
  );
};

export default OpportunityContactForm;
