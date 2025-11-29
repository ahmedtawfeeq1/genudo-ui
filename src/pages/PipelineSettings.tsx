
// PipelineSettings page: Analytics tab temporarily hidden (commented out)
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModernLayout from "@/components/layout/ModernLayout";
import { Button } from "@/components/ui/button";
import PipelineSettingsHeader from "@/components/pipeline-settings/PipelineSettingsHeader";
// import AnalyticsTab from "@/components/pipeline-settings/AnalyticsTab";
import SettingsTab from "@/components/pipeline-settings/SettingsTab";
import DangerZoneTab from "@/components/pipeline-settings/DangerZoneTab";
import AIConfigurationTab from "@/components/pipeline-settings/AIConfigurationTab";
import DeletePipelineDialog from "@/components/pipeline-settings/DeletePipelineDialog";
import WhatsAppConnectionFlow from "@/components/whatsapp/WhatsAppConnectionFlow";
import SwitchChannelDialog from "@/components/whatsapp/SwitchChannelDialog";
import DeleteChannelDialog from "@/components/whatsapp/DeleteChannelDialog";
import ChannelReconnectDialog from "@/components/pipeline-settings/ChannelReconnectDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Settings as SettingsIcon, Shield, Bot } from "lucide-react";
import { usePipelineSettingsData } from "@/hooks/usePipelineSettingsData";
import { useToast } from "@/hooks/use-toast";
 

