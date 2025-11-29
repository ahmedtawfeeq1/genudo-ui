
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

interface OpportunityStatusBadgeProps {
  status: string;
  totalCost: number;
  getStatusColor: (status: string) => string;
  getStatusDisplay: (status: string) => string;
}

const OpportunityStatusBadge: React.FC<OpportunityStatusBadgeProps> = ({
  status,
  totalCost,
  getStatusColor,
  getStatusDisplay,
}) => (
  <div className="flex items-center gap-3 ml-4 px-[45px]">
    <Badge className={`px-3 py-1 ${getStatusColor(status || 'active')}`}>
      {getStatusDisplay(status || 'active')}
    </Badge>
    <div className="flex items-center gap-1 bg-emerald-50 py-1 rounded-full border border-emerald-200 px-[10px]">
      <DollarSign className="h-4 w-4 text-emerald-600" />
      <span className="text-sm font-semibold text-emerald-700">
        ${totalCost.toFixed(2)}
      </span>
    </div>
  </div>
);

export default OpportunityStatusBadge;
