
import { useEnumValues, type EnumOption } from './useEnumValues';

export const useOpportunityStatusEnum = () => {
  return useEnumValues('opportunity_status');
};

// Static version - matches current database enum values
export const useOpportunityStatusOptions = () => {
  return {
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'won', label: 'Won' },
      { value: 'lost', label: 'Lost' }
    ] as EnumOption[],
    loading: false,
    error: null
  };
};
