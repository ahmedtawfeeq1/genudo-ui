
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isProcessing: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'testing';
  user: any;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  isProcessing,
  connectionStatus,
  user,
  onSendMessage,
  onKeyPress
}) => {
  return (
    <div className="p-4">
      <div className="flex gap-2 items-end">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={
            connectionStatus === 'disconnected' 
              ? "AI service unavailable..." 
              : "Describe what you want to do with your pipeline..."
          }
          className="flex-1 text-sm min-h-[80px] max-h-[120px] resize-none"
          disabled={isProcessing || !user || connectionStatus === 'disconnected'}
          rows={3}
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isProcessing || !user || connectionStatus === 'disconnected'}
          size="sm"
          className="px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 self-end"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>AI-powered pipeline builder</span>
          {connectionStatus === 'disconnected' && (
            <span className="text-red-600 ml-2">• Service Unavailable</span>
          )}
        </div>
        <span>Press Ctrl+Enter to send</span>
      </div>
      
      {!user && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <AlertCircle className="w-3 h-3" />
          <span>Please log in to use the AI assistant</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
