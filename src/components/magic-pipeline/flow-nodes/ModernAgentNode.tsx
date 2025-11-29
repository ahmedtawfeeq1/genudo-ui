import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Sparkles } from 'lucide-react';

interface ModernAgentNodeProps {
  data: {
    name: string;
    persona: string;
    color: string;
    agentId: string;
    capabilities: string[];
  };
  selected?: boolean;
}

const ModernAgentNode: React.FC<ModernAgentNodeProps> = ({ data, selected }) => {
  const { name, persona, color } = data;

  return (
    <div 
      className={`
        relative w-80 bg-white border-2 border-gray-200 rounded-2xl shadow-lg 
        hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden
        ${selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
      `}
    >
      {/* Left Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />

      {/* Gradient Header */}
      <div className={`h-20 bg-gradient-to-r ${color} relative`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white border-opacity-30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {name}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Sparkle decoration */}
        <Sparkles className="absolute top-3 right-4 w-5 h-5 text-white opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Agent Persona */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {persona}
          </p>
        </div>

        {/* Footer with AI indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">AI Agent Active</span>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAgentNode;