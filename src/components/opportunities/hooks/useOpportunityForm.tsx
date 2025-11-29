
import { useState, useEffect } from 'react';
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Pipeline {
  id: string;
  pipeline_name: string;
}

interface Stage {
  id: string;
  stage_name: string;
}

export const useOpportunityForm = (defaultPipelineId?: string, defaultStageId?: string) => {
  const [formData, setFormData] = useState({
    opportunity_name: '',
    client_name: '',
    client_email: '',
    client_phone_number: '',
    status: 'active' as 'active' | 'won' | 'lost' | 'pending',
    pipeline_id: defaultPipelineId || '',
    stage_id: defaultStageId || '',
    opportunity_notes: '',
    source: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pipeline_id: defaultPipelineId || '',
      stage_id: defaultStageId || '',
    }));
  }, [defaultPipelineId, defaultStageId]);

  useEffect(() => {
    if (formData.pipeline_id) {
      fetchStages(formData.pipeline_id);
    }
  }, [formData.pipeline_id]);

  const fetchPipelines = async () => {
    try {
      await new Promise(res => setTimeout(res, 150));
      setPipelines([
        { id: 'pipe-1', pipeline_name: 'Sales Pipeline' },
        { id: 'pipe-2', pipeline_name: 'Inbound Leads' },
      ]);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch pipelines", variant: "destructive" });
    }
  };

  const fetchStages = async (pipelineId: string) => {
    try {
      await new Promise(res => setTimeout(res, 150));
      const map: Record<string, Stage[]> = {
        'pipe-1': [
          { id: 's1', stage_name: 'New' },
          { id: 's2', stage_name: 'Qualified' },
          { id: 's3', stage_name: 'Won' },
          { id: 's4', stage_name: 'Lost' },
        ],
        'pipe-2': [
          { id: 's1', stage_name: 'New' },
          { id: 's2', stage_name: 'Intake' },
          { id: 's3', stage_name: 'Assigned' },
        ],
      };
      setStages(map[pipelineId] || map['pipe-1']);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch stages", variant: "destructive" });
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.opportunity_name.trim()) {
      newErrors.opportunity_name = 'Opportunity name is required';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (formData.client_email && !validateEmail(formData.client_email)) {
      newErrors.client_email = 'Please enter a valid email address';
    }

    if (formData.client_phone_number && !validatePhone(formData.client_phone_number)) {
      newErrors.client_phone_number = 'Please enter a valid phone number';
    }

    if (!formData.pipeline_id) {
      newErrors.pipeline_id = 'Pipeline is required';
    }

    if (!formData.stage_id) {
      newErrors.stage_id = 'Stage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      opportunity_name: '',
      client_name: '',
      client_email: '',
      client_phone_number: '',
      status: 'active',
      pipeline_id: defaultPipelineId || '',
      stage_id: defaultStageId || '',
      opportunity_notes: '',
      source: '',
    });
    setTags([]);
    setErrors({});
  };

  return {
    formData,
    tags,
    pipelines,
    stages,
    errors,
    setTags,
    fetchPipelines,
    validateForm,
    handleInputChange,
    resetForm,
  };
};
