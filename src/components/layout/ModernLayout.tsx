
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import ModernSidebar from "@/components/layout/ModernSidebar";
import Header from "@/components/layout/Header";
 

interface Pipeline {
  id: string;
  pipeline_name: string;
}

interface Stage {
  id: string;
  name: string;
}

type ModernLayoutProps = {
  children: React.ReactNode;
  title: string;
  dashboardType?: string;
  setDashboardType?: (type: string) => void;
  openFiltersDialog?: () => void;
  activeFiltersCount?: number;
  showAgentSelector?: boolean;
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string | null) => void;
  showPipelineSelector?: boolean;
  selectedPipelineId?: string | null;
  onSelectPipeline?: (pipelineId: string | null) => void;
  pipelines?: Pipeline[];
  showStageSelector?: boolean;
  availableStages?: Stage[];
  selectedStages?: string[];
  onStagesChange?: (stages: string[]) => void;
  searchText?: string;
  onSearchChange?: (text: string) => void;
  showSearch?: boolean;
  showSort?: boolean;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
};

const SidebarController = ({ title, children, ...headerProps }: { title: string; children: React.ReactNode } & Omit<ModernLayoutProps, 'children' | 'title'>) => {
  const { setOpen } = useSidebar();
  const location = useLocation();

  const hasAutoClosedRef = useRef(false);

  useEffect(() => {
    if (location.pathname === '/magic-pipeline' && !hasAutoClosedRef.current) {
      setOpen(false);
      hasAutoClosedRef.current = true;
    }
    // Reset when leaving magic pipeline
    if (location.pathname !== '/magic-pipeline') {
      hasAutoClosedRef.current = false;
    }
  }, [location.pathname, setOpen]);


  const showHeader = title !== 'Agent Detail' && title !== 'Magic Pipeline';

  return (
    <div className="h-screen flex w-full bg-gray-50 overflow-hidden">
      <ModernSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && (
          <Header
            title={title}
            dashboardType={headerProps.dashboardType}
            setDashboardType={headerProps.setDashboardType}
            openFiltersDialog={headerProps.openFiltersDialog}
            activeFiltersCount={headerProps.activeFiltersCount}
            showAgentSelector={headerProps.showAgentSelector}
            selectedAgentId={headerProps.selectedAgentId}
            onSelectAgent={headerProps.onSelectAgent}
            showPipelineSelector={headerProps.showPipelineSelector}
            selectedPipelineId={headerProps.selectedPipelineId}
            onSelectPipeline={headerProps.onSelectPipeline}
            pipelines={headerProps.pipelines}
            showStageSelector={headerProps.showStageSelector}
            availableStages={headerProps.availableStages}
            selectedStages={headerProps.selectedStages}
            onStagesChange={headerProps.onStagesChange}
            searchText={headerProps.searchText}
            onSearchChange={headerProps.onSearchChange}
            showSearch={headerProps.showSearch}
            showSort={headerProps.showSort}
            sortBy={headerProps.sortBy}
            onSortChange={headerProps.onSortChange}
          />
        )}
        <main className={`flex-1 ${title === 'Inbox' ? 'overflow-hidden' : 'overflow-auto'} bg-gray-50 ${showHeader && title !== 'Inbox' ? 'p-6 md:p-8' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const ModernLayout = ({
  children,
  title,
  dashboardType,
  setDashboardType,
  openFiltersDialog,
  activeFiltersCount,
  showAgentSelector = false,
  selectedAgentId = null,
  onSelectAgent = () => {},
  showPipelineSelector = false,
  selectedPipelineId = null,
  onSelectPipeline = () => {},
  pipelines = [],
  showStageSelector = false,
  availableStages = [],
  selectedStages = [],
  onStagesChange = () => {},
  searchText = "",
  onSearchChange = () => {},
  showSearch = false,
  showSort = false,
  sortBy = "newest",
  onSortChange = () => {}
}: ModernLayoutProps) => {
  return (
    <SidebarProvider>
      <SidebarController
        title={title}
        dashboardType={dashboardType}
        setDashboardType={setDashboardType}
        openFiltersDialog={openFiltersDialog}
        activeFiltersCount={activeFiltersCount}
        showAgentSelector={showAgentSelector}
        selectedAgentId={selectedAgentId}
        onSelectAgent={onSelectAgent}
        showPipelineSelector={showPipelineSelector}
        selectedPipelineId={selectedPipelineId}
        onSelectPipeline={onSelectPipeline}
        pipelines={pipelines}
        showStageSelector={showStageSelector}
        availableStages={availableStages}
        selectedStages={selectedStages}
        onStagesChange={onStagesChange}
        searchText={searchText}
        onSearchChange={onSearchChange}
        showSearch={showSearch}
        showSort={showSort}
        sortBy={sortBy}
        onSortChange={onSortChange}
      >
        {children}
      </SidebarController>
    </SidebarProvider>
  );
};

export default ModernLayout;
