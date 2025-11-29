

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Plus, ArrowUpDown, Unplug, RefreshCw, Trash2, MessageCircle, Webhook, Settings as SettingsIcon, ChevronDown, Copy, Check, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConnectorAccount } from "@/types/pipeline";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/mock-db";
import SelectExistingAccount from "./SelectExistingAccount";
import MessengerConnectDialog from "@/components/messenger/MessengerConnectDialog";


// Class: SettingsTabProps — props for pipeline settings component
interface SettingsTabProps {
  pipelineName: string,
  pipelineDescription: string,
  setPipelineName: (x: string) => void,
  setPipelineDescription: (x: string) => void,
  handleSave: () => Promise<void>,
  saving: boolean,
  connectorAccount: ConnectorAccount | null,
  reconnecting: boolean,
  onSwitch: () => void,
  onReconnect: () => void,
  onRestart: () => void,
  onDeleteAccount: () => void,
  showConnectionFlow: boolean,
  setShowConnectionFlow: (b: boolean) => void,
  pipelineId: string,
  userId: string
}

// Function: SettingsTab — main settings UI including Advanced toggles to show/hide sections
const SettingsTab: React.FC<SettingsTabProps> = ({
  pipelineName,
  pipelineDescription,
  setPipelineName,
  setPipelineDescription,
  handleSave,
  saving,
  connectorAccount,
  reconnecting,
  onSwitch,
  onReconnect,
  onRestart,
  onDeleteAccount,
  showConnectionFlow,
  setShowConnectionFlow,
  pipelineId,
  userId
}) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [crmWebhookUrl, setCrmWebhookUrl] = useState("");
  const [channelWebhookUrl, setChannelWebhookUrl] = useState("");
  const [savingWebhooks, setSavingWebhooks] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showMessengerDialog, setShowMessengerDialog] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const { toast } = useToast();

  

  const copyToClipboard = (text: string) => {
    if (!text) return;

    // Fallback function for older browsers or non-secure contexts
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedId(true);
          setTimeout(() => setCopiedId(false), 2000);
          toast({
            title: "Copied",
            description: "Account ID copied to clipboard",
          });
        } else {
          throw new Error("Copy command failed");
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedId(true);
          setTimeout(() => setCopiedId(false), 2000);
          toast({
            title: "Copied",
            description: "Account ID copied to clipboard",
          });
        })
        .catch((err) => {
          console.error('Navigator copy failed:', err);
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  // getChannelIcon rapid split from main file
  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'WHATSAPP':
        return <img src="/channel-icons/whatsapp.svg" alt="WhatsApp" className="h-6 w-6 object-contain" />;
      case 'GMAIL':
        return <img src="/channel-icons/gmail.svg" alt="Gmail" className="h-6 w-6 object-contain" />;
      case 'MESSENGER':
        return <img src="/channel-icons/messenger.svg" alt="Messenger" className="h-6 w-6 object-contain" />;
      case 'INSTAGRAM':
        return <img src="/channel-icons/instagram.svg" alt="Instagram" className="h-6 w-6 object-contain" />;
      case 'TELEGRAM':
        return <img src="/channel-icons/telegram.svg" alt="Telegram" className="h-6 w-6 object-contain" />;
      case 'LINKEDIN':
        return <img src="/channel-icons/linkedin.svg" alt="LinkedIn" className="h-6 w-6 object-contain" />;
      case 'OUTLOOK':
        return <img src="/channel-icons/outlook.svg" alt="Outlook" className="h-6 w-6 object-contain" />;
      case 'EMAIL':
        return <img src="/channel-icons/email.svg" alt="Email" className="h-6 w-6 object-contain" />;
      case 'WEBCHAT':
        return <img src="/channel-icons/webchat.svg" alt="Webchat" className="h-6 w-6 object-contain" />;
      case 'API':
        return <img src="/channel-icons/api.svg" alt="API" className="h-6 w-6 object-contain" />;
      default:
        return <MessageCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getFormattedAccountId = (account: ConnectorAccount) => {
    if (account.channel_type === 'WHATSAPP') {
      return account.connector_sender_provider_id.replace('@s.whatsapp.net', '');
    }
    return account.connector_sender_provider_id;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Configuration</CardTitle>
          <CardDescription>Update your pipeline name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pipeline-name">Pipeline Name</Label>
            <Input id="pipeline-name"
              value={pipelineName}
              onChange={e => setPipelineName(e.target.value)}
              placeholder="Enter pipeline name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-description">Description</Label>
            <Textarea
              id="pipeline-description"
              value={pipelineDescription}
              onChange={e => setPipelineDescription(e.target.value)}
              placeholder="Describe your pipeline..."
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Channel</CardTitle>
          <CardDescription>
            Manage your connected communication channel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectorAccount ? (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getChannelIcon(connectorAccount.channel_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{connectorAccount.connector_account_identifier}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connectorAccount.status === 'active' ? 'bg-green-100 text-green-800' :
                          connectorAccount.status === 'reconnecting' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {connectorAccount.status.charAt(0).toUpperCase() + connectorAccount.status.slice(1)}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500 font-medium">{connectorAccount.channel_type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Account Info</span>
                      <span className="text-sm font-mono text-gray-700 mt-0.5">{getFormattedAccountId(connectorAccount)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all"
                      onClick={() => {
                        if (connectorAccount.external_account_id) {
                          copyToClipboard(connectorAccount.external_account_id);
                        } else {
                          toast({
                            title: "Error",
                            description: "No external account ID found to copy",
                            variant: "destructive",
                          });
                        }
                      }}
                      title="Copy External Account ID"
                    >
                      {copiedId ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onSwitch}
                  disabled={reconnecting}
                  className="flex-1 h-10"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Switch
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={reconnecting}
                      className="flex-1 h-10"
                    >
                      <Unplug className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Channel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you need to disconnect this channel from this pipeline? Disconnecting will stop AI interaction and communication for this pipeline.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {
                        toast({ title: "Success", description: "Channel disconnected successfully (static)" });
                        onDeleteAccount();
                      }}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {connectorAccount.status === 'STOPPED' ? (
                  <Button
                    variant="outline"
                    onClick={onRestart}
                    disabled={reconnecting}
                    className="flex-1 h-10"
                  >
                    {reconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Restarting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restart
                      </>
                    )}
                  </Button>
                ) : connectorAccount.status === 'inactive' || connectorAccount.status === 'reconnecting' ? (
                  <Button
                    variant="outline"
                    onClick={onReconnect}
                    disabled={reconnecting || connectorAccount.status === 'reconnecting'}
                    className="flex-1 h-10"
                  >
                    {reconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reconnecting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reconnect
                      </>
                    )}
                  </Button>
                ) : null}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onDeleteAccount}
                  disabled={reconnecting}
                  className="h-10 w-10 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="bg-white p-4 rounded-full inline-flex mb-4 shadow-sm">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Channel Connected</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Select an existing account or connect a new channel to start receiving messages.</p>

              <div className="max-w-sm mx-auto space-y-3">
                <SelectExistingAccount
                  pipelineId={pipelineId}
                  currentAccountId={connectorAccount?.id || null}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-gray-500">Or Connect New</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setShowConnectionFlow(true)} className="bg-green-600 hover:bg-green-700 shadow-sm">
                    <img src="/channel-icons/whatsapp.svg" alt="WhatsApp" className="h-4 w-4 mr-2 object-contain" />
                    WhatsApp
                  </Button>
                  <Button onClick={() => setShowMessengerDialog(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <img src="/channel-icons/messenger.svg" alt="Messenger" className="h-4 w-4 mr-2 object-contain" />
                    Messenger
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Configure advanced pipeline options and webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Show Advanced Configuration
                </span>
                {isAdvancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-6 pt-4 border-t">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Webhook className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Webhook Configuration</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Outreach Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://your-webhook-endpoint.com/outreach"
                    type="url"
                  />
                  <p className="text-sm text-muted-foreground">
                    This webhook will receive outreach requests for opportunities in this pipeline.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel-webhook-url">Channel Webhook URL</Label>
                  <Input
                    id="channel-webhook-url"
                    value={channelWebhookUrl}
                    onChange={e => setChannelWebhookUrl(e.target.value)}
                    placeholder="https://your-webhook-endpoint.com/channel-events"
                    type="url"
                  />
                  <p className="text-sm text-muted-foreground">
                    This webhook will receive all channel events (messages, etc.) for this pipeline.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm-webhook-url">CRM Sync Webhook URL</Label>
                  <Input
                    id="crm-webhook-url"
                    value={crmWebhookUrl}
                    onChange={e => setCrmWebhookUrl(e.target.value)}
                    placeholder="https://your-crm-system.com/webhook/sync"
                    type="url"
                  />
                  <p className="text-sm text-muted-foreground">
                    This webhook will be called when opportunities are automatically moved to lost stage after reaching maximum follow-ups.
                  </p>
                </div>

                {/* Webhook save button temporarily disabled
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveWebhooks} disabled={savingWebhooks}>
                    {savingWebhooks ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving Webhooks...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Webhooks
                      </>
                    )}
                  </Button>
                </div>
                */}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <MessengerConnectDialog
        open={showMessengerDialog}
        onOpenChange={setShowMessengerDialog}
        onSuccess={() => window.location.reload()}
        pipelineId={pipelineId}
      />
    </div>
  );
};

export default SettingsTab;
