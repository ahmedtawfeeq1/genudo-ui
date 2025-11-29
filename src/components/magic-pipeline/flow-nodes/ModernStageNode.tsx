import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  TrendingDown, 
  Zap, 
  Circle,
  Users,
  ArrowRight 
} from 'lucide-react';

interface ModernStageNodeProps {
  data: {
    order: number;
    stageName: string;
    description: string;
    won_status: "won" | "neutral" | "lost";  // Updated field
    requiresAction: boolean;
    assignedAgents: number;
    webhookData?: any;
    type?: string;
  };
  selected?: boolean;
}

const ModernStageNode: React.FC<ModernStageNodeProps> = ({ data, selected }) => {
  const {
    order,
    stageName,
    description,
    won_status,
    requiresAction,
    assignedAgents
  } = data;

  // Determine stage nature based on won_status and automation
  const getStageNature = () => {
    if (won_status === 'won') return 'won';
    if (won_status === 'lost') return 'lost';
    if (won_status === 'neutral' && requiresAction) return 'automated';
    return 'normal'; // won_status === 'neutral' && !requiresAction
  };

  const stageNature = getStageNature();

  const getNodeStyling = () => {
    switch (stageNature) {
      case 'won':
        return {
          borderColor: 'border-green-400',
          bgGradient: 'from-green-50 to-emerald-50',
          iconColor: 'text-green-600',
          badgeVariant: 'default' as const,
          badgeText: 'WON',
          badgeColor: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-5 h-5" />,
          natureText: 'Won'
        };
      case 'lost':
        return {
          borderColor: 'border-red-400',
          bgGradient: 'from-red-50 to-rose-50',
          iconColor: 'text-red-600',
          badgeVariant: 'destructive' as const,
          badgeText: 'LOST',
          badgeColor: 'bg-red-100 text-red-800',
          icon: <TrendingDown className="w-5 h-5" />,
          natureText: 'Lost'
        };
      case 'automated':
        return {
          borderColor: 'border-sky-400',
          bgGradient: 'from-sky-50 to-cyan-50',
          iconColor: 'text-sky-600',
          badgeVariant: 'secondary' as const,
          badgeText: 'AUTOMATED',
          badgeColor: 'bg-sky-100 text-sky-800',
          icon: <Zap className="w-5 h-5" />,
          natureText: 'Automated'
        };
      default: // normal
        return {
          borderColor: 'border-blue-300',
          bgGradient: 'from-blue-50 to-indigo-50',
          iconColor: 'text-blue-600',
          badgeVariant: 'outline' as const,
          badgeText: 'NORMAL',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: <Circle className="w-5 h-5" />,
          natureText: 'Normal'
        };
    }
  };

  const styling = getNodeStyling();

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-gray-300 border-2 border-white shadow-md"
        style={{ left: -6 }}
      />
      
      <Card className={`
        w-72 min-h-[140px] transition-all duration-200 cursor-pointer
        ${styling.borderColor} border-2 bg-gradient-to-br ${styling.bgGradient}
        ${selected ? 'ring-2 ring-purple-400 shadow-lg' : 'hover:shadow-md'}
        shadow-sm
      `}>
        <CardContent className="p-4">
          {/* Header with Order and Badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full bg-white border-2 ${styling.borderColor}
                flex items-center justify-center font-bold text-sm ${styling.iconColor}
              `}>
                {order}
              </div>
              <div className={styling.iconColor}>
                {styling.icon}
              </div>
            </div>
            <Badge 
              variant={styling.badgeVariant} 
              className={`text-xs px-2 py-1 ${styling.badgeColor}`}
            >
              {styling.badgeText}
            </Badge>
          </div>

          {/* Stage Name */}
          <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
            {stageName}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>

          {/* Stats Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="font-medium">{assignedAgents}</span> agent{assignedAgents !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Nature Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stageNature === 'won' ? 'bg-green-400' :
                stageNature === 'lost' ? 'bg-red-400' :
                stageNature === 'automated' ? 'bg-sky-400 animate-pulse' :
                'bg-blue-400'
              }`}></div>
              <span className="text-xs text-gray-500">
                {styling.natureText}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-gray-300 border-2 border-white shadow-md"
        style={{ right: -6 }}
      />

      {/* Connection Arrow Hint */}
      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-gray-400">
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default memo(ModernStageNode);