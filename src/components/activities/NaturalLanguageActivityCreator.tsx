
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface NaturalLanguageActivityCreatorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const EXAMPLE_PROMPTS = [
  "Call John about the proposal tomorrow at 2 PM",
  "Send follow-up email to Sarah by end of week",
  "Schedule demo meeting with the marketing team",
  "Review contract documents urgently",
  "Set up a high priority meeting with the CEO next Monday"
];

const NaturalLanguageActivityCreator: React.FC<NaturalLanguageActivityCreatorProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false
}) => {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const handleExampleClick = (example: string) => {
    onChange(example);
    setSelectedExample(example);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit();
    }
  };

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span>AI Activity Creator</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Describe what you need to do in natural language... 
For example: 'Call John about the proposal tomorrow at 2 PM' or 'Send follow-up email to Sarah by end of week'"
              className="min-h-[100px] bg-white border-blue-200 focus:border-blue-400 resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              🤖 AI will automatically detect activity type, priority, and timing
            </div>
            <Button 
              type="submit" 
              disabled={!value.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Activity
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Example prompts */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Try these examples:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(example)}
                className={`text-xs text-left h-auto py-2 px-3 whitespace-normal ${
                  selectedExample === example 
                    ? 'bg-blue-100 border-blue-300 text-blue-800' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        {/* Info section */}
        <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
          <div className="font-medium mb-1">✨ What our AI can understand:</div>
          <ul className="text-xs space-y-1 ml-4">
            <li>• Activity types (call, email, meeting, follow-up, etc.)</li>
            <li>• Priority levels (urgent, high, normal, low)</li>
            <li>• Timing (today, tomorrow, next week, specific times)</li>
            <li>• Context and people involved</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageActivityCreator;
