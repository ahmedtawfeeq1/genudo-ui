import React, { useState, useEffect } from 'react';
import ModernLayout from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  MessageCircle,
  RefreshCw,
  Archive,
  DollarSign,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  Grid3X3,
  List,
  Calendar,
  ExternalLink,
  Kanban,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CreatePipelineDialog from '@/components/pipelines/CreatePipelineDialog';
import ChannelSelectionDialog from '@/components/pipelines/ChannelSelectionDialog';
import PipelineDropdownMenu from '@/components/pipelines/PipelineDropdownMenu';
import InlineEditableText from '@/components/ui/inline-editable-text';
import { usePipelineDuplication } from '@/hooks/usePipelineDuplication';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Pipeline {
  id: string;
  pipeline_name: string;
  pipeline_description: string | null;
  created_at: string;
  connector_account_id: string | null;
  is_archived?: boolean | null;
  is_active: boolean;
}

interface PipelineWithMetrics extends Pipeline {
  active_deals: number;
  won_deals: number;
  lost_deals: number;
  total_cost: number;
  channel_name: string;
  channel_type: string;
}

type ViewMode = 'card' | 'list';

/**
 * Pipelines
 * Static UI implementation of the pipelines listing page.
 * - Preserves design, interactions, and navigation
 * - Replaces backend fetch/mutations with local mock data and state updates
 * Integration points to replace later:
 * - checkConnectorAccounts
 * - fetchPipelines
 * - name update / archive / unarchive / toggle active
 */
