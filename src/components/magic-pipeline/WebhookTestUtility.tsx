// Test utility for webhook integration
// This can be used to simulate webhook responses during development

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface WebhookTestUtilityProps {
  onTestMessage?: (message: any) => void;
}

const mockResponses = {
  new_pipeline: {
    response: "I've created a new modern sales pipeline for you with 6 optimized stages designed to maximize conversion rates.",
    flow_status: "new_pipeline",
    pipeline_data: {
      pipeline_name: "AI-Generated Sales Pipeline",
      pipeline_description: "Optimized sales process created by AI",
      stages: [
        { name: "Lead Generation", description: "Attract potential customers" },
        { name: "Qualification", description: "Assess lead quality and fit" },
        { name: "Demo", description: "Product demonstration" },
        { name: "Proposal", description: "Present custom solution" },
        { name: "Negotiation", description: "Handle objections" },
        { name: "Closed Won", description: "Deal closed successfully" }
      ]
    }
  },
  pipeline_updated: {
    response: "I've successfully updated your pipeline with the requested changes.",
    flow_status: "pipeline_updated",
    updated_fields: ["stages", "description"]
  },
  stage_added: {
    response: "I've added the new stage to your pipeline. It's positioned after the qualification stage.",
    flow_status: "stage_added",
    stage_data: {
      name: "Demo Preparation",
      description: "Prepare customized demo based on lead qualification"
    }
  },
  general_help: {
    response: "I can help you create, modify, and optimize your sales pipelines. What would you like to do?",
    flow_status: "ready"
  },
  error: {
    response: "I encountered an issue processing your request. Please try again or be more specific.",
    flow_status: "error",
    error_details: "Invalid request format"
  }
};

const WebhookTestUtility: React.FC<WebhookTestUtilityProps> = ({ onTestMessage }) => {
  const [customResponse, setCustomResponse] = useState('');
  const [customStatus, setCustomStatus] = useState('');

  const sendTestMessage = (responseType: keyof typeof mockResponses) => {
    const mockResponse = mockResponses[responseType];
    const testMessage = {
      type: "general_response",
      flow_status: mockResponse.flow_status,
      ...mockResponse
    };

    if (onTestMessage) {
      onTestMessage(testMessage);
    }
  };

  const sendCustomMessage = () => {
    if (!customResponse.trim()) return;

    const testMessage = {
      type: "general_response",
      response: customResponse,
      flow_status: customStatus || "custom",
    };

    if (onTestMessage) {
      onTestMessage(testMessage);
    }

    setCustomResponse('');
    setCustomStatus('');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Webhook Test Utility</CardTitle>
        <p className="text-sm text-gray-600">
          Simulate webhook responses for testing the chat interface
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Test Responses */}
        <div>
          <h4 className="font-medium mb-2">Quick Tests:</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(mockResponses).map(([key, response]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => sendTestMessage(key as keyof typeof mockResponses)}
                className="justify-start"
              >
                <Badge variant="secondary" className="mr-2 text-xs">
                  {response.flow_status}
                </Badge>
                {key.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Response */}
        <div>
          <h4 className="font-medium mb-2">Custom Response:</h4>
          <div className="space-y-2">
            <Textarea
              placeholder="Enter custom response message..."
              value={customResponse}
              onChange={(e) => setCustomResponse(e.target.value)}
              rows={3}
            />
            <Input
              placeholder="Flow status (optional)"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
            />
            <Button
              onClick={sendCustomMessage}
              disabled={!customResponse.trim()}
              size="sm"
            >
              Send Custom Response
            </Button>
          </div>
        </div>

        {/* Current Webhook URL */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Production Webhook:</h4>
          <code className="text-xs bg-gray-100 p-2 rounded block break-all">
            https://automation.loop-x.co/webhook-test/8bd03155-34da-4d38-904f-76d9606645b5
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookTestUtility;
