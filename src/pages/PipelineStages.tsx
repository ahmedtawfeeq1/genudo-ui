import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModernLayout from '@/components/layout/ModernLayout';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import CreateOpportunityDialog from '@/components/opportunities/CreateOpportunityDialog';
import BulkOpportunityImportWizard from '@/components/opportunities/BulkOpportunityImportWizard';
import TagsFilter from '@/components/kanban/TagsFilter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Filter,
  ArrowLeft,
  Search,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOpportunityFollowUps } from '@/hooks/useOpportunityFollowUps';
import KanbanFiltersDialog from '@/components/kanban/KanbanFiltersDialog';
import { OpportunityStatus, Priority } from '@/components/kanban/KanbanFilters';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';

interface Pipeline {
  id: string;
  pipeline_name: string;
  pipeline_description: string | null;
}

interface Stage {
  id: string;
  stage_name: string;
  opening_message: boolean;
}

interface PipelineMetrics {
  total_deals: number;
  deals_won: number;
  deals_active: number;
  deals_lost: number;
  total_cost: number;
  total_messages: number;
  avg_cost_per_deal: number;
  avg_cost_per_message: number;
}

const PipelineStages = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    total_deals: 0,
    deals_won: 0,
    deals_active: 0,
    deals_lost: 0,
    total_cost: 0,
    total_messages: 0,
    avg_cost_per_deal: 0,
    avg_cost_per_message: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<any[]>([]);

  // Filter state - Separate temp (for modal) and applied (for query)
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // Temp filter state (modified in dialog)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>([]);
  const [tempAiStatus, setTempAiStatus] = useState<"all" | "paused" | "active">("all");
  const [tempOpportunityStatuses, setTempOpportunityStatuses] = useState<OpportunityStatus[]>([]);
  const [tempPriorities, setTempPriorities] = useState<Priority[]>([]);
  const [tempTagFilterMode, setTempTagFilterMode] = useState<'AND' | 'OR'>('OR');

  // Applied filter state (passed to queries)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [appliedAiStatus, setAppliedAiStatus] = useState<"all" | "paused" | "active">("all");
  const [appliedOpportunityStatuses, setAppliedOpportunityStatuses] = useState<OpportunityStatus[]>([]);
  const [appliedPriorities, setAppliedPriorities] = useState<Priority[]>([]);
  const [appliedTagFilterMode, setAppliedTagFilterMode] = useState<'AND' | 'OR'>('OR');

  const { toast } = useToast();
  const { triggerProcessor, isTriggeringProcessor } = useOpportunityFollowUps(id);

  /**
   * calculateMetrics
   * Static computation for pipeline metrics in detached mode.
   */
  const calculateMetrics = useCallback(async () => {
    const total_deals = 9;
    const deals_active = 7;
    const deals_won = 2;
    const deals_lost = 0;
    const total_cost = 27.8;
    const total_messages = 0;
    const avg_cost_per_deal = total_deals > 0 ? total_cost / total_deals : 0;
    const avg_cost_per_message = 0;
    setMetrics({
      total_deals,
      deals_won,
      deals_active,
      deals_lost,
      total_cost,
      total_messages,
      avg_cost_per_deal,
      avg_cost_per_message
    });
  }, [id]);

  /**
   * fetchPipelineData
   * Static data loader for pipeline header, stages, and tag sources.
   */
  const fetchPipelineData = useCallback(async () => {
    try {
      // Pipeline basic info
      setPipeline({ id: id!, pipeline_name: 'Sales Pipeline', pipeline_description: 'Primary outbound funnel' });

      // Stages for bulk import
      setStages([
        { id: 's1', stage_name: 'New', opening_message: false },
        { id: 's2', stage_name: 'Qualified', opening_message: false },
        { id: 's3', stage_name: 'Won', opening_message: false },
        { id: 's4', stage_name: 'Lost', opening_message: false },
      ]);

      // Opportunities for tags filter
      setAllOpportunities([
        { id: 'o-1', tags: 'vip,new' },
        { id: 'o-2', tags: 'trial,priority' },
        { id: 'o-3', tags: ['vip', 'priority'] },
      ]);

      await calculateMetrics();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load pipeline data", variant: "destructive" });
      navigate('/pipelines');
    } finally {
      setLoading(false);
    }
  }, [id, toast, navigate, calculateMetrics]);

  useEffect(() => {
    if (id) {
      fetchPipelineData();
    }
  }, [id, fetchPipelineData]);

  const handleBulkImportSuccess = useCallback(() => {
    fetchPipelineData();
    setShowBulkImport(false);
  }, [fetchPipelineData]);

  const handleBulkImportClick = () => {
    if (stages.length === 0) {
      toast({
        title: "No Stages",
        description: "Please create stages for this pipeline first before importing opportunities.",
        variant: "destructive",
      });
      return;
    }
    setShowBulkImport(true);
  };

  // Extract available tags from all opportunities - tags are comma-separated strings
  const availableTags = Array.from(
    new Set(
      allOpportunities
        .flatMap(opp => {
          // Tags might be stored as comma-separated string or array
          if (typeof opp.tags === 'string') {
            return opp.tags.split(',').map(tag => tag.trim()).filter(Boolean);
          }
          return Array.isArray(opp.tags) ? opp.tags : [];
        })
        .filter(Boolean)
    )
  ).sort();

  // Filter handlers
  const handleApplyFilters = () => {
    // Copy temp filter state to applied state
    setAppliedDateRange(tempDateRange);
    setAppliedTags(tempSelectedTags);
    setAppliedAiStatus(tempAiStatus);
    setAppliedOpportunityStatuses(tempOpportunityStatuses);
    setAppliedPriorities(tempPriorities);
    setAppliedTagFilterMode(tempTagFilterMode);
  };

  const handleResetFilters = () => {
    // Reset to defaults
    const defaultDateRange: DateRange | undefined = (() => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return { from, to };
    })();

    // Reset temp state
    setTempDateRange(defaultDateRange);
    setTempSelectedTags([]);
    setTempAiStatus("all");
    setTempOpportunityStatuses([]);
    setTempPriorities([]);
    setTempTagFilterMode('OR');

    // Reset applied state
    setAppliedDateRange(defaultDateRange);
    setAppliedTags([]);
    setAppliedAiStatus("all");
    setAppliedOpportunityStatuses([]);
    setAppliedPriorities([]);
    setAppliedTagFilterMode('OR');
  };

  if (loading) {
    return (
      <ModernLayout title="Pipeline Stages">
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
          <Button onClick={() => navigate('/pipelines')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipelines
          </Button>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title={pipeline.pipeline_name}>
      {/* FIXED HEADER - No height constraint */}
      <div className="flex flex-col space-y-6">
        {/* Clean Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/pipelines')}
            className="bg-white shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pipeline.pipeline_name}</h1>
            {pipeline.pipeline_description && (
              <p className="text-gray-600 mt-1">{pipeline.pipeline_description}</p>
            )}
          </div>
        </div>

        {/* Modern Dashboard Metrics Cards - Updated to 5 cards with Lost Deals */}
        {/* COMMENTED OUT - Analytics Section Hidden
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Total Pipeline Cost</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 mb-3">${metrics.total_cost.toFixed(2)}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-blue-700">
                      <span>Avg/Deal:</span>
                      <span className="font-medium">${metrics.avg_cost_per_deal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-700">
                      <span>Avg/Message:</span>
                      <span className="font-medium">${metrics.avg_cost_per_message.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    <p className="text-sm font-medium text-purple-800">Total Deals</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 mb-3">{metrics.total_deals}</p>
                  <div className="flex items-center justify-between text-xs text-purple-700">
                    <span>Total Messages:</span>
                    <span className="font-medium">{metrics.total_messages.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-6 h-6 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">Active Deals</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-900 mb-3">{metrics.deals_active}</p>
                  <p className="text-xs text-orange-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Deals Won</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900 mb-3">{metrics.deals_won}</p>
                  <p className="text-xs text-green-600">
                    {metrics.total_deals > 0 ? ((metrics.deals_won / metrics.total_deals) * 100).toFixed(1) : 0}% win rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    <p className="text-sm font-medium text-red-800">Deals Lost</p>
                  </div>
                  <p className="text-3xl font-bold text-red-900 mb-3">{metrics.deals_lost}</p>
                  <p className="text-xs text-red-600">
                    {metrics.total_deals > 0 ? ((metrics.deals_lost / metrics.total_deals) * 100).toFixed(1) : 0}% loss rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        END COMMENTED OUT ANALYTICS SECTION */}

        {/* Search and New Deal Section */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search deals, contacts, emails, phones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white shadow-sm"
                  />
                </div>
                {/* Filter Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilterDialog(true)}
                  className="shadow-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {/* Badge showing active filter count */}
                  {(() => {
                    let count = 0;
                    if (appliedDateRange) count++;
                    if (appliedTags.length > 0) count += appliedTags.length;
                    if (appliedAiStatus !== 'all') count++;
                    if (appliedOpportunityStatuses.length > 0) count += appliedOpportunityStatuses.length;
                    if (appliedPriorities.length > 0) count += appliedPriorities.length;
                    return count > 0 && (
                      <Badge variant="secondary" className="ml-2">{count}</Badge>
                    );
                  })()}
                </Button>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  onClick={() => triggerProcessor()}
                  disabled={isTriggeringProcessor}
                  className="shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isTriggeringProcessor ? 'animate-spin' : ''}`} />
                  {isTriggeringProcessor ? 'Syncing...' : 'Sync Follow-ups'}
                </Button>
                <Button variant="outline" onClick={handleBulkImportClick} className="shadow-sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Bulk
                </Button>
                <Button onClick={() => setShowCreateOpportunity(true)} className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Deal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SCROLLABLE KANBAN BOARD - Full height, unified scrolling */}
        <KanbanBoard
          pipelineId={id!}
          pipelineName={pipeline?.pipeline_name}
          onMetricsUpdate={fetchPipelineData}
          searchQuery={searchQuery}
          selectedTags={appliedTags}
          dateRange={appliedDateRange}
          aiStatus={appliedAiStatus}
          opportunityStatuses={appliedOpportunityStatuses}
          priorities={appliedPriorities}
        />

        <CreateOpportunityDialog
          open={showCreateOpportunity}
          onOpenChange={setShowCreateOpportunity}
          onSuccess={() => {
            fetchPipelineData();
            setShowCreateOpportunity(false);
          }}
          defaultPipelineId={id}
        />

        <BulkOpportunityImportWizard
          open={showBulkImport}
          onOpenChange={setShowBulkImport}
          onSuccess={handleBulkImportSuccess}
          pipelineId={id!}
          stages={stages}
        />

        <KanbanFiltersDialog
          dateRange={tempDateRange}
          setDateRange={setTempDateRange}
          aiStatus={tempAiStatus}
          setAiStatus={setTempAiStatus}
          selectedTags={tempSelectedTags}
          setSelectedTags={setTempSelectedTags}
          availableTags={availableTags}
          selectedOpportunityStatuses={tempOpportunityStatuses}
          setSelectedOpportunityStatuses={setTempOpportunityStatuses}
          selectedPriorities={tempPriorities}
          setSelectedPriorities={setTempPriorities}
          onResetFilters={handleResetFilters}
          activeFiltersCount={(() => {
            let count = 0;
            if (appliedDateRange) count++;
            if (appliedTags.length > 0) count += appliedTags.length;
            if (appliedAiStatus !== 'all') count++;
            if (appliedOpportunityStatuses.length > 0) count += appliedOpportunityStatuses.length;
            if (appliedPriorities.length > 0) count += appliedPriorities.length;
            return count;
          })()}
          open={showFilterDialog}
          setOpen={setShowFilterDialog}
          onApply={handleApplyFilters}
          tagFilterMode={tempTagFilterMode}
          setTagFilterMode={setTempTagFilterMode}
        />
      </div>
    </ModernLayout>
  );
};

export default PipelineStages;
