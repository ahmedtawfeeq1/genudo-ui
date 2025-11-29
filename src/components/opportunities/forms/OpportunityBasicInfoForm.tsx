
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpportunityBasicInfoFormProps {
  formData: {
    opportunity_name: string;
    client_name: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
}

const OpportunityBasicInfoForm: React.FC<OpportunityBasicInfoFormProps> = ({
  formData,
  errors,
  onInputChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="opportunity_name" className="text-sm font-medium">
          Opportunity Name *
        </Label>
        <Input
          id="opportunity_name"
          value={formData.opportunity_name}
          onChange={(e) => onInputChange('opportunity_name', e.target.value)}
          placeholder="Enter opportunity name"
          className={`transition-colors ${errors.opportunity_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
        />
        {errors.opportunity_name && (
          <p className="text-sm text-red-600">{errors.opportunity_name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_name" className="text-sm font-medium">
          Client Name *
        </Label>
        <Input
          id="client_name"
          value={formData.client_name}
          onChange={(e) => onInputChange('client_name', e.target.value)}
          placeholder="Enter client name"
          className={`transition-colors ${errors.client_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
        />
        {errors.client_name && (
          <p className="text-sm text-red-600">{errors.client_name}</p>
        )}
      </div>
    </div>
  );
};

export default OpportunityBasicInfoForm;
