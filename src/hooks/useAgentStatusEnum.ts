
import { useEnumValues, type EnumOption } from './useEnumValues';

export const useAgentStatusEnum = () => {
  return useEnumValues('agent_status_enum');
};

// Alternative static version for immediate use
export const useAgentStatusOptions = () => {
  return {
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] as EnumOption[],
    loading: false,
    error: null
  };
};
