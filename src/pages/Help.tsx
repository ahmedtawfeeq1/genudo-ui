
import React from 'react';
import ModernLayout from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Workflow, Users, Inbox, Zap, Shield } from 'lucide-react';

const Help = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description: "Connect your WhatsApp Business account to engage with customers directly through our platform."
    },
    {
      icon: Workflow,
      title: "Sales Pipelines",
      description: "Create and manage automated sales pipelines that guide prospects through your conversion process."
    },
    {
      icon: Users,
      title: "Contact Management",
      description: "Organize and track all your customer interactions in one centralized location."
    },
    {
      icon: Inbox,
      title: "Unified Inbox",
      description: "Manage all your customer conversations from different channels in a single inbox."
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Set up automated responses and actions to streamline your customer engagement."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and reliability to protect your business communications."
    }
  ];

  return (
    <ModernLayout title="Help">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground">Learn how to get the most out of Genudo</p>
        </div>

        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-600" />
              Welcome to Genudo
            </CardTitle>
            <CardDescription>
              Your all-in-one WhatsApp Business automation platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              Genudo helps businesses automate their WhatsApp customer engagement through intelligent 
              pipelines and AI-powered conversations. Connect your WhatsApp Business account, create 
              automated sales funnels, and manage all your customer interactions from one powerful dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to set up your first pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Connect WhatsApp Business</h4>
                  <p className="text-sm text-gray-600">Start by connecting your WhatsApp Business account to enable messaging capabilities.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Create Your First Pipeline</h4>
                  <p className="text-sm text-gray-600">Set up automated conversation flows to guide prospects through your sales process.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Manage Conversations</h4>
                  <p className="text-sm text-gray-600">Monitor and engage with your customers through the unified inbox interface.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <feature.icon className="h-5 w-5 text-green-600" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>We're here to support your success</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600">
                If you need additional assistance or have questions about using Genudo, 
                our support team is ready to help you succeed.
              </p>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>📧 support@genudo.ai</span>
                <span>•</span>
                <span>📞 Available 24/7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
};

export default Help;
