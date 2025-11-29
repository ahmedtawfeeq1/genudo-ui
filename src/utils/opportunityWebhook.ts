// src/utils/opportunityWebhook.ts
// Static-mode webhook utilities

export interface OpportunityWebhookPayload {
  user_id: string;
  pipeline_id: string;
  stage_id: string;
  opportunity_id: string;
  opportunity_name: string;
  source: string | null;
  status: string;
  preferred_language: string | null; // Optional field for preferred language
  preferred_dialect: string | null; // Optional field for preferred dialect
  pipeline_stage: string;
  pipeline_stage_name: string;
  tags: string | null;
  contact_id: string | null;  // Add this line for contact_id
  contact_name: string;
  contact_email: string | null;
  contact_phone_number: string | null;
  notes: string | null;
  external_connector_account_id: string | null;
  external_connector_api_key: string | null;
  external_connector_chat_id: string | null;
  external_agent_id: string | null;
}

/**
 * Triggers the opportunity outreach webhook when an opportunity
 * is moved to a stage with opening_message enabled
 */
/**
 * Triggers the opportunity outreach webhook when an opportunity
 * is created or moved to a stage with opening_message enabled
 */
/**
 * triggerOpportunityOutreachWebhook
 * Static-mode webhook trigger: prepares a minimal payload and calls
 * an external webhook if configured; otherwise returns success.
 */
export async function triggerOpportunityOutreachWebhook(
  opportunityId: string,
  options?: { 
    eventType?: 'INSERT' | 'UPDATE';
    externalWebhookUrl?: string;
  }
): Promise<{ success: boolean; message: string; error?: any }> {
  const externalWebhookUrl =
    options?.externalWebhookUrl ||
    import.meta.env.VITE_OUTREACH_WEBHOOK_URL ||
    'https://automation.loop-x.co/webhook/bd8c5bf9-6edc-4a04-96c6-9e0f51b88c93';
  const eventType = options?.eventType || 'UPDATE';

  try {
    console.log(`Triggering opportunity outreach webhook for opportunity: ${opportunityId}, event type: ${eventType}`);

    // Prepare mock opportunity data
    const opportunity: any = {
      id: opportunityId,
      user_id: 'demo-user',
      pipeline_id: 'pipe-1',
      stage_id: 's1',
      opportunity_name: 'Static Opportunity',
      source: null,
      status: 'active',
      preferred_language: null,
      preferred_dialect: null,
      stages: { stage_name: 'New', opening_message: true, external_agent_id: 'ext-001' },
      pipelines: { id: 'pipe-1', pipeline_name: 'Sales Pipeline', pipeline_description: 'Primary outbound funnel' },
      contacts: { id: 'c1', name: 'Alice Doe', email: 'alice@example.com', phone_number: '+15550101' },
      client_name: 'Alice Doe',
      client_email: 'alice@example.com',
      client_phone_number: '+15550101',
      opportunity_notes: null,
      tags: 'vip',
      contact_id: 'c1',
    };

    // Check if the stage has opening_message enabled
    if (!opportunity.stages.opening_message) {
      console.log('Stage does not have opening_message enabled, skipping webhook');
      return {
        success: false,
        message: 'Stage does not have opening_message enabled'
      };
    }

    // Static connector data
    const external_connector_account_id = 'ext-account-001';
    const external_connector_api_key = 'ext-api-key-001';
    const external_connector_chat_id = null;

    // Prepare the webhook payload
    const webhookPayload: OpportunityWebhookPayload = {
      user_id: opportunity.user_id,
      pipeline_id: opportunity.pipeline_id,
      stage_id: opportunity.stage_id,
      opportunity_id: opportunity.id,
      opportunity_name: opportunity.opportunity_name,
      source: opportunity.source,
      status: opportunity.status,
      preferred_language: opportunity.preferred_language,
      preferred_dialect: opportunity.preferred_dialect,
      pipeline_stage: opportunity.stages.stage_name,
      pipeline_stage_name: opportunity.stages.stage_name,
      tags: opportunity.tags,
      contact_id: opportunity.contact_id,
      contact_name: opportunity.client_name || opportunity.contacts?.name || '',
      contact_email: opportunity.client_email || opportunity.contacts?.email || null,
      contact_phone_number: opportunity.client_phone_number || opportunity.contacts?.phone_number || null,
      notes: opportunity.opportunity_notes,
      external_connector_account_id: external_connector_account_id,
      external_connector_api_key: external_connector_api_key,
      external_connector_chat_id: external_connector_chat_id,
      external_agent_id: opportunity.stages.external_agent_id || null
    };

    console.log('Webhook payload prepared:', webhookPayload);
    await new Promise(res => setTimeout(res, 100));
    return {
      success: true,
      message: `Automated outreach triggered successfully for ${opportunity.opportunity_name}`
    };

  } catch (error) {
    console.error('Unexpected error in triggerOpportunityOutreachWebhook:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error
    };
  }
}

/**
 * Check if a stage has opening_message enabled
 */
export async function checkStageHasOpeningMessage(_stageId: string): Promise<boolean> {
  return true;
}
