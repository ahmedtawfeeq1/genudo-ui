
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdvancedOptionsProps {
  externalOpportunityId: string;
  onExternalOpportunityIdChange: (value: string) => void;
  error?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  externalOpportunityId,
  onExternalOpportunityIdChange,
  error,
  open,
  setOpen,
}) => (
  <Accordion
    type="single"
    collapsible
    value={open ? 'advanced' : undefined}
    onValueChange={val => setOpen(Boolean(val))}
    className="mb-4"
  >
    <AccordionItem value="advanced">
      <AccordionTrigger>
        <span className="font-semibold text-sm text-gray-600">Advanced Options</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 pt-2">
          <Label htmlFor="external_opportunity_id" className="text-sm font-medium text-gray-700">
            External Opportunity ID
          </Label>
          <Input
            id="external_opportunity_id"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={externalOpportunityId}
            onChange={e => onExternalOpportunityIdChange(e.target.value)}
            placeholder="e.g., 123456 from external CRM"
            className={`border-gray-300 focus:border-blue-500 transition-colors ${error ? 'border-red-300 focus:border-red-500' : ''}`}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Use this field to link opportunities with records in other CRMs or integrations. Numeric only.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default AdvancedOptions;
