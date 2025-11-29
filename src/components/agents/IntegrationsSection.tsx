
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Link, MessageSquare, Cloud, Trash, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import WhatsAppConnectionFlow from "@/components/whatsapp/WhatsAppConnectionFlow";

type Integration = {
  id: string;
  name: string;
  accountId: string;
  channel: "WhatsApp" | "Messenger" | "Telegram" | "Gmail" | "LinkedIn" | "Instagram";
  status: "active" | "inactive";
  connectedAt: string;
};

type Channel = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
};

const IntegrationsSection = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showConnectSheet, setShowConnectSheet] = useState(false);
  const [showWhatsAppFlow, setShowWhatsAppFlow] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  const availableChannels: Channel[] = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <MessageSquare className="h-8 w-8 text-green-500" />,
      description: "Connect your WhatsApp Business account to engage with customers.",
      enabled: true
    },
    {
      id: "messenger",
      name: "Messenger",
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      description: "Link your Facebook Messenger to respond to customer inquiries.",
      enabled: false
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <MessageSquare className="h-8 w-8 text-sky-500" />,
      description: "Integrate with Telegram to provide support via bot.",
      enabled: false
    },
    {
      id: "gmail",
      name: "Gmail",
      icon: <Cloud className="h-8 w-8 text-red-500" />,
      description: "Connect your Gmail account to monitor and respond to emails.",
      enabled: false
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Link className="h-8 w-8 text-blue-700" />,
      description: "Integrate with LinkedIn for professional communication.",
      enabled: false
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <MessageSquare className="h-8 w-8 text-pink-500" />,
      description: "Connect your Instagram business account for DM engagement.",
      enabled: false
    }
  ];

  const handleOpenChannelSelection = () => {
    setSelectedChannel(null);
    setShowConnectSheet(true);
  };

  const handleSelectChannel = (channel: Channel) => {
    if (!channel.enabled) return;
    
    if (channel.id === 'whatsapp') {
      setShowConnectSheet(false);
      setShowWhatsAppFlow(true);
    } else {
      setSelectedChannel(channel);
    }
  };

  const handleConnectChannel = () => {
    if (!selectedChannel) return;
    
    // Simulate connecting to a channel (for non-WhatsApp channels)
    setTimeout(() => {
      const channelType = selectedChannel.name as Integration["channel"];
      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: `${channelType} Account`,
        accountId: `acc_${Math.random().toString(36).substring(2, 10)}`,
        channel: channelType,
        status: "active",
        connectedAt: new Date().toISOString()
      };
      
      setIntegrations([...integrations, newIntegration]);
      setShowConnectSheet(false);
      setSelectedChannel(null);
      
      toast({
        title: "Integration added",
        description: `Your ${channelType} account has been successfully connected.`,
      });
    }, 1500);
  };

  const handleWhatsAppConnectionSuccess = (accountId: string) => {
    const newIntegration: Integration = {
      id: accountId,
      name: "WhatsApp Business Account",
      accountId: accountId,
      channel: "WhatsApp",
      status: "active",
      connectedAt: new Date().toISOString()
    };
    
    setIntegrations([...integrations, newIntegration]);
    
    toast({
      title: "WhatsApp Connected!",
      description: "Your WhatsApp Business account has been successfully connected.",
    });
  };

  const handleDisconnect = (id: string) => {
    const targetIntegration = integrations.find(integration => integration.id === id);
    if (targetIntegration) {
      setIntegrations(integrations.filter(integration => integration.id !== id));
      
      toast({
        title: "Integration removed",
        description: `Your ${targetIntegration.channel} account has been disconnected.`,
      });
    }
  };

  const handleReconnect = (id: string) => {
    const targetIntegration = integrations.find(integration => integration.id === id);
    if (targetIntegration) {
      // Simulate reconnecting
      setTimeout(() => {
        toast({
          title: "Integration reconnected",
          description: `Your ${targetIntegration.channel} account has been successfully reconnected.`,
        });
      }, 1500);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Integrations</h2>
            <Button
              onClick={handleOpenChannelSelection}
              className="bg-primary text-white"
            >
              <Link size={16} className="mr-2" />
              Connect
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Connect your agent to various channels and platforms to extend its capabilities.
          </p>
          
          {integrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Connected At</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">{integration.name}</TableCell>
                    <TableCell>{integration.accountId}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {availableChannels.find(channel => channel.name === integration.channel)?.icon}
                        <span className="ml-2">{integration.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(integration.connectedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleReconnect(integration.id)}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Reconnect
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          <Trash size={14} className="mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="border border-gray-200 rounded-md p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link size={24} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">No integrations configured yet</p>
              <p className="text-sm text-gray-500 mb-4">Connect your agent to various platforms and channels</p>
              <Button 
                className="bg-primary text-white"
                onClick={handleOpenChannelSelection}
              >
                <Link size={16} className="mr-2" />
                Connect Your First Integration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Integration Sheet */}
      <Sheet open={showConnectSheet} onOpenChange={setShowConnectSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Connect Integration</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-4">
            <p className="text-gray-600">
              Select a channel to connect your agent with.
            </p>
            
            <div className="space-y-2">
              {availableChannels.map((channel) => (
                <div 
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel)}
                  className={`
                    p-4 border rounded-md cursor-pointer transition-all
                    ${selectedChannel?.id === channel.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
                    ${!channel.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {channel.icon}
                    <div>
                      <h3 className="font-medium">{channel.name}</h3>
                      <p className="text-sm text-gray-500">{channel.description}</p>
                      {!channel.enabled && (
                        <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowConnectSheet(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary text-white"
              onClick={handleConnectChannel}
              disabled={!selectedChannel || !selectedChannel.enabled}
            >
              Connect {selectedChannel?.name || 'Channel'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* WhatsApp Connection Flow */}
      <WhatsAppConnectionFlow
        open={showWhatsAppFlow}
        onOpenChange={setShowWhatsAppFlow}
        onConnectionSuccess={handleWhatsAppConnectionSuccess}
      />
    </>
  );
};

export default IntegrationsSection;
