
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Mail, MessageSquare, Plus } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'WHATSAPP' | 'GMAIL' | 'MESSENGER';
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
}

interface ChannelSelectorProps {
  onChannelSelect: (channelType: string) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({ onChannelSelect }) => {
  const channels: Channel[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      type: 'WHATSAPP',
      icon: <MessageCircle className="h-6 w-6 text-green-600" />,
      enabled: true,
      description: 'Connect your WhatsApp Business account'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      type: 'GMAIL',
      icon: <Mail className="h-6 w-6 text-red-600" />,
      enabled: false,
      description: 'Connect your Gmail account (Coming Soon)'
    },
    {
      id: 'messenger',
      name: 'Messenger',
      type: 'MESSENGER',
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      enabled: false,
      description: 'Connect your Facebook Messenger (Coming Soon)'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Channel</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a channel to connect for your pipeline
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {channels.map((channel) => (
          <Card 
            key={channel.id} 
            className={`cursor-pointer transition-all duration-200 ${
              channel.enabled 
                ? 'hover:shadow-md hover:scale-[1.02] border-gray-200' 
                : 'opacity-50 cursor-not-allowed bg-gray-50'
            }`}
            onClick={() => channel.enabled && onChannelSelect(channel.type)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {channel.icon}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{channel.name}</h4>
                  <p className="text-xs text-gray-600">{channel.description}</p>
                </div>
                {channel.enabled && (
                  <Plus className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChannelSelector;
