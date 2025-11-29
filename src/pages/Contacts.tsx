import { useState, useEffect, useRef } from 'react';
import ModernLayout from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Users, Mail, Phone, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, ExternalLink } from 'lucide-react';
import { db } from "@/lib/mock-db";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { format, subDays } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UnifiedOpportunityModal from '@/components/opportunities/UnifiedOpportunityModal';
import { Skeleton } from '@/components/ui/skeleton';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  identifier: string | null;
  blocked: boolean;
  created_at: string;
  connector_account_id: string;
  sender_attendee_id: string | null;
  // Related data from joins
  tags: string | null;
  channel: string | null;
  status: string | null;
  priority: string | null;
  stage_name: string | null;
  pipeline_name: string | null;
  opportunity_id: string | null;
}

// Channel color mapping
const getChannelColor = (channel: string | null): string => {
  if (!channel) return 'bg-gray-100 text-gray-700 border-gray-300';

  const channelLower = channel.toLowerCase();
  if (channelLower.includes('whatsapp')) return 'bg-green-100 text-green-700 border-green-300';
  if (channelLower.includes('messenger')) return 'bg-blue-100 text-blue-700 border-blue-300';
  if (channelLower.includes('gmail') || channelLower.includes('email')) return 'bg-red-100 text-red-700 border-red-300';
  if (channelLower.includes('instagram')) return 'bg-pink-100 text-pink-700 border-pink-300';
  if (channelLower.includes('telegram')) return 'bg-cyan-100 text-cyan-700 border-cyan-300';

  return 'bg-gray-100 text-gray-700 border-gray-300';
};

