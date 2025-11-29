// EmptyPipelineState - Shows when no pipeline has been created yet
// Displays an overlay prompting user to start building their pipeline through chat

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, ArrowRight, MessageSquare, Zap, Target } from 'lucide-react';
interface EmptyPipelineStateProps {
  onSendMessage?: (message: string) => void;
}

// Default suggestions with error handling
const DEFAULT_SUGGESTIONS = ["Create a SaaS sales pipeline", "Build an e-commerce funnel", "Design a B2B lead process", "Show me pipeline templates"];
const EmptyPipelineState: React.FC<EmptyPipelineStateProps> = ({
  onSendMessage
}) => {
  const suggestions = ["Create a SaaS sales pipeline", "Build an e-commerce funnel", "Design a B2B lead process", "Show me pipeline templates"];
  return <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm z-30">
      <Card className="w-full max-w-2xl mx-6 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardContent className="p-12 text-center">
          {/* AI Assistant Icon */}
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <Bot className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your AI Pipeline Architect is Ready
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Start a conversation with Nase7 to create your personalized sales pipeline.
            Your custom pipeline will appear here once you define your objectives.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Natural Language</h3>
              <p className="text-sm text-gray-600">Just describe what you want in plain English</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">Intelligent pipeline optimization</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tailored Results</h3>
              <p className="text-sm text-gray-600">Custom stages and agent assignments</p>
            </div>
          </div>

          {/* Quick Start Suggestions */}
          

          {/* Call to Action */}
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Start chatting on the left to build your pipeline</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default EmptyPipelineState;