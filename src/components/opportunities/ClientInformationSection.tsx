
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone, User } from 'lucide-react';

interface ClientInformationSectionProps {
  formData: any;
  errors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
}

const ClientInformationSection: React.FC<ClientInformationSectionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client_name" className="text-sm font-medium text-gray-700">
            Client Name *
          </Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={e => onInputChange('client_name', e.target.value)}
            placeholder="Enter client name"
            className={`transition-colors ${errors.client_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.client_name && <p className="text-sm text-red-600">{errors.client_name}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client_email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={e => onInputChange('client_email', e.target.value)}
                placeholder="client@example.com"
                className={`pl-10 transition-colors ${errors.client_email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
              />
            </div>
            {errors.client_email && <p className="text-sm text-red-600">{errors.client_email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_phone_number" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="client_phone_number"
                value={formData.client_phone_number}
                onChange={e => onInputChange('client_phone_number', e.target.value)}
                placeholder="+974 5591 1996 or +1 555 123 4567"
                className={`pl-10 transition-colors ${errors.client_phone_number ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
              />
            </div>
            {errors.client_phone_number && <p className="text-sm text-red-600">{errors.client_phone_number}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInformationSection;
