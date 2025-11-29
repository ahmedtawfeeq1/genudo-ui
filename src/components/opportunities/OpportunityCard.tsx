
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Opportunity {
  id: string;
  opportunity_name: string;
  client_name: string;
  client_email: string | null;
  client_phone_number: string | null;
  status: string;
  created_at: string;
  pipeline: {
    pipeline_name: string;
  };
  stage: {
    stage_name: string;
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onUpdated: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onUpdated }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'won':
        return 'bg-blue-100 text-blue-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{opportunity.opportunity_name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Move Stage</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900">{opportunity.client_name}</h4>
          <div className="space-y-1 mt-1">
            {opportunity.client_email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-3 w-3 mr-1" />
                {opportunity.client_email}
              </div>
            )}
            {opportunity.client_phone_number && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                {opportunity.client_phone_number}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pipeline:</span>
            <Badge variant="outline">{opportunity.pipeline.pipeline_name}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stage:</span>
            <Badge variant="secondary">{opportunity.stage.stage_name}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor(opportunity.status)}>
              {opportunity.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 pt-2 border-t">
          <Calendar className="h-3 w-3 mr-1" />
          Created {new Date(opportunity.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
