
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Input
} from "@/components/ui/input";
import {
  Label
} from "@/components/ui/label";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  Switch
} from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Activity, Users, MessageSquare, Clock, DollarSign, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { AGENT_LANGUAGES, ARABIC_DIALECTS } from "@/constants/aiModels";
import { useSaveAgentProfile } from "@/hooks/useAgents";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type AgentProfileProps = {
  agentId: string;
  agentName: string;
  setAgentName: (name: string) => void;
  agentDescription: string;
  setAgentDescription: (description: string) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  language: string;
  setLanguage: (language: string) => void;
  dialect: string;
  setDialect: (dialect: string) => void;
  externalAgentId: string;
  setExternalAgentId: (id: string) => void;
  externalTwinToken: string;
  setExternalTwinToken: (token: string) => void;
  metrics: {
    conversations: number;
    messages: number;
    responseTime: string;
    cost: string;
  };
  // Original values for comparison
  originalData: {
    name: string;
    description: string;
    isActive: boolean;
    language: string;
    dialect: string;
    externalAgentId: string;
    externalTwinToken: string;
  };
};

const AgentProfileSection = ({
  agentId,
  agentName,
  setAgentName,
  agentDescription,
  setAgentDescription,
  isActive,
  setIsActive,
  language,
  setLanguage,
  dialect,
  setDialect,
  externalAgentId,
  setExternalAgentId,
  externalTwinToken,
  setExternalTwinToken,
  metrics,
  originalData
}: AgentProfileProps) => {
  const saveProfileMutation = useSaveAgentProfile();
  const [showSavedStatus, setShowSavedStatus] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Track if there are unsaved changes
  const hasUnsavedChanges =
    agentName !== originalData.name ||
    agentDescription !== originalData.description ||
    isActive !== originalData.isActive ||
    language !== originalData.language ||
    dialect !== originalData.dialect ||
    externalAgentId !== originalData.externalAgentId ||
    externalTwinToken !== originalData.externalTwinToken;

  // Show saved status after successful save
  useEffect(() => {
    if (!saveProfileMutation.isPending && !hasUnsavedChanges && saveProfileMutation.isSuccess) {
      setShowSavedStatus(true);
      const timer = setTimeout(() => {
        setShowSavedStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveProfileMutation.isPending, hasUnsavedChanges, saveProfileMutation.isSuccess]);

  const handleSave = async () => {
    await saveProfileMutation.mutateAsync({
      agentId,
      updates: {
        name: agentName,
        description: agentDescription,
        is_active: isActive,
        language: language,
        dialect,
        external_agent_id: externalAgentId,
        external_agent_token: externalTwinToken,
      },
    });
  };

  // Function-level: clear dialect when language is not Arabic
  useEffect(() => {
    if (language !== "Arabic" && dialect) {
      setDialect("");
    }
    if (language === "Arabic" && (!dialect || dialect.trim() === "")) {
      setDialect("Multi-Dialect (Let AI Decide!)");
    }
  }, [language]);

  const handleCancel = () => {
    setAgentName(originalData.name);
    setAgentDescription(originalData.description);
    setIsActive(originalData.isActive);
    setLanguage(originalData.language);
    setDialect(originalData.dialect);
    setExternalAgentId(originalData.externalAgentId);
    setExternalTwinToken(originalData.externalTwinToken);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Agent profile</h2>
            <div className="flex items-center">
              <div className={`mr-2 px-2 py-1 text-xs font-medium rounded ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {isActive ? "Active" : "Inactive"}
              </div>
              <Switch
                id="agent-status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center mb-6 border border-gray-200">
              <span className="text-primary text-2xl font-bold">
                {agentName.charAt(0)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="block mb-2">Agent name</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="agent-description" className="block mb-2">Agent description</Label>
                <Textarea
                  id="agent-description"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="w-full min-h-24"
                  placeholder="Describe what this agent does"
                />
                <p className="text-xs text-gray-500 mt-1">Describe what this agent does</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-language" className="block mb-2">Agent Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="agent-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {language === "Arabic" && (
                  <div>
                    <Label htmlFor="agent-dialect" className="block mb-2">Agent Dialect</Label>
                    <Select value={dialect} onValueChange={setDialect}>
                      <SelectTrigger id="agent-dialect">
                        <SelectValue placeholder="Select dialect" />
                      </SelectTrigger>
                      <SelectContent>
                        {ARABIC_DIALECTS.map((d) => (
                          <SelectItem key={d.value} value={d.label}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Advanced Settings - Collapsible */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <span className="text-sm font-medium">Advanced Settings</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div>
                    <Label htmlFor="external-agent-id" className="block mb-2">External Agent ID</Label>
                    <Input
                      id="external-agent-id"
                      value={externalAgentId}
                      onChange={(e) => setExternalAgentId(e.target.value)}
                      placeholder="Enter external agent ID..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Link this agent to an external system</p>
                  </div>
                  <div>
                    <Label htmlFor="external-twin-token" className="block mb-2">External Twin Token</Label>
                    <Input
                      id="external-twin-token"
                      value={externalTwinToken}
                      onChange={(e) => setExternalTwinToken(e.target.value)}
                      placeholder="Enter external twin token..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used to authorize integrations to enable replies from the Inbox.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              {showSavedStatus && !hasUnsavedChanges && (
                <div className="flex items-center text-green-600 animate-fade-in">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm">Changes saved</span>
                </div>
              )}
              {hasUnsavedChanges && !saveProfileMutation.isPending && (
                <div className="flex items-center text-amber-600">
                  <span className="text-sm">You have unsaved changes</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saveProfileMutation.isPending || !hasUnsavedChanges}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary text-white"
                disabled={saveProfileMutation.isPending || !hasUnsavedChanges}
              >
                {saveProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Card - Hidden for now
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">Agent performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <MessageSquare size={18} className="text-primary mr-2" />
                <h3 className="font-medium">Conversations</h3>
              </div>
              <p className="text-2xl font-bold">{metrics.conversations}</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <MessageSquare size={18} className="text-primary mr-2" />
                <h3 className="font-medium">Messages</h3>
              </div>
              <p className="text-2xl font-bold">{metrics.messages}</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <Clock size={18} className="text-primary mr-2" />
                <h3 className="font-medium">Response Time</h3>
              </div>
              <p className="text-2xl font-bold">{metrics.responseTime}</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <DollarSign size={18} className="text-primary mr-2" />
                <h3 className="font-medium">Cost</h3>
              </div>
              <p className="text-2xl font-bold">${metrics.cost}</p>
              <p className="text-xs text-gray-500">total cost</p>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
};

export default AgentProfileSection;