const Pipelines = () => {
  const [pipelines, setPipelines] = useState<PipelineWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [hasConnectorAccounts, setHasConnectorAccounts] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [pipelineToArchive, setPipelineToArchive] = useState<string | null>(null);
  const [showArchivedPipelines, setShowArchivedPipelines] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { duplicatePipeline, duplicating } = usePipelineDuplication();

  useEffect(() => {
    initializePage();
  }, [showArchivedPipelines]);

  /**
   * initializePage
   * Bootstraps connector check and pipelines loading using mock data.
   */
  const initializePage = async () => {
    await checkConnectorAccounts();
    await fetchPipelines();
  };

  /**
   * checkConnectorAccounts
   * Simulates presence of connected channel accounts.
   */
  const checkConnectorAccounts = async () => {
    await new Promise(res => setTimeout(res, 300));
    const mockAccounts = [
      { id: 'acc-1', connector_account_identifier: 'WhatsApp Business', channel_type: 'WHATSAPP' },
      { id: 'acc-2', connector_account_identifier: 'Facebook Page', channel_type: 'MESSENGER' },
    ];
    setHasConnectorAccounts(mockAccounts.length > 0);
    return mockAccounts.length > 0;
  };

  /**
   * fetchPipelines
   * Loads pipelines from static list and applies archive filter.
   */
  const fetchPipelines = async () => {
    try {
      await new Promise(res => setTimeout(res, 300));
      const all: PipelineWithMetrics[] = [
        {
          id: 'pipe-1',
          pipeline_name: 'Sales Pipeline',
          pipeline_description: 'Primary outbound funnel',
          created_at: new Date().toISOString(),
          connector_account_id: 'acc-1',
          is_archived: false,
          is_active: true,
          active_deals: 7,
          won_deals: 3,
          lost_deals: 1,
          total_cost: 24.5,
          channel_name: 'WhatsApp Business',
          channel_type: 'WHATSAPP',
        },
        {
          id: 'pipe-2',
          pipeline_name: 'Inbound Leads',
          pipeline_description: 'Messenger leads intake',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          connector_account_id: 'acc-2',
          is_archived: false,
          is_active: false,
          active_deals: 2,
          won_deals: 0,
          lost_deals: 0,
          total_cost: 3.2,
          channel_name: 'Facebook Page',
          channel_type: 'MESSENGER',
        },
        {
          id: 'pipe-3',
          pipeline_name: 'Legacy Pipeline',
          pipeline_description: 'Archived legacy',
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          connector_account_id: null as any,
          is_archived: true,
          is_active: false,
          active_deals: 0,
          won_deals: 0,
          lost_deals: 0,
          total_cost: 0,
          channel_name: 'No Channel Connected',
          channel_type: 'NONE',
        },
        {
          id: 'pipe-4',
          pipeline_name: 'No Channel Pipeline',
          pipeline_description: 'Needs channel connection',
          created_at: new Date().toISOString(),
          connector_account_id: null as any,
          is_archived: false,
          is_active: true,
          active_deals: 0,
          won_deals: 0,
          lost_deals: 0,
          total_cost: 0,
          channel_name: 'No Channel Connected',
          channel_type: 'NONE',
        },
      ];

      const filtered = showArchivedPipelines
        ? all.filter(p => p.is_archived)
        : all.filter(p => !p.is_archived);

      setPipelines(filtered);
    } catch (error: any) {
      console.error('Error in fetchPipelines:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pipelines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pipeline name update handler
  /**
   * handlePipelineNameUpdate
   * Updates name locally and shows success toast.
   */
  const handlePipelineNameUpdate = async (pipelineId: string, newName: string) => {
    try {
      setPipelines(prev => prev.map(p =>
        p.id === pipelineId
          ? { ...p, pipeline_name: newName }
          : p
      ));
      toast({ title: "Success", description: "Pipeline name updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update pipeline name", variant: "destructive" });
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializePage();
  };

  const handlePipelineCreated = () => {
    fetchPipelines();
    checkConnectorAccounts();
    setShowCreateDialog(false);
    toast({
      title: "Success",
      description: "Pipeline created successfully!",
    });
  };

  /**
   * handleToggleActive
   * Toggles active state locally with feedback.
   */
  const handleToggleActive = async (pipelineId: string, isActive: boolean) => {
    try {
      setPipelines(prev => prev.map(p => p.id === pipelineId ? { ...p, is_active: isActive } : p));
      toast({ title: "Success", description: `Pipeline has been ${isActive ? 'activated' : 'deactivated'}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update pipeline status.", variant: "destructive" });
      fetchPipelines();
    }
  };

  // Open Pipeline Handler (for both card click and button click)
  const handleOpenPipeline = (pipelineId: string) => {
    navigate(`/pipelines/${pipelineId}/stages`);
  };

  const handleEditPipeline = (pipelineId: string) => {
    navigate(`/pipelines/${pipelineId}/settings`);
  };

  const handleArchivePipeline = (pipelineId: string) => {
    setPipelineToArchive(pipelineId);
    setShowArchiveDialog(true);
  };

  /**
   * handleUnarchivePipeline
   * Marks pipeline unarchived + active locally.
   */
  const handleUnarchivePipeline = async (pipelineId: string) => {
    try {
      setPipelines(prev => prev.map(p => p.id === pipelineId ? { ...p, is_archived: false, is_active: true } : p));
      toast({ title: "Pipeline Unarchived", description: "Pipeline has been successfully unarchived and activated." });
      await fetchPipelines();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to unarchive pipeline", variant: "destructive" });
    }
  };

  const handleDuplicatePipeline = async (pipelineId: string) => {
    const newPipelineId = await duplicatePipeline(pipelineId);
    if (newPipelineId) {
      await fetchPipelines();
    }
  };

  /**
   * confirmArchivePipeline
   * Archives selected pipeline locally and refreshes list.
   */
  const confirmArchivePipeline = async () => {
    if (!pipelineToArchive) return;

    try {
      setPipelines(prev => prev.map(p => p.id === pipelineToArchive ? { ...p, is_archived: true, is_active: false } : p));
      toast({
        title: "Pipeline Archived",
        description: "Pipeline has been successfully archived.",
      });

      await fetchPipelines();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to archive pipeline",
        variant: "destructive",
      });
    } finally {
      setShowArchiveDialog(false);
      setPipelineToArchive(null);
    }
  };

  const handleCreatePipelineClick = () => {
    if (!hasConnectorAccounts) {
      setShowChannelDialog(true);
    } else {
      setShowCreateDialog(true);
    }
  };

  const handleChannelConnection = (accountId: string) => {
    checkConnectorAccounts();
    setShowChannelDialog(false);

    // If we have an account ID (meaning connection successful), show create dialog
    // For Messenger, accountId might be 'messenger-new' or actual ID
    if (accountId) {
      setShowCreateDialog(true);
      toast({
        title: "Channel Connected!",
        description: "Your channel has been successfully connected. You can now create pipelines.",
      });
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'WHATSAPP':
        return <img src="/channel-icons/whatsapp.svg" alt="WhatsApp" className="h-6 w-6 object-contain" />;
      case 'GMAIL':
        return <img src="/channel-icons/gmail.svg" alt="Gmail" className="h-6 w-6 object-contain" />;
      case 'MESSENGER':
        return <img src="/channel-icons/messenger.svg" alt="Messenger" className="h-6 w-6 object-contain" />;
      case 'INSTAGRAM':
        return <img src="/channel-icons/instagram.svg" alt="Instagram" className="h-6 w-6 object-contain" />;
      case 'TELEGRAM':
        return <img src="/channel-icons/telegram.svg" alt="Telegram" className="h-6 w-6 object-contain" />;
      case 'LINKEDIN':
        return <img src="/channel-icons/linkedin.svg" alt="LinkedIn" className="h-6 w-6 object-contain" />;
      case 'OUTLOOK':
        return <img src="/channel-icons/outlook.svg" alt="Outlook" className="h-6 w-6 object-contain" />;
      case 'EMAIL':
        return <img src="/channel-icons/email.svg" alt="Email" className="h-6 w-6 object-contain" />;
      case 'WEBCHAT':
        return <img src="/channel-icons/webchat.svg" alt="Webchat" className="h-6 w-6 object-contain" />;
      case 'API':
        return <img src="/channel-icons/api.svg" alt="API" className="h-6 w-6 object-contain" />;
      default:
        return <MessageCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getChannelDisplayName = (channelType: string) => {
    switch (channelType) {
      case 'WHATSAPP':
        return 'WhatsApp';
      case 'GMAIL':
        return 'Gmail';
      case 'MESSENGER':
        return 'Messenger';
      case 'INSTAGRAM':
        return 'Instagram';
      case 'TELEGRAM':
        return 'Telegram';
      case 'LINKEDIN':
        return 'LinkedIn';
      case 'OUTLOOK':
        return 'Outlook';
      case 'EMAIL':
        return 'Email';
      case 'WEBCHAT':
        return 'Webchat';
      case 'API':
        return 'API';
      default:
        return 'No Channel';
    }
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {pipelines.map((pipeline) => (
        <Card
          key={pipeline.id}
          className={cn(
            "hover:shadow-md transition-all duration-200 border-l-4 group cursor-pointer",
            showArchivedPipelines
              ? 'border-l-gray-400 opacity-75'
              : pipeline.is_active
                ? 'border-l-blue-500'
                : 'border-l-orange-500 opacity-80'
          )}
          onClick={() => handleOpenPipeline(pipeline.id)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              {/* Inline editable pipeline name */}
              <div className="flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                <InlineEditableText
                  value={pipeline.pipeline_name}
                  onSave={(newName) => handlePipelineNameUpdate(pipeline.id, newName)}
                  placeholder="Pipeline name..."
                  className="flex-1"
                  textClassName="text-base font-semibold truncate"
                  disabled={showArchivedPipelines}
                  variant="text"
                />
              </div>
              <div className="flex items-center space-x-1">
                {showArchivedPipelines && <Archive className="h-4 w-4 text-gray-500" />}

                <div onClick={(e) => e.stopPropagation()}>
                  <PipelineDropdownMenu
                    pipelineId={pipeline.id}
                    onEdit={handleEditPipeline}
                    onArchive={handleArchivePipeline}
                    onUnarchive={handleUnarchivePipeline}
                    onDuplicate={handleDuplicatePipeline}
                    duplicating={duplicating}
                    showArchive={!showArchivedPipelines}
                    isArchived={showArchivedPipelines}
                  />
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
              {getChannelIcon(pipeline.channel_type)}
              <span className="truncate max-w-[120px]">
                {getChannelDisplayName(pipeline.channel_type)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Compact Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <DollarSign className="h-3 w-3 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-blue-600">${pipeline.total_cost.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Cost</p>
                </div>

                <div className="text-center p-2 bg-orange-50 rounded">
                  <Activity className="h-3 w-3 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-orange-600">{pipeline.active_deals}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>

                <div className="text-center p-2 bg-green-50 rounded">
                  <CheckCircle className="h-3 w-3 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-green-600">{pipeline.won_deals}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>

                <div className="text-center p-2 bg-red-50 rounded">
                  <XCircle className="h-3 w-3 text-red-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-red-600">{pipeline.lost_deals}</p>
                  <p className="text-xs text-muted-foreground">Lost</p>
                </div>
              </div>

              {!showArchivedPipelines && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <Label htmlFor={`active-toggle-${pipeline.id}`} className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <div className={cn("w-2 h-2 rounded-full", pipeline.is_active ? 'bg-green-500' : 'bg-gray-400')}></div>
                    Status
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold pr-2 ${pipeline.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                      {pipeline.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      id={`active-toggle-${pipeline.id}`}
                      checked={pipeline.is_active}
                      onCheckedChange={(checked) => handleToggleActive(pipeline.id, checked)}
                    />

                    {/* Open Pipeline Button - moved here next to toggle */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPipeline(pipeline.id);
                            }}
                          >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open Pipeline</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {pipelines.map((pipeline) => (
        <Card
          key={pipeline.id}
          className={cn(
            "hover:shadow-sm transition-all duration-200 border-l-4 cursor-pointer",
            showArchivedPipelines
              ? 'border-l-gray-400 opacity-75'
              : pipeline.is_active
                ? 'border-l-blue-500'
                : 'border-l-orange-500 opacity-80'
          )}
          onClick={() => handleOpenPipeline(pipeline.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center space-x-2">
                  {getChannelIcon(pipeline.channel_type)}
                  <div className="flex-1">
                    {/* Inline editable name in list view */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <InlineEditableText
                        value={pipeline.pipeline_name}
                        onSave={(newName) => handlePipelineNameUpdate(pipeline.id, newName)}
                        placeholder="Pipeline name..."
                        textClassName="font-semibold text-sm"
                        disabled={showArchivedPipelines}
                        variant="text"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getChannelDisplayName(pipeline.channel_type)} • Created {new Date(pipeline.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-600">${pipeline.total_cost.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Cost</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-orange-600">{pipeline.active_deals}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-600">{pipeline.won_deals}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-red-600">{pipeline.lost_deals}</p>
                  <p className="text-xs text-muted-foreground">Lost</p>
                </div>

                <div className="flex items-center space-x-4">
                  {!showArchivedPipelines && (
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        id={`active-toggle-list-${pipeline.id}`}
                        checked={pipeline.is_active}
                        onCheckedChange={(checked) => handleToggleActive(pipeline.id, checked)}
                      />

                      {/* Open Pipeline Button for List View - moved next to toggle */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPipeline(pipeline.id);
                              }}
                            >
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open Pipeline</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  <div onClick={(e) => e.stopPropagation()}>
                    <PipelineDropdownMenu
                      pipelineId={pipeline.id}
                      onEdit={handleEditPipeline}
                      onArchive={handleArchivePipeline}
                      onUnarchive={handleUnarchivePipeline}
                      onDuplicate={handleDuplicatePipeline}
                      duplicating={duplicating}
                      showArchive={!showArchivedPipelines}
                      isArchived={showArchivedPipelines}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <ModernLayout title="Pipelines">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600">Loading your pipelines...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Pipelines">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {showArchivedPipelines ? 'Archived Pipelines' : 'Sales Pipelines'}
            </h1>
            <p className="text-muted-foreground">
              {showArchivedPipelines
                ? 'View and manage your archived pipelines'
                : 'Automate your customer engagement and sales process'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowArchivedPipelines(!showArchivedPipelines)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showArchivedPipelines ? 'View Active' : 'View Archived'}
            </Button>
            {!showArchivedPipelines && (
              <Button onClick={handleCreatePipelineClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create Pipeline
              </Button>
            )}
          </div>
        </div>

        {/* Channel Connection Required Message */}
        {!hasConnectorAccounts && !showArchivedPipelines && (
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Welcome to Genudo!</h3>
                  <p className="text-green-800 mb-3">
                    Get started by connecting your communication channels. Our platform helps you create automated
                    sales pipelines and engage with customers directly through multiple channels.
                  </p>
                  <div className="flex gap-2 text-sm text-green-700">
                    <span>✓ Automated conversations</span>
                    <span>✓ Lead management</span>
                    <span>✓ Sales tracking</span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowChannelDialog(true)}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pipelines Display */}
        {pipelines.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  {showArchivedPipelines ? <Archive className="h-10 w-10 text-blue-600" /> : <MessageCircle className="h-10 w-10 text-blue-600" />}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {showArchivedPipelines
                    ? "No Archived Pipelines"
                    : (hasConnectorAccounts ? "Create Your First Pipeline" : "No Pipelines Yet")
                  }
                </h3>
                <p className="text-muted-foreground mb-6">
                  {showArchivedPipelines
                    ? "You don't have any archived pipelines yet."
                    : (hasConnectorAccounts
                      ? "Start building automated sales funnels to engage with your customers and convert leads into sales."
                      : "Connect your communication channels first, then create your first automated sales pipeline."
                    )
                  }
                </p>
                {!showArchivedPipelines && (
                  <Button onClick={handleCreatePipelineClick} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    {hasConnectorAccounts ? "Create Your First Pipeline" : "Connect Channels & Start"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          viewMode === 'card' ? renderCardView() : renderListView()
        )}
      </div>

      <CreatePipelineDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handlePipelineCreated}
      />

      <ChannelSelectionDialog
        open={showChannelDialog}
        onOpenChange={setShowChannelDialog}
        onSuccess={handleChannelConnection}
      />

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Warning:</strong> Archiving this pipeline will affect all related data.
              All opportunities, stages, and conversations for this pipeline will be preserved
              but the pipeline will no longer be active. You can view archived pipelines later
              but they won't appear in your main pipeline list.
              <br /><br />
              <strong>Proceed with caution.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchivePipeline}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Archive Pipeline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModernLayout>
  );
};

export default Pipelines;
