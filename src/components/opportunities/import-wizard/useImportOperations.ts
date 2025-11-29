
import { useState } from 'react';
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { triggerOpportunityOutreachWebhook } from '@/utils/opportunityWebhook';

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

export const useImportOperations = (pipelineId: string, pipelineData: Pipeline | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createContact = async (opportunityData: ImportedOpportunity) => {
    try {
      const identifier = `${opportunityData.phone}@s.whatsapp.net`;
      await new Promise(res => setTimeout(res, 150));
      return {
        id: `contact-${Date.now()}`,
        user_id: user?.id,
        name: opportunityData.client_name,
        email: opportunityData.email || null,
        phone_number: opportunityData.phone,
        identifier,
        sender_attendee_id: identifier,
        sender_provider_id: identifier,
        blocked: false,
        connector_account_id: pipelineData?.connector_account_id || null
      } as any;
    } catch (error: any) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  };

  const createOpportunity = async (opportunityData: ImportedOpportunity, contactId: string, selectedStage: string) => {
    try {
      await new Promise(res => setTimeout(res, 200));
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
    } catch (error: any) {
      throw new Error(`Failed to create opportunity: ${error.message}`);
    }
  };

  const processBulkImport = async (
    uploadedData: ImportedOpportunity[], 
    selectedStage: string, 
    stages: Stage[]
  ) => {
    setIsProcessing(true);
    const validOpportunities = uploadedData.filter(opp => opp.isValid);
    let successful = 0;
    let failed = 0;
    let webhookTriggered = 0;
    let webhookFailed = 0;
    const createdOpportunityIds: string[] = [];

    const selectedStageInfo = stages.find(s => s.id === selectedStage);
    const shouldTriggerWebhook = selectedStageInfo?.opening_message || false;

    for (const opportunity of validOpportunities) {
      try {
        const contact = await createContact(opportunity);
        const newOpportunity = await createOpportunity(opportunity, contact.id, selectedStage);
        successful++;
        createdOpportunityIds.push(newOpportunity.id);

        if (shouldTriggerWebhook) {
          try {
            const webhookResult = await triggerOpportunityOutreachWebhook(newOpportunity.id, {
              eventType: 'INSERT'
            });
            if (webhookResult.success) {
              webhookTriggered++;
            } else {
              webhookFailed++;
            }
          } catch (webhookError) {
            webhookFailed++;
            console.error('Webhook trigger error:', webhookError);
          }
        }
      } catch (error) {
        console.error('Error importing opportunity:', error);
        failed++;
      }
    }

    const skipped = uploadedData.filter(opp => !opp.isValid).length;
    setIsProcessing(false);

    const results = {
      successful,
      failed,
      skipped,
      total: uploadedData.length,
      webhookTriggered,
      webhookFailed,
      opportunityIds: createdOpportunityIds
    };

    if (successful > 0) {
      let message = `Successfully imported ${successful} opportunities.`;
      if (shouldTriggerWebhook) {
        message += ` Webhook triggered for ${webhookTriggered} opportunities.`;
        if (webhookFailed > 0) {
          message += ` ${webhookFailed} webhook(s) failed.`;
        }
      }
      toast({
        title: "Import Complete",
        description: message
      });
    }

    return results;
  };

  return {
    isProcessing,
    processBulkImport
  };
};
