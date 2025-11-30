import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModernLayout from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Phone, Mail, Calendar, User, Target, MessageCircle, Loader2 } from 'lucide-react';
 
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { findConversationByOpportunityId } from '@/utils/conversationLookup';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import { formatDistanceToNow } from 'date-fns';
import type { Opportunity } from '@/components/kanban/types';
const OpportunityDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [inboxLoading, setInboxLoading] = useState(false);
  useEffect(() => {
    if (id) {
      fetchOpportunityData();
    }
  }, [id]);
  const fetchOpportunityData = async () => {
    try {
      await new Promise(res => setTimeout(res, 150));
      const now = new Date().toISOString();
      const opportunityData: any = {
        id,
        opportunity_name: 'Sample Opportunity',
        pipeline_id: 'pipe-1',
        pipeline_name: 'Sales',
        stage_name: 'Qualification',
        client_name: 'Acme Corp',
        client_email: 'client@example.com',
        client_phone_number: '+15550123',
        created_at: now,
        status: 'active',
        source: 'Website',
        tags: 'priority,new',
        opportunity_notes: 'Static demo notes',
      };
      setOpportunity(opportunityData);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load opportunity', variant: 'destructive' });
      navigate('/pipelines');
    } finally {
      setLoading(false);
    }
  };
  const handleBackClick = () => {
    // Navigate to the pipeline's Kanban board instead of opportunities list
    if (opportunity?.pipeline_id) {
      navigate(`/pipelines/${opportunity.pipeline_id}/stages`);
    } else {
      navigate('/pipelines');
    }
  };

  // NEW: Handle inbox button click
  const handleOpenInbox = async () => {
    if (!id || !user?.id) {
      toast({
        title: "Error",
        description: "Unable to open inbox - missing opportunity or user data",
        variant: "destructive"
      });
      return;
    }
    setInboxLoading(true);
    try {
      // Find the conversation for this opportunity
      const conversationId = await findConversationByOpportunityId(id, user.id);
      if (conversationId) {
        // Navigate using the new URL format: /inboxes/:pipelineId?conversation=:conversationId
        navigate(`/inboxes/${opportunity?.pipeline_id}?conversation=${conversationId}`);
        toast({
          title: "Success",
          description: "Opening conversation for this opportunity"
        });
      } else {
        // Navigate to pipeline inbox even if no conversation exists
        navigate(`/inboxes/${opportunity?.pipeline_id}`);
        toast({
          title: "No Conversation Found",
          description: "No conversation exists for this opportunity yet. Navigate to the pipeline inbox."
        });
      }
    } catch (error) {
      console.error('Error opening inbox:', error);
      toast({
        title: "Error",
        description: "Failed to open inbox. Please try again.",
        variant: "destructive"
      });
    } finally {
      setInboxLoading(false);
    }
  };
  if (loading) {
    return <ModernLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ModernLayout>;
  }
  if (!opportunity) {
    return <ModernLayout title="Opportunity Not Found">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Opportunity Not Found</h1>
          <Button onClick={() => navigate('/pipelines')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pipelines
          </Button>
        </div>
      </ModernLayout>;
  }
  return <ModernLayout title={opportunity.opportunity_name}>
      <div className="space-y-6">
        {/* Header with NEW Inbox Button */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleBackClick} className="bg-white shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{opportunity.opportunity_name}</h1>
            <p className="text-gray-600 mt-1">
              {opportunity.pipeline_name} • {opportunity.stage_name}
            </p>
          </div>
          
          {/* NEW: Inbox Button */}
          
          
          <Badge variant="outline" className={`${opportunity.status === 'won' ? 'bg-green-100 text-green-700 border-green-200' : opportunity.status === 'lost' ? 'bg-red-100 text-red-700 border-red-200' : opportunity.status === 'active' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Opportunity Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Opportunity Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{opportunity.client_name}</div>
                        <div className="text-sm text-gray-600">Client</div>
                      </div>
                    </div>
                    
                    {opportunity.client_email && <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{opportunity.client_email}</div>
                          <div className="text-sm text-gray-600">Email</div>
                        </div>
                      </div>}
                    
                    {opportunity.client_phone_number && <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{opportunity.client_phone_number}</div>
                          <div className="text-sm text-gray-600">Phone</div>
                        </div>
                      </div>}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">
                          {formatDistanceToNow(new Date(opportunity.created_at), {
                          addSuffix: true
                        })}
                        </div>
                        <div className="text-sm text-gray-600">Created</div>
                      </div>
                    </div>
                    
                    {opportunity.source && <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{opportunity.source}</div>
                          <div className="text-sm text-gray-600">Source</div>
                        </div>
                      </div>}
                    
                    {opportunity.tags && <div className="flex items-center space-x-3">
                        <div className="flex flex-wrap gap-1">
                          {opportunity.tags.split(',').map((tag, index) => <Badge key={index} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>)}
                        </div>
                      </div>}
                  </div>
                </div>
                
                {opportunity.opportunity_notes && <div className="pt-4 border-t">
                    <div className="font-medium mb-2">Notes</div>
                    <p className="text-gray-700 whitespace-pre-wrap">{opportunity.opportunity_notes}</p>
                  </div>}
              </CardContent>
            </Card>

            {/* Opportunity Form */}
            <OpportunityForm mode="update" opportunity={opportunity} onSuccess={fetchOpportunityData} />
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-700">Opportunity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="outline" className="capitalize">
                    {opportunity.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pipeline</span>
                  <span className="font-medium text-sm">{opportunity.pipeline_name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stage</span>
                  <span className="font-medium text-sm">{opportunity.stage_name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-medium text-sm">
                    {formatDistanceToNow(new Date(opportunity.created_at), {
                    addSuffix: true
                  })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information with NEW Quick Inbox Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-700">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="font-medium">{opportunity.client_name}</div>
                  {opportunity.client_email && <div className="text-sm text-gray-600">{opportunity.client_email}</div>}
                  {opportunity.client_phone_number && <div className="text-sm text-gray-600">{opportunity.client_phone_number}</div>}
                </div>
                
                {/* NEW: Quick Access to Inbox */}
                <div className="pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={handleOpenInbox} disabled={inboxLoading} className="w-full flex items-center gap-2 text-blue-700 border-blue-200 hover:bg-blue-50">
                    {inboxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                    Open Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernLayout>;
};
export default OpportunityDetail;
