import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, Phone, User, Building, FileText, DollarSign, Trash2, Calendar, MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
/**
 * UnifiedOpportunityModal
 * Static UI implementation for create/update opportunity dialog.
 * - Preserves structure, validations, and interactions
 * - Replaces backend fetch/mutations with local mocks
 * Integration points to replace later:
 * - fetchPipelines, fetchStages, fetchContacts
 * - createContact, createOpportunity, updateOpportunity, deleteContact
 */
import { useToast } from '@/hooks/use-toast';
import { EnumSelect } from '@/components/ui/enum-select';
import TagInput from '@/components/ui/tag-input';
import { triggerOpportunityOutreachWebhook } from '@/utils/opportunityWebhook';
import { findConversationByOpportunityId, getPipelineIdFromOpportunity } from '@/utils/conversationLookup';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AdvancedOptions from './AdvancedOptions';
import OpportunityDetailsSection from './OpportunityDetailsSection';
import ClientInformationSection from './ClientInformationSection';
import NotesSection from './NotesSection';
import OpportunityStatusBadge from './OpportunityStatusBadge';
import OpportunityDeleteDialog from './OpportunityDeleteDialog';

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

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
}

interface OpportunityData {
  id?: string;
  opportunity_name: string;
  client_name: string;
  client_email: string | null;
  client_phone_number: string | null;
  status: 'active' | 'pending' | 'won' | 'lost';
  pipeline_id: string;
  stage_id: string;
  contact_id?: string;
  opportunity_notes: string | null;
  source: string | null;
  tags: string | null;
  preferred_language: string | null;
  preferred_dialect: string | null;
  external_opportunity_id?: string | null;
  created_at?: string;
  pipeline_name?: string;
  stage_name?: string;
}

interface UnifiedOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (opportunity?: any) => void;
  mode: 'create' | 'update';
  opportunity?: OpportunityData;
  defaultPipelineId?: string;
  defaultStageId?: string;
}

