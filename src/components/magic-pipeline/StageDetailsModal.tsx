import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  TrendingDown, 
  Zap, 
  Circle,
  Target,
  Settings,
  Hash
} from 'lucide-react';
import { WebhookStageData } from '@/utils/pipelineSchemaConverter';

interface StageDetailsModalProps {
  stageData: WebhookStageData | null;
  onClose: () => void;
}

const StageDetailsModal: React.FC<StageDetailsModalProps> = ({ stageData, onClose }) => {
  if (!stageData) return null;

  const stage = stageData;

  // Determine stage nature based on won_status and automation
  const getStageNature = () => {
    if (stage.won_status === 'won') return 'won';
    if (stage.won_status === 'lost') return 'lost';
    if (stage.won_status === 'neutral' && stage.requires_action) return 'automated';
    return 'normal'; // won_status === 'neutral' && !requires_action
  };

  const stageNature = getStageNature();

  // Get styling based on stage nature
  const getNatureStyling = () => {
    switch (stageNature) {
      case 'won':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          badgeText: 'WON',
          badgeColor: 'bg-green-100 text-green-800 border-green-200',
          headerColor: 'from-green-400 to-emerald-400',
          cardBorder: 'border-green-200',
          cardBg: 'bg-green-50',
          natureText: 'This deal has been successfully won.',
          dotColor: 'bg-green-400'
        };
      case 'lost':
        return {
          icon: <TrendingDown className="w-6 h-6 text-red-600" />,
          badgeText: 'LOST',
          badgeColor: 'bg-red-100 text-red-800 border-red-200',
          headerColor: 'from-red-400 to-rose-400',
          cardBorder: 'border-red-200',
          cardBg: 'bg-red-50',
          natureText: 'This deal opportunity has been lost.',
          dotColor: 'bg-red-400'
        };
      case 'automated':
        return {
          icon: <Zap className="w-6 h-6 text-sky-600" />,
          badgeText: 'AUTOMATED',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
          headerColor: 'from-sky-400 to-cyan-400',
          cardBorder: 'border-sky-200',
          cardBg: 'bg-sky-50',
          natureText: 'This stage has automated workflows and actions.',
          dotColor: 'bg-sky-400 animate-pulse'
        };
      default: // normal
        return {
          icon: <Circle className="w-6 h-6 text-blue-600" />,
          badgeText: 'NORMAL',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          headerColor: 'from-blue-400 to-indigo-400',
          cardBorder: 'border-blue-200',
          cardBg: 'bg-blue-50',
          natureText: 'This stage is operating in standard mode.',
          dotColor: 'bg-blue-400'
        };
    }
  };

  const styling = getNatureStyling();

  return (
    <Dialog open={!!stageData} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-lg bg-gradient-to-br ${styling.headerColor}
                flex items-center justify-center shadow-lg
              `}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {stage.stage_name}
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Stage {stage.stage_level} in Sales Pipeline
                </p>
              </div>
            </div>
            {/* Only Dialog's built-in close button */}
            <Badge className={`${styling.badgeColor} border`}>
              {styling.badgeText}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stage Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Stage Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {stage.stage_description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage Properties */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Properties
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Deal Status</span>
                    <div className="flex items-center gap-2">
                      {stage.won_status === 'won' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : stage.won_status === 'lost' ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-medium capitalize">
                        {stage.won_status === 'neutral' ? 'In Progress' : stage.won_status}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Automation</span>
                    <div className="flex items-center gap-2">
                      {stage.requires_action ? (
                        <Zap className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {stage.requires_action ? 'Enabled' : 'Manual'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stage Nature */}
            <Card className={`${styling.cardBorder} ${styling.cardBg}`}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {styling.icon}
                  Stage Nature
                </h3>
                <div className={`
                  p-4 rounded-lg border ${styling.cardBorder} bg-white/50
                  flex items-start gap-3
                `}>
                  <div className={`w-3 h-3 rounded-full ${styling.dotColor} mt-2 flex-shrink-0`}></div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      {styling.badgeText}
                    </p>
                    <p className="text-sm text-gray-700">
                      {styling.natureText}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pipeline Position</span>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-2xl text-gray-900">
                        {stage.stage_level}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${styling.dotColor}`}></div>
                  <span>
                    {stageNature === 'won' ? 'Deal won' : 
                     stageNature === 'lost' ? 'Deal lost' :
                     stageNature === 'automated' ? 'Has automation' : 
                     'Operating normally'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Sales Pipeline Stage
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StageDetailsModal;