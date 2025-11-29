
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ChatQuickActionsProps {
  messages: any[];
  isProcessing: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'testing';
  onQuickAction: (action: string) => void;
  sessionId?: string | null;
  hasUserMessages?: boolean; // NEW: Track if user has sent messages in this session
}

const ChatQuickActions: React.FC<ChatQuickActionsProps> = ({
  messages,
  isProcessing,
  connectionStatus,
  onQuickAction,
  sessionId,
  hasUserMessages = false
}) => {
  const quickActions = [
    "Create a modern sales pipeline",
    "Add a demo stage after qualification",
    "Show me pipeline templates",
    "Optimize conversion rates"
  ];

  // Hide quick actions if user has sent messages in this session
  if (hasUserMessages) {
    return null;
  }

  // Show quick actions for new sessions or when no session exists
  return (
    <div className="p-4 border-t border-gray-200/50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
      </div>
      <div className="space-y-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onQuickAction(action)}
            className="w-full text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors border border-gray-200"
            disabled={isProcessing || connectionStatus === 'disconnected'}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatQuickActions;
