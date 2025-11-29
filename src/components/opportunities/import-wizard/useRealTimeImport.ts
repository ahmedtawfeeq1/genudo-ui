import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ImportedOpportunity {
  client_name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  preferred_language: string;
  preferred_dialect: string;
  isValid: boolean;
  errors: string[];
}

interface ProcessingStatus {
  current: number;
  total: number;
  currentClient: string;
  currentPhone: string;
  status: 'processing' | 'completed' | 'error';
  message?: string;
}

interface ImportResults {
  successful: number;
  failed: number;
  skipped: number;
  total: number;
  webhookTriggered: number;
  webhookFailed: number;
  opportunityIds: string[];
}

interface Pipeline {
  id: string;
  pipeline_name: string;
  connector_account_id: string | null;
}

interface Stage {
  id: string;
  stage_name: string;
  opening_message: boolean;
}

export const useRealTimeImport = (pipelineId: string, pipelineData: Pipeline | null) => {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    current: 0,
    total: 0,
    currentClient: '',
    currentPhone: '',
    status: 'processing'
  });
  const [importResults, setImportResults] = useState<ImportResults>({
    successful: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    webhookTriggered: 0,
    webhookFailed: 0,
    opportunityIds: []
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Format WhatsApp number to display only the phone number part
  const formatWhatsAppNumber = (phone: string): string => {
    return phone.replace('@s.whatsapp.net', '');
  };

  const createContact = async (opportunityData: ImportedOpportunity) => {
    await new Promise(res => setTimeout(res, 100));
    const identifier = `${opportunityData.phone}@s.whatsapp.net`;
    return {
      id: `contact-${Date.now()}`,
      user_id: user?.id,
      name: opportunityData.client_name,
      email: opportunityData.email || null,
      phone_number: opportunityData.phone,
      identifier,
      blocked: false,
      connector_account_id: pipelineData?.connector_account_id || null
    } as any;
  };

  const createOpportunity = async (opportunityData: ImportedOpportunity, contactId: string, selectedStage: string) => {
    await new Promise(res => setTimeout(res, 100));
    return {
      id: `opp-${Date.now()}`,
      user_id: user?.id,
      pipeline_id: pipelineId,
      stage_id: selectedStage,
      contact_id: contactId,
      opportunity_name: `${opportunityData.client_name} - Opportunity`,
      client_name: opportunityData.client_name,
      client_email: opportunityData.email || null,
      client_phone_number: opportunityData.phone,
      opportunity_notes: opportunityData.notes || null,
      preferred_language: opportunityData.preferred_language,
      preferred_dialect: opportunityData.preferred_dialect,
      source: opportunityData.source || null,
      status: 'active'
    } as any;
  };

  const processRealTimeImport = useCallback(async (
    uploadedData: ImportedOpportunity[], 
    selectedStage: string, 
    stages: Stage[]
  ) => {
    console.log('🚀 Starting import process - NO WEBHOOKS');
    
    const validOpportunities = uploadedData.filter(opp => opp.isValid);
    const skipped = uploadedData.filter(opp => !opp.isValid).length;
    
    let successful = 0;
    let failed = 0;
    const createdOpportunityIds: string[] = [];

    // REMOVED: Webhook triggering logic to prevent duplicate messages
    // const selectedStageInfo = stages.find(s => s.id === selectedStage);
    // const shouldTriggerWebhook = selectedStageInfo?.opening_message || false;

    // Initialize processing status
    setProcessingStatus({
      current: 0,
      total: validOpportunities.length,
      currentClient: '',
      currentPhone: '',
      status: 'processing'
    });

    for (let i = 0; i < validOpportunities.length; i++) {
      const opportunity = validOpportunities[i];
      
      // Update current processing status
      setProcessingStatus(prev => ({
        ...prev,
        current: i + 1,
        currentClient: opportunity.client_name,
        currentPhone: formatWhatsAppNumber(opportunity.phone),
        status: 'processing'
      }));

      try {
        const contact = await createContact(opportunity);
        const newOpportunity = await createOpportunity(opportunity, contact.id, selectedStage);
        successful++;
        createdOpportunityIds.push(newOpportunity.id);

        // REMOVED: All webhook triggering to prevent duplicate messages
        // Outreach will be handled by the single bulk outreach call instead

        // Small delay to show the real-time progress
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error importing opportunity:', error);
        failed++;
      }
    }

    // Mark processing as completed
    setProcessingStatus(prev => ({
      ...prev,
      status: 'completed'
    }));

    const results = {
      successful,
      failed,
      skipped,
      total: uploadedData.length,
      webhookTriggered: 0, // No webhooks triggered
      webhookFailed: 0,    // No webhooks failed
      opportunityIds: createdOpportunityIds
    };

    setImportResults(results);

    if (successful > 0) {
      console.log(`✅ Import completed: ${successful} opportunities created (no webhooks triggered)`);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successful} opportunities.`
      });
    }

    return results;
  }, [pipelineId, pipelineData, user?.id, toast]);

  return {
    processingStatus,
    importResults,
    processRealTimeImport
  };
};