// Component: PipelineSettings — default tab set to "settings"; Analytics trigger/content commented out
const PipelineSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Pipeline data (from custom hook) ---
  const {
    pipeline,
    connectorAccount,
    stages,
    metrics,
    loading,
    fetchPipelineData,
    setPipeline,
    setConnectorAccount,
    setStages,
    // Ring analytics:
    costDistribution,
    messageDistribution,
    performanceDistribution
  } = usePipelineSettingsData(id);

  // Local UI state
  const [activeTab, setActiveTab] = useState("settings");
  const [showConnectionFlow, setShowConnectionFlow] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showChannelDeleteDialog, setShowChannelDeleteDialog] = useState(false);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);

  // For settings tab form state
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineDescription, setPipelineDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Calculate total messages from conversations
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    fetchPipelineData();
    // eslint-disable-next-line
  }, [id]);

  // Sync form states with pipeline data
  useEffect(() => {
    if (pipeline) {
      setPipelineName(pipeline.pipeline_name);
      setPipelineDescription(pipeline.pipeline_description || "");
    }
  }, [pipeline]);

  // Total messages calculation is disabled in static mode

  // HANDLERS

  // Save settings
  const handleSave = async () => {
    if (!pipeline) return;
    setSaving(true);
    try {
      await new Promise(res => setTimeout(res, 200));

      toast({
        title: "Success",
        description: "Pipeline settings saved successfully",
      });

      setPipeline({
        ...pipeline,
        pipeline_name: pipelineName.trim(),
        pipeline_description: pipelineDescription.trim() || null,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save pipeline settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete pipeline handler
  const handleDeletePipeline = async () => {
    if (!pipeline) return;
    if (deleteConfirmation !== pipeline.pipeline_name) {
      toast({
        title: "Error",
        description: "Pipeline name confirmation does not match",
        variant: "destructive",
      });
      return;
    }
    setDeleting(true);
    try {
      // 1. Delete opportunity actions
      await new Promise(res => setTimeout(res, 300));
      toast({
        title: "Pipeline Deleted",
        description: "Pipeline and all associated data have been permanently deleted.",
      });
      navigate("/pipelines");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pipeline",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation("");
    }
  };

  // Channel actions (in settings tab)
  const handleSwitch = () => setShowSwitchDialog(true);
  const handleDeleteAccount = () => setShowChannelDeleteDialog(true);
  const handleAccountChanged = async () => { await fetchPipelineData(); };
  const handleAccountDeleted = async () => {
    await fetchPipelineData();
    setShowChannelDeleteDialog(false);
  };

  // Channel reconnect
  const handleReconnect = () => {
    if (!connectorAccount) return;
    setShowReconnectDialog(true);
  };

  // Restart channel
  const handleRestart = async () => {
    if (!connectorAccount) return;
    setReconnecting(true);
    try {
      await new Promise(res => setTimeout(res, 300));

      toast({
        title: "Account Restarted",
        description: "The channel account has been restarted successfully",
      });

      // Refresh data to reflect any status changes
      await fetchPipelineData();
    } catch (error: any) {
      toast({
        title: "Restart Failed",
        description: error.message || "Failed to restart the account",
        variant: "destructive",
      });
    } finally {
      setReconnecting(false);
    }
  };

  // Connection flow
  const handleConnectionSuccess = (accountId: string) => {
    toast({ title: "Channel Connected", description: "WhatsApp Business account connected successfully (static)" });
    fetchPipelineData();
    setShowConnectionFlow(false);
  };

  // Prepare enhanced metrics with calculated fields
  // const enhancedMetrics = metrics ? {
  //   ...metrics,
  //   total_messages: totalMessages,
  //   avg_cost_per_deal: metrics.total_opportunities > 0 ? metrics.total_cost / metrics.total_opportunities : 0,
  //   avg_cost_per_message: totalMessages > 0 ? metrics.total_cost / totalMessages : 0
  // } : undefined;

  // UI
  if (loading) {
    return (
      <ModernLayout title="Pipeline Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ModernLayout>
    );
  }
  if (!pipeline) {
    return (
      <ModernLayout title="Pipeline Not Found">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pipeline Not Found</h1>
          <Button onClick={() => navigate("/pipelines")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipelines
          </Button>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Pipeline Settings">
      <div className="space-y-8">
        <PipelineSettingsHeader pipeline={pipeline} stages={stages} />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {/* <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger> */}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" /> Settings
            </TabsTrigger>
            <TabsTrigger value="ai-config" className="flex items-center gap-2">
              <Bot className="h-4 w-4" /> AI Configuration
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Danger Zone
            </TabsTrigger>
          </TabsList>
          {/* <TabsContent value="analytics">
            <AnalyticsTab
              costDistribution={costDistribution}
              messageDistribution={messageDistribution}
              performanceDistribution={performanceDistribution}
              metrics={enhancedMetrics}
            />
          </TabsContent> */}
          <TabsContent value="settings">
            <SettingsTab
              pipelineName={pipelineName}
              pipelineDescription={pipelineDescription}
              setPipelineName={setPipelineName}
              setPipelineDescription={setPipelineDescription}
              handleSave={handleSave}
              saving={saving}
              connectorAccount={connectorAccount}
              reconnecting={reconnecting}
              onSwitch={handleSwitch}
              onReconnect={handleReconnect}
              onRestart={handleRestart}
              onDeleteAccount={handleDeleteAccount}
              showConnectionFlow={showConnectionFlow}
              setShowConnectionFlow={setShowConnectionFlow}
              pipelineId={id!}
              userId={pipeline.user_id}
            />
          </TabsContent>
          <TabsContent value="ai-config">
            <AIConfigurationTab pipeline={pipeline} />
          </TabsContent>

          <TabsContent value="danger">
            <DangerZoneTab
              metrics={metrics}
              stages={stages}
              pipelineName={pipeline.pipeline_name}
              onDelete={() => setShowDeleteDialog(true)}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* Dialogs */}
      <DeletePipelineDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        pipelineName={pipeline.pipeline_name}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        deleting={deleting}
        handleDeletePipeline={handleDeletePipeline}
      />
      <WhatsAppConnectionFlow
        open={showConnectionFlow}
        onOpenChange={setShowConnectionFlow}
        onConnectionSuccess={handleConnectionSuccess}
      />
      <SwitchChannelDialog
        open={showSwitchDialog}
        onOpenChange={setShowSwitchDialog}
        currentAccountId={connectorAccount?.id || null}
        pipelineId={id!}
        onAccountChanged={handleAccountChanged}
      />
      {connectorAccount && (
        <DeleteChannelDialog
          open={showChannelDeleteDialog}
          onOpenChange={setShowChannelDeleteDialog}
          accountId={connectorAccount?.id || ''}
          accountName={connectorAccount?.connector_account_identifier || ''}
          channelType={connectorAccount?.channel_type}
          pipelineId={id || ''}
          onAccountDeleted={handleAccountDeleted}
        />
      )}
      <ChannelReconnectDialog
        open={showReconnectDialog}
        setOpen={setShowReconnectDialog}
        connectorAccount={connectorAccount}
        onSuccess={fetchPipelineData}
      />
    </ModernLayout>
  );
};

export default PipelineSettings;
