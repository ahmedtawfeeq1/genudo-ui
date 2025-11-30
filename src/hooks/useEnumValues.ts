
import { useState, useEffect } from 'react';
 

export interface EnumOption {
  value: string;
  label: string;
}

export const useEnumValues = (enumName: string): { options: EnumOption[]; loading: boolean; error: string | null } => {
  const [options, setOptions] = useState<EnumOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnumValues = async () => {
      try {
        if (enumName === 'opportunity_status') {
          setOptions([
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'won', label: 'Won' },
            { value: 'lost', label: 'Lost' },
            { value: 'duplicate', label: 'Duplicate' },
            { value: 'inactive', label: 'Inactive' }
          ]);
        } else if (enumName === 'agent_status_enum') {
          setOptions([
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]);
        } else {
          setOptions([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (enumName) {
      fetchEnumValues();
    } else {
      setLoading(false);
    }
  }, [enumName]);

  return { options, loading, error };
};

export const useActionTypes = () => {
  return {
    options: [
      { value: 'get_available_slots', label: 'Get Available Slots' },
      { value: 'book_meeting', label: 'Book Meeting' },
      { value: 'collect_data', label: 'Collect Data' },
      { value: 'custom_action', label: 'Custom Action' }
    ] as EnumOption[],
    loading: false,
    error: null
  };
};

export const useTriggerConditions = () => {
  return {
    options: [
      { value: 'on_stage_entry', label: 'On Stage Entry' },
      { value: 'on_user_message', label: 'On User Message' },
      { value: 'post_response', label: 'Post Response' }
    ] as EnumOption[],
    loading: false,
    error: null
  };
};