const UnifiedOpportunityModal: React.FC<UnifiedOpportunityModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  mode,
  opportunity,
  defaultPipelineId,
  defaultStageId
}) => {
  const [loading, setLoading] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // NEW: State for inbox button
  const [inboxLoading, setInboxLoading] = useState(false);

  const [formData, setFormData] = useState({
    opportunity_name: '',
    client_name: '',
    client_email: '',
    client_phone_number: '',
    status: 'active' as 'active' | 'pending' | 'won' | 'lost',
    pipeline_id: '',
    stage_id: '',
    contact_id: '',
    opportunity_notes: '',
    source: '',
    preferred_language: '',
    preferred_dialect: '',
    external_opportunity_id: '' as string
  });

  const user: any = { id: 'demo-user' };
  const { toast } = useToast();
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];

  // NEW: Handle inbox button click
  const handleOpenInbox = async () => {
    if (!opportunity?.pipeline_id) {
      toast({ title: "Error", description: "Missing pipeline info", variant: "destructive" });
      return;
    }
    setInboxLoading(true);
    try {
      navigate(`/inboxes/${opportunity.pipeline_id}`);
      onOpenChange(false);
      toast({ title: "Success", description: "Opening pipeline inbox (static)" });
    } finally {
      setInboxLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      opportunity_name: '',
      client_name: '',
      client_email: '',
      client_phone_number: '',
      status: 'active',
      pipeline_id: '',
      stage_id: '',
      contact_id: '',
      opportunity_notes: '',
      source: '',
      preferred_language: '',
      preferred_dialect: '',
      external_opportunity_id: ''
    });
    setTags([]);
    setErrors({});
    setStages([]);
    setTotalCost(0);
  }, []);

  const initializeFormData = useCallback(() => {
    if (mode === 'update' && opportunity) {
      setFormData({
        opportunity_name: opportunity.opportunity_name,
        client_name: opportunity.client_name,
        client_email: opportunity.client_email || '',
        client_phone_number: opportunity.client_phone_number || '',
        status: opportunity.status,
        pipeline_id: opportunity.pipeline_id,
        stage_id: opportunity.stage_id,
        contact_id: opportunity.contact_id || '',
        opportunity_notes: opportunity.opportunity_notes || '',
        source: opportunity.source || '',
        preferred_language: opportunity.preferred_language || '',
        preferred_dialect: opportunity.preferred_dialect || '',
        external_opportunity_id: opportunity.external_opportunity_id !== null && opportunity.external_opportunity_id !== undefined
          ? String(opportunity.external_opportunity_id)
          : ''
      });
      setTags(opportunity.tags ? opportunity.tags.split(',').filter(tag => tag.trim()) : []);
      if (opportunity.id) {
        fetchTotalCost(opportunity.id);
      }
    } else {
      setFormData({
        opportunity_name: '',
        client_name: '',
        client_email: '',
        client_phone_number: '',
        status: 'active',
        pipeline_id: defaultPipelineId || '',
        stage_id: defaultStageId || '',
        contact_id: '',
        opportunity_notes: '',
        source: '',
        preferred_language: '',
        preferred_dialect: '',
        external_opportunity_id: ''
      });
      setTags([]);
      setTotalCost(0);
    }
    setErrors({});
  }, [mode, opportunity, defaultPipelineId, defaultStageId]);

  useLayoutEffect(() => {
    if (open && !isInitialized) {
      setIsInitialized(true);
      if (mode === 'update' && opportunity) {
        if (opportunity.pipeline_name) {
          setPipelines([{ id: opportunity.pipeline_id, pipeline_name: opportunity.pipeline_name, connector_account_id: null }]);
        }
        if (opportunity.stage_name) {
          setStages([{ id: opportunity.stage_id, stage_name: opportunity.stage_name, opening_message: false }]);
        }
      }
      fetchPipelines();
      fetchContacts();
      initializeFormData();
    } else if (!open) {
      setIsInitialized(false);
      resetForm();
    }
  }, [open, isInitialized, mode, opportunity, initializeFormData, resetForm]);

  useLayoutEffect(() => {
    if (open && mode === 'update' && opportunity) {
      setFormData(prev => ({
        ...prev,
        pipeline_id: opportunity.pipeline_id,
        stage_id: opportunity.stage_id,
      }));
      if (pipelines.length === 0 && opportunity.pipeline_name) {
        setPipelines([{ id: opportunity.pipeline_id, pipeline_name: opportunity.pipeline_name, connector_account_id: null }]);
      }
      if (stages.length === 0 && opportunity.stage_name) {
        setStages([{ id: opportunity.stage_id, stage_name: opportunity.stage_name, opening_message: false }]);
      }
    }
  }, [open, mode, opportunity, pipelines.length, stages.length]);

  useLayoutEffect(() => {
    if (open && mode === 'update' && opportunity && stages.length > 0) {
      const exists = stages.some(s => s.id === opportunity.stage_id);
      if (exists) {
        setFormData(prev => ({ ...prev, stage_id: opportunity.stage_id }));
      }
    }
  }, [open, mode, opportunity, stages]);

  useLayoutEffect(() => {
    if (isInitialized && pipelines.length > 0 && mode === 'update' && opportunity) {
      setFormData(prev => ({
        ...prev,
        pipeline_id: opportunity.pipeline_id,
        stage_id: opportunity.stage_id
      }));
    } else if (isInitialized && pipelines.length > 0 && mode === 'create') {
      if (defaultPipelineId && !formData.pipeline_id) {
        setFormData(prev => ({ ...prev, pipeline_id: defaultPipelineId }));
      }
    }
  }, [isInitialized, pipelines.length, mode, opportunity, defaultPipelineId, formData.pipeline_id]);

  useEffect(() => {
    if (formData.pipeline_id && isInitialized && pipelines.length > 0) {
      const preserveStageId = mode === 'update' && opportunity ? opportunity.stage_id : '';
      fetchStages(formData.pipeline_id, preserveStageId);
    }
  }, [formData.pipeline_id, isInitialized, pipelines.length, mode, opportunity]);

  const fetchPipelines = async () => {
    try {
      await new Promise(res => setTimeout(res, 200));
      setPipelines([
        { id: 'pipe-1', pipeline_name: 'Sales Pipeline', connector_account_id: 'acc-1' },
        { id: 'pipe-2', pipeline_name: 'Inbound Leads', connector_account_id: 'acc-2' },
      ]);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch pipelines", variant: "destructive" });
    }
  };

  const fetchStages = async (pipelineId: string, preserveStageId: string = '') => {
    try {
      await new Promise(res => setTimeout(res, 200));
      const data = [
        { id: 's1', stage_name: 'New', opening_message: false },
        { id: 's2', stage_name: 'Qualified', opening_message: false },
        { id: 's3', stage_name: 'Won', opening_message: true },
      ];
      setStages(data);
      if (data.length > 0) {
        if (preserveStageId && data.find(s => s.id === preserveStageId)) {
          // keep
        } else if (mode === 'create' && (!formData.stage_id || !data.find(s => s.id === formData.stage_id))) {
          const targetStageId = defaultStageId && data.find(s => s.id === defaultStageId) ? defaultStageId : data[0].id;
          setFormData(prev => ({ ...prev, stage_id: targetStageId }));
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch stages", variant: "destructive" });
    }
  };

  const fetchContacts = async () => {
    try {
      await new Promise(res => setTimeout(res, 200));
      setContacts([
        { id: 'c1', name: 'Alice Doe', email: 'alice@example.com', phone_number: '+15550101' },
        { id: 'c2', name: 'Bob Roe', email: 'bob@example.com', phone_number: '+15550102' },
      ]);
    } catch {}
  };

  const fetchTotalCost = async (_opportunityId: string) => {
    setTotalCost(0.02);
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    const cleanPhone = phone
      .replace(/[\u202A]/g, '')
      .replace(/[\u202C]/g, '')
      .replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\+]?[0-9]{7,15}$/;
    return phoneRegex.test(cleanPhone);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.opportunity_name.trim()) {
      newErrors.opportunity_name = 'Opportunity name is required';
    }
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }
    if (!formData.pipeline_id) {
      newErrors.pipeline_id = 'Pipeline is required';
    }
    if (!formData.stage_id) {
      newErrors.stage_id = 'Stage is required';
    }
    if (formData.client_email && !validateEmail(formData.client_email)) {
      newErrors.client_email = 'Please enter a valid email address';
    }
    if (formData.client_phone_number && !validatePhone(formData.client_phone_number)) {
      newErrors.client_phone_number = 'Please enter a valid phone number';
    }
    if (formData.external_opportunity_id !== '' && isNaN(Number(formData.external_opportunity_id))) {
      newErrors.external_opportunity_id = 'External Opportunity ID must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createContact = async (contactData: {
    name: string;
    email?: string;
    phone_number?: string;
    connector_account_id?: string | null;
  }) => {
    await new Promise(res => setTimeout(res, 300));
    return { id: 'contact-new', name: contactData.name, email: contactData.email || null, phone_number: contactData.phone_number || null } as any;
  };

  const createOpportunity = async (contactId: string) => {
    await new Promise(res => setTimeout(res, 400));
    return {
      id: `opp-${Date.now()}`,
      pipeline_id: formData.pipeline_id,
      stage_id: formData.stage_id,
      contact_id: contactId,
      opportunity_name: formData.opportunity_name.trim(),
      client_name: formData.client_name.trim(),
      client_email: formData.client_email.trim() || null,
      client_phone_number: formData.client_phone_number.trim() || null,
      opportunity_notes: formData.opportunity_notes.trim() || null,
      preferred_language: formData.preferred_language.trim() || null,
      preferred_dialect: formData.preferred_dialect.trim() || null,
      tags: tags.length > 0 ? tags.join(',') : null,
      status: formData.status,
      source: formData.source.trim() || null,
    } as any;
  };

  const updateOpportunity = async () => {
    await new Promise(res => setTimeout(res, 400));
    // Non-persistent in static mode; simulate webhook trigger
    const selectedStage = stages.find(s => s.id === formData.stage_id);
    if (selectedStage?.opening_message) {
      try { await triggerOpportunityOutreachWebhook(opportunity!.id!, { eventType: 'UPDATE' }); } catch {}
    }
  };

  const handleModalClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };

      if (field === 'external_opportunity_id') {
        if (value === '') {
          newFormData.external_opportunity_id = '';
        } else if (/^\d+$/.test(value)) {
          newFormData.external_opportunity_id = value;
        } else {
          return prev;
        }
      }

      if (field === 'stage_id' && value) {
        const selectedStage = stages.find(stage => stage.id === value);
        if (selectedStage) {
          const stageName = selectedStage.stage_name.toLowerCase();
          let newStatus = prev.status;

          if (stageName.includes('won') ||
            stageName.includes('closed') ||
            stageName.includes('deal closed') ||
            stageName.includes('completed') ||
            stageName.includes('success')) {
            newStatus = 'won';
          } else if (stageName.includes('lost') ||
            stageName.includes('rejected') ||
            stageName.includes('declined') ||
            stageName.includes('cancelled') ||
            stageName.includes('failed')) {
            newStatus = 'lost';
          }

          if (newStatus !== prev.status) {
            toast({
              title: "Status Updated",
              description: `Opportunity status automatically changed to "${newStatus}" based on stage selection.`,
            });
            newFormData.status = newStatus as 'active' | 'pending' | 'won' | 'lost';
          }
        }
      }

      return newFormData;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        const selectedPipeline = pipelines.find(p => p.id === formData.pipeline_id);
        const connectorAccountId = selectedPipeline?.connector_account_id;

        const newContact = await createContact({
          name: formData.client_name,
          email: formData.client_email,
          phone_number: formData.client_phone_number,
          connector_account_id: connectorAccountId
        });

        const newOpportunity = await createOpportunity(newContact.id);

        const selectedStage = stages.find(s => s.id === formData.stage_id);
        if (selectedStage?.opening_message) {
          try {
            await triggerOpportunityOutreachWebhook(newOpportunity.id, {
              eventType: 'INSERT'
            });
            toast({
              title: "Success",
              description: "Opportunity created successfully! Automated outreach has been triggered.",
            });
          } catch (webhookError) {
            toast({
              title: "Success",
              description: "Opportunity created successfully, but automated outreach may have failed.",
            });
          }
        } else {
          toast({
            title: "Success",
            description: "Opportunity created successfully",
          });
        }

        onSuccess(newOpportunity);
      } else {
        await updateOpportunity();
        toast({
          title: "Success",
          description: "Opportunity updated successfully"
        });
        onSuccess(opportunity);
      }

      handleModalClose();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} opportunity`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteContact = async () => {
    if (!opportunity?.contact_id || mode !== 'update') return;
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 300));
      toast({ title: 'Success', description: 'Contact and related opportunities deleted (static)' });
      onSuccess();
      handleModalClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete contact', variant: 'destructive' });
    } finally {
      setShowDeleteDialog(false);
      setLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!opportunity?.id || mode !== 'update') return;

    setShowDeleteDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'won':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lost':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent
          className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <DialogHeader className="space-y-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-semibold text-gray-900 truncate">
                    {mode === 'create' ? 'Create New Opportunity' : opportunity?.opportunity_name}
                  </DialogTitle>
                  {mode === 'update' && opportunity && (
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Created {new Date(opportunity.created_at!).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                {mode === 'update' && (
                  <OpportunityStatusBadge
                    status={opportunity?.status || 'active'}
                    totalCost={totalCost}
                    getStatusColor={getStatusColor}
                    getStatusDisplay={getStatusDisplay}
                  />
                )}
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              <OpportunityDetailsSection
                formData={formData}
                errors={errors}
                pipelines={pipelines}
                stages={stages}
                tags={tags}
                onInputChange={handleInputChange}
                setTags={setTags}
                statusOptions={statusOptions}
                defaultStageId={defaultStageId}
                showInboxButton={mode === 'update' && !!opportunity?.id}
                onInboxClick={handleOpenInbox}
                inboxLoading={inboxLoading}
                pipelineReadOnly={mode === 'update'}
              />

              <AdvancedOptions
                externalOpportunityId={formData.external_opportunity_id}
                onExternalOpportunityIdChange={value => handleInputChange('external_opportunity_id', value)}
                error={errors.external_opportunity_id}
                open={advancedOpen}
                setOpen={setAdvancedOpen}
              />

              <Separator />

              <ClientInformationSection
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
              />

              <Separator />

              <NotesSection
                opportunityNotes={formData.opportunity_notes}
                onNotesChange={value => handleInputChange('opportunity_notes', value)}
              />

            </form>
          </div>

          {/* Modern Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            {mode === 'update' ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} Opportunity`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OpportunityDeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        loading={loading}
        deleteContact={deleteContact}
      />
    </>
  );
};

export default UnifiedOpportunityModal;
