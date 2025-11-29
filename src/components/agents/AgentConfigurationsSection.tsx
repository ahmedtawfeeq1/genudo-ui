import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TagInput from "@/components/ui/tag-input";
import { HelpCircle, Loader2, CheckCircle, Settings, Database, Sliders } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSaveAgentProfile } from "@/hooks/useAgents";
import {
  AI_MODELS,
  AI_PROVIDERS,
  ROUTING_AGENT_PROVIDERS,
  RAG_AGENT_PROVIDERS,
  RAG_MODE_OPTIONS,
  CHAT_HISTORY_MODE_OPTIONS,
  DEFAULT_CONFIG_METADATA,
} from "@/constants/aiModels";

interface AgentConfigurationsSectionProps {
  agentId: string;
  initialConfig?: any;
  onConfigChange?: (config: any) => void;
}

const AgentConfigurationsSection = ({
  agentId,
  initialConfig = DEFAULT_CONFIG_METADATA,
  onConfigChange,
}: AgentConfigurationsSectionProps) => {
  const saveProfileMutation = useSaveAgentProfile();
  const [showSavedStatus, setShowSavedStatus] = useState(false);

  // State for all config fields
  const [config, setConfig] = useState(initialConfig);

  // Convert retrieved_columns string to array for TagInput
  const [retrievedColumnsTags, setRetrievedColumnsTags] = useState<string[]>([]);
  const [showAdvancedModels, setShowAdvancedModels] = useState(false);
  const [showAdvancedKnowledge, setShowAdvancedKnowledge] = useState(false);
  const [showAdvancedGeneral, setShowAdvancedGeneral] = useState(false);
  /**
   * Class-level: local input state to avoid NaN warnings for numeric fields
   */
  const [noRelevantDocsStr, setNoRelevantDocsStr] = useState<string>(String(initialConfig.no_relevant_docs ?? 3));

  /**
   * Function-level: ensure default files_mode is set when missing
   */
  useEffect(() => {
    if (!config.files_mode) {
      updateConfig("files_mode", "tabular_data");
    }
    setNoRelevantDocsStr(String(initialConfig.no_relevant_docs ?? 3));
  }, []);

  // Track unsaved changes
  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(initialConfig);

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

  // Update parent when config changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  // Helper to update config
  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  // Get available models based on selected provider
  const getModelsForProvider = (provider: string) => {
    const providerKey = provider.toLowerCase() as keyof typeof AI_MODELS;
    return AI_MODELS[providerKey] || [];
  };

  // Get the correct model field name based on provider
  const getModelFieldName = (provider: string) => {
    return `${provider.toLowerCase()}_model`;
  };

  // When AI provider changes, set the first model as default
  const handleProviderChange = (provider: string) => {
    updateConfig("ai_provider", provider);
    const models = getModelsForProvider(provider);
    if (models.length > 0) {
      const modelFieldName = getModelFieldName(provider);
      updateConfig(modelFieldName, models[0].value);
    }
  };

  // When routing agent provider changes
  const handleRoutingProviderChange = (provider: string) => {
    updateConfig("ra_ai_provider", provider);
    const models = getModelsForProvider(provider);
    if (models.length > 0) {
      updateConfig("routing_agent_model", models[0].value);
    }
  };

  // When RAG agent provider changes
  const handleRAGProviderChange = (provider: string) => {
    updateConfig("rag_ai_provider", provider);
    const models = getModelsForProvider(provider);
    if (models.length > 0) {
      updateConfig("rag_agent_model", models[0].value);
    }
  };

  // Handle retrieved columns change
  const handleRetrievedColumnsChange = (tags: string[]) => {
    setRetrievedColumnsTags(tags);
    updateConfig("retrieved_columns", "");
  };

  // Save handler
  const handleSave = async () => {
    // Force retrieved_columns to empty string as per requirement
    const finalConfig = { ...config, retrieved_columns: "" };
    await saveProfileMutation.mutateAsync({
      agentId,
      updates: {
        config_metadata: finalConfig,
      },
    });
  };

  // Cancel handler
  const handleCancel = () => {
    setConfig(initialConfig);
    setRetrievedColumnsTags([]);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Agent Configurations</h2>

        {/* Section 1: AI Models */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">AI Models</h3>
          </div>

          <div className="space-y-4">
            {/* Main AI Provider & Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-provider" className="min-w-[120px]">
                  Main AI Provider
                </Label>
                <Select value={config.ai_provider} onValueChange={handleProviderChange}>
                  <SelectTrigger id="ai-provider" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="ai-model" className="min-w-[120px]">Main AI Model</Label>
                <Select
                  value={config[getModelFieldName(config.ai_provider)]}
                  onValueChange={(val) => updateConfig(getModelFieldName(config.ai_provider), val)}
                >
                  <SelectTrigger id="ai-model" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsForProvider(config.ai_provider).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedModels((s) => !s)}
              >
                {showAdvancedModels ? "Hide Advanced Model Settings" : "Show Advanced Model Settings"}
              </Button>
            </div>

            {showAdvancedModels && (
              <div className="mt-4 space-y-6">
                {/* Routing Agent AI Provider & Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routing-ai-provider">Routing Agent AI Provider</Label>
                    <Select value={config.ra_ai_provider} onValueChange={handleRoutingProviderChange}>
                      <SelectTrigger id="routing-ai-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTING_AGENT_PROVIDERS.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="routing-model">Routing Agent Model</Label>
                    <Select
                      value={config.routing_agent_model}
                      onValueChange={(val) => updateConfig("routing_agent_model", val)}
                    >
                      <SelectTrigger id="routing-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getModelsForProvider(config.ra_ai_provider).map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* RAG Agent AI Provider & Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rag-ai-provider">RAG Agent AI Provider</Label>
                    <Select value={config.rag_ai_provider} onValueChange={handleRAGProviderChange}>
                      <SelectTrigger id="rag-ai-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RAG_AGENT_PROVIDERS.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rag-model">RAG Agent Model</Label>
                    <Select
                      value={config.rag_agent_model}
                      onValueChange={(val) => updateConfig("rag_agent_model", val)}
                    >
                      <SelectTrigger id="rag-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getModelsForProvider(config.rag_ai_provider).map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Agent Knowledge Settings */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">Agent Knowledge Settings</h3>
          </div>

          <div className="space-y-4">
            {/* Number of Relevant Points */}
            <div>
              <Label htmlFor="no-relevant-docs">Number of Relevant Points</Label>
              <Input
                id="no-relevant-docs"
                type="number"
                min="1"
                max="10"
                value={noRelevantDocsStr}
                onChange={(e) => setNoRelevantDocsStr(e.target.value)}
                onBlur={() => {
                  const n = parseInt(noRelevantDocsStr, 10);
                  const safe = Number.isNaN(n) ? (config.no_relevant_docs ?? 3) : Math.min(10, Math.max(1, n));
                  setNoRelevantDocsStr(String(safe));
                  updateConfig("no_relevant_docs", safe);
                }}
              />
              <p className="text-xs text-gray-600 mt-1">Number of points used for generating messages.</p>
            </div>

            {/* Advanced toggle for Knowledge section */}
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdvancedKnowledge((s) => !s)}>
                {showAdvancedKnowledge ? "Hide Advanced" : "Show Advanced"}
              </Button>
            </div>

            {showAdvancedKnowledge && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rag-mode">Knowledge RAG Mode</Label>
                  <Select value={config.rag_mode} onValueChange={(val) => updateConfig("rag_mode", val)}>
                    <SelectTrigger id="rag-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RAG_MODE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">Use agentic when your knowledge tables have filterable columns.</p>
                </div>

                <div>
                  <Label htmlFor="files-mode">Files Mode</Label>
                  <Select value={config.files_mode || "tabular_data"} onValueChange={(val) => updateConfig("files_mode", val)}>
                    <SelectTrigger id="files-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tabular_data">Tabular Data</SelectItem>
                      <SelectItem value="textual_data">Text Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">Choose how your knowledge is structured for retrieval.</p>
                </div>
              </div>
            )}

            {/* Advanced toggle removed for Knowledge section since RAG Mode is visible */}
          </div>
        </div>

        {/* Section 3: General Agent Settings */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">General Agent Settings</h3>
          </div>

          <div className="space-y-4">
            {/* Agent Memory Window (Days) */}
            <div>
              <Label htmlFor="history-days-back">Agent Memory Window (Days)</Label>
              <Input
                id="history-days-back"
                type="number"
                min="1"
                max="365"
                value={config.history_days_back}
                onChange={(e) => updateConfig("history_days_back", parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-600 mt-1">How many days to the past the agent can remember your user messages.</p>
            </div>

            {/* Model Temperature under general (primary) */}
            <div>
              <Label htmlFor="model-temperature" className="mb-2">Model Temperature: {config.model_temperature}</Label>
              <Slider
                id="model-temperature"
                min={0}
                max={1}
                step={0.1}
                value={[config.model_temperature]}
                onValueChange={(val) => updateConfig("model_temperature", val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>More Consistent</span>
                <span>More Creative</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Adjusts response creativity; higher values are more varied.</p>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdvancedGeneral((s) => !s)}>
                {showAdvancedGeneral ? "Hide Advanced" : "Show Advanced"}
              </Button>
            </div>

            {showAdvancedGeneral && (
              <div className="mt-4 space-y-4">
                {/* Chat History Mode (Advanced) */}
                <div>
                  <Label htmlFor="chat-history-mode">Chat History Mode</Label>
                  <Select
                    value={config.rag_history_mode}
                    onValueChange={(val) => updateConfig("rag_history_mode", val)}
                  >
                    <SelectTrigger id="chat-history-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHAT_HISTORY_MODE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">Determines which past messages are included as context.</p>
                </div>

                {/* Context Message Count (Advanced) */}
                <div>
                  <Label htmlFor="no-previous-messages">Context Message Count</Label>
                  <Input
                    id="no-previous-messages"
                    type="number"
                    min="1"
                    max="50"
                    value={config.no_previous_concated_messages}
                    onChange={(e) => updateConfig("no_previous_concated_messages", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-600 mt-1">Number of recent messages included as context.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
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
  );
};

export default AgentConfigurationsSection;
