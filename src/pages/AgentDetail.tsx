import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import ModernLayout from "@/components/layout/ModernLayout";
import AgentProfileSection from "@/components/agents/AgentProfileSection";
import AgentConfigurationsSection from "@/components/agents/AgentConfigurationsSection";
import KnowledgeSourcesSection from "@/components/agents/KnowledgeSourcesSection";
import KnowledgeInstructionsSection from "@/components/agents/KnowledgeInstructionsSection";
import { useAgent } from "@/hooks/useAgents";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// COMMENTED OUT - These sections will be moved to another page
// import AgentRoutingRulesSection from "@/components/agents/AgentRoutingRulesSection";
// import CoreInstructionsSection from "@/components/agents/CoreInstructionsSection";
// import FlowBuilderSection from "@/components/agents/FlowBuilderSection";

// REMOVED - Tools moved to pipeline stages, others not needed
// import ToolsSection from "@/components/agents/ToolsSection";
// import IntegrationsSection from "@/components/agents/IntegrationsSection";
// import SubagentsSection from "@/components/agents/SubagentsSection";

import { User, FileText, Database, Settings } from "lucide-react";

type SideNavItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
};

type SideNavSection = {
  title?: string;
  items: SideNavItem[];
};

const AgentDetail = () => {
  const { id } = useParams();
  const { data: agent, isLoading, error } = useAgent(id);

  const [activeSection, setActiveSection] = useState<string>("profile");

  // Profile state
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [language, setLanguage] = useState("English");
  const [dialect, setDialect] = useState("multi");
  const [externalAgentId, setExternalAgentId] = useState("");
  const [externalTwinToken, setExternalTwinToken] = useState("");

  // Configuration state (will be managed by child component)
  const [configMetadata, setConfigMetadata] = useState<any>(null);

  // Knowledge instructions state
  const [knowledgeInstructions, setKnowledgeInstructions] = useState("");

  // Update local state when agent data is loaded
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name);
      setAgentDescription(agent.description);
      setIsActive(agent.is_active);
      setLanguage(agent.language);
      setDialect(agent.dialect || "");
      setExternalAgentId(agent.external_agent_id || "");
      setExternalTwinToken(agent.external_agent_token || "");
      setConfigMetadata(agent.config_metadata);
      setKnowledgeInstructions(agent.knowledge_instructions || "");
    }
  }, [agent]);

  // Navigation sections for the sidebar with professional icons
  const navigationSections: SideNavSection[] = [
    {
      title: "GENERAL",
      items: [
        { id: "profile", icon: <User className="mr-3" size={18} />, label: "Agent profile" },
        { id: "configurations", icon: <Settings className="mr-3" size={18} />, label: "Agent configurations" },
      ]
    },
    {
      title: "Agent Knowledge",
      items: [
        { id: "knowledge-sources", icon: <Database className="mr-3" size={18} />, label: "Knowledge sources" },
        { id: "knowledge-instructions", icon: <FileText className="mr-3" size={18} />, label: "Knowledge instructions" },
      ]
    }
  ];

  const renderContent = () => {
    if (!agent) return null;

    switch (activeSection) {
      case "profile":
        return (
          <AgentProfileSection
            agentId={id!}
            agentName={agentName}
            setAgentName={setAgentName}
            agentDescription={agentDescription}
            setAgentDescription={setAgentDescription}
            isActive={isActive}
            setIsActive={setIsActive}
            language={language}
            setLanguage={setLanguage}
            dialect={dialect}
            setDialect={setDialect}
          externalAgentId={externalAgentId}
          setExternalAgentId={setExternalAgentId}
          externalTwinToken={externalTwinToken}
          setExternalTwinToken={setExternalTwinToken}
            metrics={{
              conversations: agent.metrics?.conversations || 0,
              messages: agent.metrics?.messages || 0,
              responseTime: String(agent.metrics?.response_time || 0) + "ms",
              cost: String(agent.metrics?.cost || 0),
            }}
            originalData={{
              name: agent.name,
              description: agent.description,
              isActive: agent.is_active,
              language: agent.language,
              dialect: agent.dialect || "",
              externalAgentId: agent.external_agent_id || "",
              externalTwinToken: agent.external_agent_token || "",
            }}
          />
        );

      case "configurations":
        return (
          <AgentConfigurationsSection
            agentId={id!}
            initialConfig={agent.config_metadata}
            onConfigChange={setConfigMetadata}
          />
        );

      case "knowledge-sources":
        return <KnowledgeSourcesSection agentId={id!} />;

      case "knowledge-instructions":
        return (
          <KnowledgeInstructionsSection
            agentId={id!}
            initialInstructions={agent.knowledge_instructions_manual || ""}
            composedInstructions={agent.knowledge_instructions || ""}
            onInstructionsChange={setKnowledgeInstructions}
          />
        );

      // COMMENTED OUT - These sections will be moved to another page
      // case "routing-rules":
      //   return <AgentRoutingRulesSection />;
      // case "core-instructions":
      //   return <CoreInstructionsSection />;
      // case "flow-builder":
      //   return <FlowBuilderSection agentId={id || "1"} />;

      // REMOVED - Tools moved to pipeline stages, others not needed
      // case "tools":
      //   return <ToolsSection />;
      // case "integrations":
      //   return <IntegrationsSection />;
      // case "subagents":
      //   return <SubagentsSection />;

      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Section Not Found</h2>
            <p className="text-gray-500">The requested section does not exist.</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <ModernLayout title="Agent Detail">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading agent details...</span>
        </div>
      </ModernLayout>
    );
  }

  if (error) {
    return (
      <ModernLayout title="Agent Detail">
        <div className="max-w-2xl mx-auto mt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load agent details: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </ModernLayout>
    );
  }

  if (!agent) {
    return (
      <ModernLayout title="Agent Detail">
        <div className="max-w-2xl mx-auto mt-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The requested agent could not be found.
            </AlertDescription>
          </Alert>
        </div>
      </ModernLayout>
    );
  }

  return (
    <>
      <SEOHead
        title={`Agent: ${agent?.name || 'Loading...'}`}
        description={agent?.description || 'Agent details and configuration'}
        keywords={["agent", "AI", "configuration", "settings"]}
      />
      <ModernLayout title="Agent Details">
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="w-64 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0" style={{ height: 'fit-content' }}>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-gray-700">{agent.name}</h2>
              </div>

              <div className="p-4">
                {navigationSections.map((section, index) => (
                  <div key={index} className="mb-6">
                    {section.title && (
                      <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">{section.title}</h3>
                    )}
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeSection === item.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </ModernLayout>
    </>
  );
};

export default AgentDetail;
