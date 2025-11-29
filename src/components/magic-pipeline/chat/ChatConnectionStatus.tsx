
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, RefreshCw } from 'lucide-react';

interface ChatConnectionStatusProps {
  connectionStatus: 'connected' | 'disconnected' | 'testing';
  flowStatus?: string | null;
  onTestConnection: () => void;
}

const ChatConnectionStatus: React.FC<ChatConnectionStatusProps> = ({
  connectionStatus,
  flowStatus,
  onTestConnection
}) => {
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Online & Ready';
      case 'disconnected': return 'Disconnected';
      case 'testing': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
        connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
        'bg-red-500'
      }`}></div>
      <span className={`text-sm ${getConnectionStatusColor()}`}>
        {getConnectionStatusText()}
      </span>
      <Badge variant="secondary" className="text-xs">
        <Zap className="w-3 h-3 mr-1" />
        AI Powered
      </Badge>
      {flowStatus && (
        <Badge variant="outline" className="text-xs">
          Status: {flowStatus}
        </Badge>
      )}
      {connectionStatus === 'disconnected' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onTestConnection}
          className="text-xs p-1 h-6"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default ChatConnectionStatus;
