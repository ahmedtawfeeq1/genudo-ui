// Demo showcase component for immediate testing and feature demonstration
// This provides a guided tour of Magic Pipeline capabilities

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Download,
  Github,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface DemoShowcaseProps {
  onStartDemo: () => void;
}

const DemoShowcase: React.FC<DemoShowcaseProps> = ({ onStartDemo }) => {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const demoFeatures = [
    {
      id: 'ai-chat',
      title: 'AI-Powered Pipeline Creation',
      description: 'Chat with Nase7 to build pipelines using natural language',
      example: '"Create a SaaS sales pipeline with 6 stages"',
      icon: MessageSquare,
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'visual-editor',
      title: 'Interactive Visual Editor',
      description: 'Drag and drop nodes, customize layouts, real-time updates',
      example: 'Drag stages to reposition, connect with smooth animations',
      icon: Sparkles,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'ai-agents',
      title: 'Specialized AI Agents',
      description: '4 expert agents: Aria, Clio, Ivy, and Vee',
      example: 'Click any agent to see detailed capabilities and metrics',
      icon: Users,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'data-export',
      title: 'Clean JSON Export',
      description: 'Export pipeline data for automation and integrations',
      example: 'Switch to JSON view for clean, structured data',
      icon: Download,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const quickCommands = [
    "Create a modern sales pipeline",
    "Add a qualification stage after lead generation",
    "Assign Aria to lead generation",
    "Show me pipeline templates",
    "Optimize my current pipeline"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Magic Pipeline
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your sales process with AI-powered pipeline automation. 
            Build, modify, and optimize sales pipelines using natural language conversation.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Button 
              onClick={onStartDemo}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Magic Pipeline
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open('https://github.com/ahmedtawfeeq1/magic-pipeline-ai', '_blank')}
              className="px-8 py-3 text-lg"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Live Demo Ready
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2 text-yellow-600" />
              AI Powered
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              4 AI Agents
            </Badge>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {demoFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id} 
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
                onClick={() => setCurrentDemo(feature.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{feature.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm text-purple-600">{feature.example}</code>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Commands */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Try These AI Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickCommands.map((command, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(command)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">"{command}"</span>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              💡 Click any command to copy it, then paste in the AI chat interface
            </p>
          </CardContent>
        </Card>

        {/* AI Agents Preview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Meet Your AI Sales Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Aria', role: 'Lead Generation', rate: '87%', color: 'from-purple-500 to-purple-600' },
                { name: 'Clio', role: 'Demo Expert', rate: '92%', color: 'from-blue-500 to-blue-600' },
                { name: 'Ivy', role: 'Deal Closer', rate: '94%', color: 'from-emerald-500 to-emerald-600' },
                { name: 'Vee', role: 'Recovery Agent', rate: '76%', color: 'from-red-500 to-red-600' }
              ].map((agent) => (
                <div key={agent.name} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${agent.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-lg">{agent.name[0]}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.role}</p>
                  <Badge variant="secondary" className="mt-2">
                    {agent.rate} Success Rate
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Sales Process?</h2>
          <p className="text-lg mb-6 opacity-90">
            Experience the future of sales pipeline automation with AI-powered assistance
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={onStartDemo}
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Building Your Pipeline
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-3"
              onClick={() => window.open('https://github.com/ahmedtawfeeq1/magic-pipeline-ai', '_blank')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoShowcase;