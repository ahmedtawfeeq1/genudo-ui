import React, { useState, useMemo, useEffect } from "react";
import ModernLayout from "@/components/layout/ModernLayout";
import SEOHead from "@/components/common/SEOHead";
import { pageConfigs } from "@/utils/pageConfig";
import AgentsFilter from "@/components/agents/AgentsFilter";
import AgentsTable from "@/components/agents/AgentsTable";
import CreateAgentDialog from "@/components/agents/CreateAgentDialog";
import DuplicateAgentDialog from "@/components/agents/DuplicateAgentDialog";
import { useAgents, useDeleteAgent, useCreateAgent } from "@/hooks/useAgents";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/lib/mock-db";
import { useAuth } from "@/contexts/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AGENTS_PER_PAGE = 8;

const Agents = () => {
  const { user } = useAuth();
  const { data: agents = [], isLoading, error, refetch } = useAgents();
  const deleteAgentMutation = useDeleteAgent();
  const createAgentMutation = useCreateAgent();

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [agentToDuplicate, setAgentToDuplicate] = useState<{ id: string; name: string } | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    // Search by name
    if (searchQuery) {
      filtered = filtered.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((agent) => agent.is_active === isActive);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);

        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchQuery, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAgents.length / AGENTS_PER_PAGE);
  const paginatedAgents = filteredAndSortedAgents.slice(
    (currentPage - 1) * AGENTS_PER_PAGE,
    currentPage * AGENTS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  const handleCreateAgent = async (name: string, description: string) => {
    try {
      await createAgentMutation.mutateAsync({
        name,
        description,
        is_active: true,
        language: "English",
      });
      setShowCreateDialog(false);
      toast.success("Agent created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create agent");
    }
  };

  const handleDuplicateAgent = async (agentId: string, agentName: string) => {
    setAgentToDuplicate({ id: agentId, name: agentName });
    setShowDuplicateDialog(true);
  };

  const handleDuplicateSubmit = async (newName: string) => {
    if (!agentToDuplicate || !user) return;
    try {
      const original = agents.find(a => a.id === agentToDuplicate.id);
      if (!original) throw new Error("Original agent not found");
      await createAgentMutation.mutateAsync({
        name: newName,
        description: original.description,
        avatar: (original as any).avatar,
        is_active: original.is_active,
        language: (original as any).language || "English",
        dialect: (original as any).dialect || "",
        knowledge_instructions: (original as any).knowledge_instructions || "",
        config_metadata: (original as any).config_metadata || {},
      });
      setShowDuplicateDialog(false);
      setAgentToDuplicate(null);
      toast.success("Agent duplicated successfully!");
      refetch();
    } catch (error: any) {
      console.error("Error duplicating agent:", error);
      toast.error(error.message || "Failed to duplicate agent");
    }
  };

  const handleDeleteAgent = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      deleteAgentMutation.mutate(agentToDelete.id);
      setAgentToDelete(null);
    }
  };

  return (
    <>
      <SEOHead
        title={pageConfigs.agents.title}
        description={pageConfigs.agents.description}
        keywords={pageConfigs.agents.keywords}
      />
      <ModernLayout title="Agents">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">AI Agents</h1>
              <p className="text-muted-foreground">
                Manage and configure your AI sales agents
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Agent
            </Button>
          </div>

          {/* Filters */}
          <div className="flex justify-between items-center">
            <AgentsFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-gray-600">Loading agents...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive" className="m-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load agents: {error.message}
                  </AlertDescription>
                </Alert>
              ) : filteredAndSortedAgents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "No agents found matching your filters."
                      : "No agents found. Create your first agent to get started!"}
                  </p>
                </div>
              ) : (
                <>
                  <AgentsTable
                    agents={paginatedAgents}
                    onDuplicate={handleDuplicateAgent}
                    onDelete={(id) => {
                      const agent = agents.find(a => a.id === id);
                      handleDeleteAgent(id, agent?.name || "Unknown Agent");
                    }}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </ModernLayout>

      {/* Dialogs */}
      <CreateAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateAgent}
        isLoading={createAgentMutation.isPending}
      />

      <DuplicateAgentDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        onSubmit={handleDuplicateSubmit}
        isLoading={false}
        originalName={agentToDuplicate?.name || ""}
      />

      <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agent
              <span className="font-medium text-foreground"> "{agentToDelete?.name}" </span>
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Agents;
