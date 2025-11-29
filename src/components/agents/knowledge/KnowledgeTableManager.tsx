import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useKnowledgeTables } from '@/hooks/useKnowledgeTables';
import TableCard from './TableCard';
import CreateTableModal from './CreateTableModal';

interface KnowledgeTableManagerProps {
  agentId: string;
}

const KnowledgeTableManager: React.FC<KnowledgeTableManagerProps> = ({ agentId }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tables, isLoading, error } = useKnowledgeTables(agentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading knowledge tables: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Structured Knowledge Tables</h3>
          <p className="text-sm text-muted-foreground">
            Upload and train Excel files with Q&A or tabular data
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Knowledge Table
        </Button>
      </div>

      {tables && tables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No knowledge tables yet. Create your first table to get started.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Table
          </Button>
        </div>
      )}

      <CreateTableModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        agentId={agentId}
      />
    </div>
  );
};

export default KnowledgeTableManager;