// Generate tag color based on hash
const getTagColor = (tag: string): string => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-green-100 text-green-700 border-green-300',
    'bg-yellow-100 text-yellow-700 border-yellow-300',
    'bg-purple-100 text-purple-700 border-purple-300',
    'bg-pink-100 text-pink-700 border-pink-300',
    'bg-orange-100 text-orange-700 border-orange-300',
    'bg-teal-100 text-teal-700 border-teal-300',
  ];

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Static mock data for preview
const MOCK_PIPELINES = [
  { id: 'pipe-1', pipeline_name: 'Sales' },
  { id: 'pipe-2', pipeline_name: 'Support' }
];
const MOCK_STAGES = [
  { id: 's1', stage_name: 'New', pipeline_id: 'pipe-1' },
  { id: 's2', stage_name: 'Qualified', pipeline_id: 'pipe-1' },
  { id: 's3', stage_name: 'Open', pipeline_id: 'pipe-2' }
];
const MOCK_OPPORTUNITIES = [
  { id: 'o1', contact_id: 'c1', tags: 'lead,faq', stage_id: 's1', pipeline_id: 'pipe-1', status: 'active' },
  { id: 'o2', contact_id: 'c2', tags: 'vip', stage_id: 's2', pipeline_id: 'pipe-1', status: 'pending' }
];
const MOCK_CONTACTS: Contact[] = [
  {
    id: 'c1', name: 'Alice Johnson', email: 'alice@example.com', phone_number: '+1555-0101', identifier: '+1555-0101', blocked: false,
    created_at: new Date().toISOString(), connector_account_id: 'acc-1', sender_attendee_id: '+1555-0101',
    tags: 'lead,faq', channel: 'WHATSAPP', status: 'open', priority: 'normal', stage_name: 'New', pipeline_name: 'Sales', opportunity_id: 'o1'
  },
  {
    id: 'c2', name: 'Bob Smith', email: null, phone_number: null, identifier: 'bob@example.com', blocked: false,
    created_at: new Date(Date.now() - 86400000).toISOString(), connector_account_id: 'acc-1', sender_attendee_id: 'bob@example.com',
    tags: 'vip', channel: 'GMAIL', status: 'open', priority: 'high', stage_name: 'Qualified', pipeline_name: 'Sales', opportunity_id: 'o2'
  },
  {
    id: 'c3', name: 'Charlie Davis', email: 'charlie@example.com', phone_number: '+1555-0202', identifier: '+1555-0202', blocked: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(), connector_account_id: 'acc-2', sender_attendee_id: '+1555-0202',
    tags: '', channel: 'MESSENGER', status: 'open', priority: 'normal', stage_name: 'Open', pipeline_name: 'Support', opportunity_id: null
  }
];

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [pipelineFilter, setPipelineFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);

  // Metrics state
  const [metricsData, setMetricsData] = useState({
    totalContacts: 0,
    withEmail: 0,
    withPhone: 0,
    channelDistribution: {} as Record<string, number>,
    pipelineDistribution: {} as Record<string, number>
  });

  // Filter options state
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [availablePipelines, setAvailablePipelines] = useState<Array<{ id: string, name: string }>>([]);
  const [availableStages, setAvailableStages] = useState<Array<{ id: string, name: string }>>([]);
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const metricsSeq = useRef(0);
  const fetchSeq = useRef(0);
  const activeFetch = useRef(false);
  const didInitialContactsLoad = useRef(false);

  // Guards to avoid overlapping requests
  const metricsInFlight = useRef(false);
  const contactsInFlight = useRef(false);

  const isAbortLike = (err: any) => {
    const msg = String(err?.message || err).toLowerCase();
    return (
      err?.name === 'AbortError' ||
      msg.includes('abort') ||
      msg.includes('err_aborted')
    );
  };

  // Load metrics only after initial contacts load and when date window changes
  const lastMetricsKeyRef = useRef<string>("");
  // Load heavy metrics only after initial contacts load (channels/pipelines/email/phone)
  useEffect(() => {
    if (!user) return;
    if (!didInitialContactsLoad.current) return;
    const key = `${user.id}:${format(dateFrom, 'yyyy-MM-dd')}:${format(dateTo, 'yyyy-MM-dd')}`;
    if (lastMetricsKeyRef.current === key) return;
    lastMetricsKeyRef.current = key;
    loadMetrics();
  }, [user, dateFrom, dateTo]);

  // Load all-time total contacts as soon as user is available
  useEffect(() => {
    setMetricsData(prev => ({ ...prev, totalContacts: MOCK_CONTACTS.length }));
  }, []);

  // Load filter options once per user
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load stages when pipeline changes
  useEffect(() => {
    if (pipelineFilter.length === 0) {
      setStageFilter([]);
      setAvailableStages([]);
    } else {
      const pipelineIds = pipelineFilter
        .map(name => availablePipelines.find(p => p.name === name)?.id)
        .filter(Boolean) as string[];
      if (pipelineIds.length > 0) {
        const stages = MOCK_STAGES.filter(s => pipelineIds.includes(s.pipeline_id)).map(s => ({ id: s.id, name: s.stage_name }));
        setAvailableStages(stages);
      }
    }
  }, [pipelineFilter, availablePipelines]);

  // Consolidated page reset + debounced fetch to reduce overlapping requests
  const prevFiltersKeyRef = useRef<string>("");
  useEffect(() => {
    const filtersKey = JSON.stringify({
      searchTerm,
      channelFilter,
      stageFilter,
      pipelineFilter,
      priorityFilter,
      tagsFilter,
      tagFilterMode,
      dateFrom: dateFrom?.toISOString?.() ?? String(dateFrom),
      dateTo: dateTo?.toISOString?.() ?? String(dateTo),
      itemsPerPage,
    });

    if (prevFiltersKeyRef.current && prevFiltersKeyRef.current !== filtersKey) {
      setCurrentPage(1);
    }
    prevFiltersKeyRef.current = filtersKey;

    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    searchDebounceTimer.current = setTimeout(() => {
      fetchContacts();
    }, 300);
  }, [searchTerm, channelFilter, stageFilter, pipelineFilter, priorityFilter, tagsFilter, tagFilterMode, dateFrom, dateTo, currentPage, itemsPerPage]);

  // Load all metrics with aggregate queries
  const loadMetrics = async () => {
    setIsLoadingMetrics(true);

    if (!user?.id) {
      setIsLoadingMetrics(false);
      return;
    }

    const fromDate = format(dateFrom, 'yyyy-MM-dd');
    const toDate = format(dateTo, 'yyyy-MM-dd');



    // Initialize metrics with default values
    let totalContacts = 0;
    let withEmail = 0;
    let withPhone = 0;
    let channelDistribution: Record<string, number> = {};
    let pipelineDistribution: Record<string, number> = {};

    // Track errors to show a summary at the end if any occur
    const errors: string[] = [];

    // Total contacts from mock data
    totalContacts = MOCK_CONTACTS.length;

    // With email (within date range)
    withEmail = MOCK_CONTACTS.filter(c => {
      const d = new Date(c.created_at);
      return d >= new Date(fromDate) && d <= new Date(toDate + 'T23:59:59') && c.email && c.email.trim() !== '';
    }).length;

    // With phone (within date range)
    withPhone = MOCK_CONTACTS.filter(c => {
      const d = new Date(c.created_at);
      return d >= new Date(fromDate) && d <= new Date(toDate + 'T23:59:59') && c.phone_number && c.phone_number.trim() !== '';
    }).length;

    // By Channel - count contacts with conversations per channel (within date range)
    // First get contact IDs within date range
    const contactIdsInRange = MOCK_CONTACTS.filter(c => {
      const d = new Date(c.created_at);
      return d >= new Date(fromDate) && d <= new Date(toDate + 'T23:59:59');
    }).map(c => c.id);

    // If no contacts in range, skip conversation and opportunity queries
    if (contactIdsInRange.length === 0) {

    } else {
      const MAX_IDS_PER_QUERY = 100;

      // Get conversations for those contacts only
      const channelMap = new Map<string, Set<string>>();
      MOCK_CONTACTS.filter(c => contactIdsInRange.includes(c.id)).forEach(c => {
        if (c.channel && c.id) {
          if (!channelMap.has(c.channel)) channelMap.set(c.channel, new Set());
          channelMap.get(c.channel)!.add(c.id);
        }
      });
      channelMap.forEach((ids, channel) => { channelDistribution[channel] = ids.size; });

      // Get opportunities for contacts within date range only
      // Note: We don't filter by user_id here because security is already enforced
      // via contactIdsInRange (which only contains the user's contacts)
      const pipelineMap = new Map<string, Set<string>>();
      MOCK_OPPORTUNITIES.filter(o => contactIdsInRange.includes(o.contact_id)).forEach(o => {
        if (o.pipeline_id && o.contact_id) {
          if (!pipelineMap.has(o.pipeline_id)) pipelineMap.set(o.pipeline_id, new Set());
          pipelineMap.get(o.pipeline_id)!.add(o.contact_id);
        }
      });
      const pipelineNameMap = new Map(MOCK_PIPELINES.map(p => [p.id, p.pipeline_name]));
      pipelineMap.forEach((ids, pipelineId) => {
        const name = pipelineNameMap.get(pipelineId);
        if (name) pipelineDistribution[name] = ids.size;
      });
    }



    // Set metrics data regardless of individual errors
    setMetricsData({
      totalContacts: totalContacts || 0,
      withEmail: withEmail || 0,
      withPhone: withPhone || 0,
      channelDistribution,
      pipelineDistribution
    });

    // Only show error toast if there were errors
    if (errors.length > 0) {
      console.warn('Some metrics failed to load:', errors);
      // Only show toast if critical errors occurred (not for empty distributions)
      // Most errors are logged but don't interrupt the user experience
    }

    setIsLoadingMetrics(false);
  };

  // Load filter options from server
  const loadFilterOptions = async () => {
    const channels = [...new Set(MOCK_CONTACTS.map(c => c.channel).filter(Boolean) as string[])].sort();
    setAvailableChannels(channels);
    setAvailablePipelines(MOCK_PIPELINES.map(p => ({ id: p.id, name: p.pipeline_name })));
    const priorities = [...new Set(MOCK_CONTACTS.map(c => c.priority).filter(Boolean) as string[])].sort();
    setAvailablePriorities(priorities);
    const allTags = [...new Set(MOCK_CONTACTS.flatMap(c => (c.tags || '').split(',').map(t => t.trim()).filter(Boolean)))].sort();
    setAvailableTags(allTags);
  };

  // Load stages for multiple pipelines
  const loadStagesForPipelines = async (pipelineIds: string[]) => {
    const stages = MOCK_STAGES.filter(s => pipelineIds.includes(s.pipeline_id)).map(s => ({ id: s.id, name: s.stage_name }));
    setAvailableStages(stages);
  };

  // Build intersection sets for ALL join-based filters (channel, priority, pipeline, stage, tags)
  // This ensures filters are applied BEFORE pagination
  const buildJoinFilterSets = async (fromDate: string, toDate: string): Promise<Set<string> | undefined> => {
    let ids = new Set(MOCK_CONTACTS.map(c => c.id));
    if (channelFilter.length > 0) ids = new Set([...ids].filter(id => channelFilter.includes(MOCK_CONTACTS.find(c => c.id === id)?.channel || '')));
    if (priorityFilter !== 'all') ids = new Set([...ids].filter(id => (MOCK_CONTACTS.find(c => c.id === id)?.priority || '') === priorityFilter));
    if (pipelineFilter.length > 0) ids = new Set([...ids].filter(id => pipelineFilter.includes(MOCK_CONTACTS.find(c => c.id === id)?.pipeline_name || '')));
    if (stageFilter.length > 0) ids = new Set([...ids].filter(id => stageFilter.includes(MOCK_CONTACTS.find(c => c.id === id)?.stage_name || '')));
    if (tagsFilter.length > 0) ids = new Set([...ids].filter(id => {
      const tags = (MOCK_CONTACTS.find(c => c.id === id)?.tags || '').split(',').map(t => t.trim().toLowerCase());
      if (!tags.length) return false;
      return tagFilterMode === 'AND'
        ? tagsFilter.every(ft => tags.some(t => t.includes(ft.toLowerCase())))
        : tagsFilter.some(ft => tags.some(t => t.includes(ft.toLowerCase())));
    }));
    return ids;
  };

  // Fetch contacts with server-side filtering
  const fetchContacts = async () => {
    try {
      if (!isOnline) return;
      if (contactsInFlight.current || activeFetch.current) return;
      contactsInFlight.current = true;
      activeFetch.current = true;
      setLoading(true);
      const localSeq = ++fetchSeq.current;
      // Static mode: use local mock dataset
      const fromDateStr = format(dateFrom, 'yyyy-MM-dd');
      const toDateStr = format(dateTo, 'yyyy-MM-dd');
      const fromTs = new Date(fromDateStr).getTime();
      const toTs = new Date(toDateStr + 'T23:59:59').getTime();
      const joinIds = await buildJoinFilterSets(fromDateStr, toDateStr);
      const idSet = joinIds ? new Set(joinIds) : new Set(MOCK_CONTACTS.map(c => c.id));
      let filtered = MOCK_CONTACTS.filter(c => idSet.has(c.id))
        .filter(c => {
          const ts = new Date(c.created_at).getTime();
          return ts >= fromTs && ts <= toTs;
        });
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.phone_number || '').toLowerCase().includes(s));
      }
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTotalCount(filtered.length);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = currentPage * itemsPerPage;
      const pageSlice = filtered.slice(startIdx, endIdx);
      if (localSeq !== fetchSeq.current) {
        contactsInFlight.current = false;
        activeFetch.current = false;
        setLoading(false);
        return;
      }
      setContacts(pageSlice as any);
      didInitialContactsLoad.current = true;
      contactsInFlight.current = false;
      activeFetch.current = false;
      setLoading(false);
      return;
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch contacts",
        variant: "destructive"
      });
      setContacts([]);
    } finally {
      setLoading(false);
      contactsInFlight.current = false;
      activeFetch.current = false;
    }
  };

  // Export to Excel with proper filtering - exports ALL filtered records, not just current page
  const exportToExcel = async () => {
    try {
      // Always export all filtered contacts (date range is always active)
      let exportContacts: Contact[] = [];

      // Export all filtered contacts
      const fromDate = format(dateFrom, 'yyyy-MM-dd');
      const toDate = format(dateTo, 'yyyy-MM-dd');
      const joinFilterSet = await buildJoinFilterSets(fromDate, toDate);

      // Handle empty filter set (no matching contacts)
      if (joinFilterSet && joinFilterSet.size === 0) {
        exportContacts = [];
      } else {
        const idSet = joinFilterSet ? new Set(joinFilterSet) : new Set(MOCK_CONTACTS.map(c => c.id));
        const fromTs = new Date(fromDate).getTime();
        const toTs = new Date(toDate + 'T23:59:59').getTime();
        if (joinFilterSet && joinFilterSet.size > 0) {
          const filterIds = Array.from(joinFilterSet);
          const idSet = new Set(filterIds);
          const fromTs = new Date(fromDate).getTime();
          const toTs = new Date(toDate + 'T23:59:59').getTime();
          exportContacts = (MOCK_CONTACTS as Contact[])
            .filter(c => idSet.has(c.id))
            .filter(c => {
              const ts = new Date(c.created_at).getTime();
              return ts >= fromTs && ts <= toTs;
            })
            .filter(c => {
              if (!searchTerm.trim()) return true;
              const s = searchTerm.toLowerCase();
              return (c.name || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.phone_number || '').toLowerCase().includes(s);
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else {
          const fromTs = new Date(fromDate).getTime();
          const toTs = new Date(toDate + 'T23:59:59').getTime();
          exportContacts = (MOCK_CONTACTS as Contact[])
            .filter(c => {
              const ts = new Date(c.created_at).getTime();
              return ts >= fromTs && ts <= toTs;
            })
            .filter(c => {
              if (!searchTerm.trim()) return true;
              const s = searchTerm.toLowerCase();
              return (c.name || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.phone_number || '').toLowerCase().includes(s);
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      }

      // Convert to Excel format
      const exportData = exportContacts.map(contact => ({
        contact_identifier: contact.sender_attendee_id ?? contact.phone_number ?? '',
        name: contact.name || '',
        phone_number: contact.phone_number || '',
        email: contact.email || '',
        channel: contact.channel || '',
        stage_name: contact.stage_name || '',
        pipeline_name: contact.pipeline_name || '',
        status: contact.status || '',
        priority: contact.priority || '',
        tags: contact.tags || '',
        created_date: new Date(contact.created_at).toLocaleDateString()
      }));

      if (exportData.length === 0) {
        toast({
          title: "No data to export",
          description: "No contacts match the current filters",
          variant: "destructive"
        });
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
      XLSX.writeFile(wb, `contacts_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      toast({
        title: "Success",
        description: `Exported ${exportData.length} contact(s) to Excel`
      });
    } catch (error: any) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export contacts. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to enrich contacts with related data for export
  const enrichContactsForExport = async (data: any[]): Promise<Contact[]> => data as Contact[];

  const clearFilters = () => {
    setSearchTerm('');
    setChannelFilter([]);
    setStageFilter([]);
    setPipelineFilter([]);
    setPriorityFilter('all');
    setTagsFilter([]);
    setTagFilterMode('OR');
    setDateFrom(subDays(new Date(), 7));
    setDateTo(new Date());
    setCurrentPage(1);
  };

  const handleOpenOpportunity = async (contact: Contact) => {
    if (!contact.opportunity_id) {
      toast({
        title: "No Opportunity",
        description: "This contact doesn't have an associated opportunity",
        variant: "destructive"
      });
      return;
    }

    const opp = MOCK_OPPORTUNITIES.find(o => o.id === contact.opportunity_id);
    const pipeline = MOCK_PIPELINES.find(p => p.id === opp?.pipeline_id);
    const stage = MOCK_STAGES.find(s => s.id === opp?.stage_id);
    if (!opp) {
      toast({ title: "Error", description: "Opportunity not found", variant: "destructive" });
      return;
    }
    setSelectedOpportunity({
      ...opp,
      pipelines: { pipeline_name: pipeline?.pipeline_name || '' },
      stages: { stage_name: stage?.stage_name || '' }
    } as any);
    setOpportunityModalOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasFilters = searchTerm || channelFilter.length > 0 || stageFilter.length > 0 ||
    pipelineFilter.length > 0 || priorityFilter !== 'all' || tagsFilter.length > 0;

  return (
    <ModernLayout title="Contacts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground">Track contact progression across stages, pipelines, and channels</p>
          </div>
        </div>

        {/* Metrics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              {isLoadingMetrics ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                    <p className="text-3xl font-bold">{metricsData.totalContacts.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="p-6">
              {isLoadingMetrics ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-muted-foreground">With Email</span>
                    </div>
                    <span className="text-xl font-bold">{metricsData.withEmail.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-muted-foreground">With Phone</span>
                    </div>
                    <span className="text-xl font-bold">{metricsData.withPhone.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                By Channel
              </p>
              {isLoadingMetrics ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {Object.entries(metricsData.channelDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([channel, count]) => (
                      <div key={channel} className="flex justify-between items-center">
                        <Badge variant="outline" className={`text-xs ${getChannelColor(channel)} capitalize`}>
                          {channel}
                        </Badge>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  {Object.keys(metricsData.channelDistribution).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No data</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 md:col-span-1">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                By Pipeline
              </p>
              {isLoadingMetrics ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {Object.entries(metricsData.pipelineDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([pipeline, count]) => (
                      <div key={pipeline} className="flex justify-between items-center gap-2">
                        <span className="text-xs font-medium truncate flex-1" title={pipeline}>
                          {pipeline}
                        </span>
                        <Badge variant="secondary" className="text-xs shrink-0">{count}</Badge>
                      </div>
                    ))}
                  {Object.keys(metricsData.pipelineDistribution).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No data</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filter & Search
                <span className="text-sm font-normal text-muted-foreground">
                  ({(hasFilters ? totalCount : metricsData.totalContacts).toLocaleString()} contacts)
                </span>
              </CardTitle>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search name, email, phone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Channel Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    <span className="truncate">
                      {channelFilter.length > 0 ? `${channelFilter.length} channel(s)` : 'All Channels'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">Select Channels</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setChannelFilter(availableChannels)}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setChannelFilter([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableChannels.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No channels available</p>
                      ) : (
                        availableChannels.map(channel => (
                          <div key={channel} className="flex items-center space-x-2">
                            <Checkbox
                              id={`channel-${channel}`}
                              checked={channelFilter.includes(channel)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setChannelFilter(prev => [...prev, channel]);
                                } else {
                                  setChannelFilter(prev => prev.filter(c => c !== channel));
                                }
                              }}
                            />
                            <label
                              htmlFor={`channel-${channel}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              <Badge variant="outline" className={`${getChannelColor(channel)} capitalize`}>
                                {channel}
                              </Badge>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Pipeline Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    <span className="truncate">
                      {pipelineFilter.length > 0 ? `${pipelineFilter.length} pipeline(s)` : 'All Pipelines'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">Select Pipelines</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setPipelineFilter(availablePipelines.map(p => p.name))}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setPipelineFilter([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePipelines.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No pipelines available</p>
                      ) : (
                        availablePipelines.map(pipeline => (
                          <div key={pipeline.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pipeline-${pipeline.id}`}
                              checked={pipelineFilter.includes(pipeline.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setPipelineFilter(prev => [...prev, pipeline.name]);
                                } else {
                                  setPipelineFilter(prev => prev.filter(p => p !== pipeline.name));
                                }
                              }}
                            />
                            <label
                              htmlFor={`pipeline-${pipeline.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {pipeline.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Stage Filter - Dependent on Pipeline */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between" disabled={pipelineFilter.length === 0}>
                    <span className="truncate">
                      {pipelineFilter.length === 0
                        ? 'Select Pipeline First'
                        : stageFilter.length > 0
                          ? `${stageFilter.length} stage(s)`
                          : 'All Stages'
                      }
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">Select Stages</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setStageFilter(availableStages.map(s => s.name))}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setStageFilter([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableStages.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No stages available</p>
                      ) : (
                        availableStages.map(stage => (
                          <div key={stage.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`stage-${stage.id}`}
                              checked={stageFilter.includes(stage.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setStageFilter(prev => [...prev, stage.name]);
                                } else {
                                  setStageFilter(prev => prev.filter(s => s !== stage.name));
                                }
                              }}
                            />
                            <label
                              htmlFor={`stage-${stage.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              {stage.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {availablePriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tags Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    <span className="truncate">
                      {tagsFilter.length > 0 ? `${tagsFilter.length} tag(s)` : 'All Tags'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">Select Tags</div>
                        <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
                          <button
                            className={`px-2 py-1 text-xs rounded-sm transition-colors ${tagFilterMode === 'OR'
                              ? "bg-background shadow-sm font-medium"
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                            onClick={() => setTagFilterMode('OR')}
                          >
                            Any
                          </button>
                          <button
                            className={`px-2 py-1 text-xs rounded-sm transition-colors ${tagFilterMode === 'AND'
                              ? "bg-background shadow-sm font-medium"
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                            onClick={() => setTagFilterMode('AND')}
                          >
                            All
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        {tagsFilter.length} selected
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setTagsFilter(availableTags)}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setTagsFilter([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableTags.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No tags available</p>
                      ) : (
                        availableTags.map(tag => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={tagsFilter.includes(tag)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTagsFilter(prev => [...prev, tag]);
                                } else {
                                  setTagsFilter(prev => prev.filter(t => t !== tag));
                                }
                              }}
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                            >
                              <Badge variant="outline" className={`${getTagColor(tag)}`}>
                                {tag}
                              </Badge>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    From: {format(dateFrom, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    To: {format(dateTo, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Export Button */}
              <Button
                onClick={exportToExcel}
                variant="default"
                className="xl:col-start-6"
                disabled={totalCount === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export ({totalCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Contacts ({contacts.length} shown{totalCount > 0 ? ` of ${totalCount}` : ''})
                </CardTitle>
                <CardDescription>
                  {hasFilters && 'Filtered results • '}Page {currentPage} of {totalPages || 1}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Records per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Per Page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* First page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || loading}
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>

                {/* Next page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages || loading}
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-muted-foreground">
                  {hasFilters
                    ? 'Try adjusting your filters or search criteria'
                    : metricsData.totalContacts === 0
                      ? 'Contacts will appear here when you connect a channel or create opportunities'
                      : 'No contacts match the selected date range'
                  }
                </p>
                {hasFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Phone</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Channel</th>
                      <th className="text-left p-4 font-semibold">Stage</th>
                      <th className="text-left p-4 font-semibold">Pipeline</th>
                      <th className="text-left p-4 font-semibold">Tags</th>
                      <th className="text-left p-4 font-semibold">Created</th>
                      <th className="text-right p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(contact => (
                      <tr key={contact.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{contact.name || '--'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{contact.phone_number || '--'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{contact.email || '--'}</div>
                        </td>
                        <td className="p-4">
                          {contact.channel ? (
                            <Badge variant="outline" className={`capitalize ${getChannelColor(contact.channel)}`}>
                              {contact.channel}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">--</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{contact.stage_name || '--'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{contact.pipeline_name || '--'}</div>
                        </td>
                        <td className="p-4">
                          {contact.tags ? (
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.split(',').map((tag, idx) => (
                                <Badge key={idx} variant="outline" className={`text-xs ${getTagColor(tag.trim())}`}>
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">--</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenOpportunity(contact)}
                                disabled={!contact.opportunity_id}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Opportunity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Modal */}
      {selectedOpportunity && (
        <UnifiedOpportunityModal
          open={opportunityModalOpen}
          onOpenChange={setOpportunityModalOpen}
          onSuccess={() => {
            setOpportunityModalOpen(false);
            fetchContacts();
            loadMetrics();
          }}
          mode="update"
          opportunity={selectedOpportunity}
        />
      )}
    </ModernLayout>
  );
};

export default Contacts;
