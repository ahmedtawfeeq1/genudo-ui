
// Enhanced ModernPipelineNode for Magic Pipeline system
// This builds upon your existing beautiful design with enhanced functionality

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, CheckCircle, Workflow } from 'lucide-react';

interface ModernPipelineNodeProps {
  data: {
    pipelineName: string;
    pipelineDescription: string;
    totalStages?: number;
    totalAgents?: number;
  };
  selected?: boolean;
}

const ModernPipelineNode: React.FC<ModernPipelineNodeProps> = ({ data, selected }) => {
  return (
    <div className="relative">
      <div className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-white/20 min-w-[400px] transition-all duration-200 ${
        selected ? 'ring-4 ring-blue-300 ring-opacity-50 scale-105' : ''
      }`}>
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Workflow className="w-5 h-5" />
          </div>
          <div className="bg-emerald-400 text-emerald-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Pipeline Active
          </div>
        </div>
        
        {/* Main Content */}
        <h2 className="text-xl font-bold mb-2">{data.pipelineName}</h2>
        <p className="text-purple-100 text-sm whitespace-pre-line mb-3">
          {data.pipelineDescription}
        </p>

        {/* Enhanced Pipeline Stats */}
        {(data.totalStages || data.totalAgents) && (
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/20">
            {data.totalStages && (
              <div className="flex items-center gap-2 text-xs bg-white/10 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                <span className="text-white/90 font-medium">{data.totalStages} Stages</span>
              </div>
            )}
            {data.totalAgents && (
              <div className="flex items-center gap-2 text-xs bg-emerald-400/20 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                <span className="text-white/90 font-medium">{data.totalAgents} AI Agents</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Sparkle Effect */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <div className="w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Single ReactFlow Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-white shadow-lg transition-all duration-200 hover:scale-125 hover:shadow-xl"
        style={{ 
          left: '50%', 
          transform: 'translateX(-50%)',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};

export default ModernPipelineNode;
