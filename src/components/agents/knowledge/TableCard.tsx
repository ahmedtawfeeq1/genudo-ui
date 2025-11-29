import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table2, Loader2, AlertCircle, CheckCircle2, Trash2, Download, Database, MoreHorizontal, FileEdit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { updateTableInstructions } from '@/services/agentService';
import { useDeleteKnowledgeTable, useTrainStructuredTables, useKnowledgeTables } from '@/hooks/useKnowledgeTables';
import { toast } from 'sonner';
import { db } from "@/lib/mock-db";
import DeleteTableDialog from './DeleteTableDialog';
import TableDataModal from './TableDataModal';

interface TableCardProps {
  table: {
    id: string;
    agent_id: string;
    file_name: string;
    status: string;
    metadata: any;
    created_at: string;
  };
  onTrain?: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onTrain }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState<string>((table as any)?.table_instructions || '');
  const [savingInstructions, setSavingInstructions] = useState(false);
  const { mutate: deleteTable, isPending: isDeleting } = useDeleteKnowledgeTable();
  const { mutate: trainTable, isPending: isTraining } = useTrainStructuredTables();
  const { data: allTables = [] } = useKnowledgeTables(table.agent_id);
  const queryClient = useQueryClient();

  const metadata = table.metadata || {};
  const sourceNameDisplay = metadata.source_name_display || 'Unknown Table';
  const columnCount = (Array.isArray(metadata?.columns) ? metadata.columns.length : (metadata?.total_columns || 0));
  const rowCount = metadata.total_rows || 0;

  const handleTrain = () => {
    trainTable({ agentId: table.agent_id, tableIds: [table.id] });
    onTrain?.();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteTable({ agentId: table.agent_id, tableId: table.id });
    setShowDeleteDialog(false);
  };

  const isLastTable = allTables.length === 1;

  const handlePreview = async () => {
    // Download the original Excel file from Loop-X console
    const fileUrl = (table as any).file_url;
    if (!fileUrl) {
      toast.error('Original file not found');
      return;
    }

    try {
      // For Loop-X console URLs, we can open them directly in a new tab
      // since they are already publicly accessible S3 URLs
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = `${sourceNameDisplay}.xlsx`;
      link.click();
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  /**
   * Function-level: save table instructions 
   */
  const handleSaveInstructions = async () => {
    try {
      setSavingInstructions(true);
      const updated = await updateTableInstructions(table.id, instructions);
      setInstructions((updated as any)?.table_instructions || instructions);
      toast.success('Table instructions saved');
      setShowInstructions(false);
      // Refresh caches
      queryClient.invalidateQueries({ queryKey: ['knowledge-tables', table.agent_id] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-files', table.agent_id] });
    } catch (e) {
      console.error(e);
      toast.error('Failed to save instructions');
    } finally {
      setSavingInstructions(false);
    }
  };

  const getStatusBadge = () => {
    switch (table.status) {
      case 'trained':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Trained
          </Badge>
        );
      case 'training':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Training
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              <CardTitle>{sourceNameDisplay}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setShowInstructions(true)} title="Table Instructions">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Table Instructions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePreview} title="Download Original File">
                    <Download className="h-4 w-4 mr-2" />
                    Download Original File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            {columnCount} columns • {rowCount} rows
          </CardDescription>
          {metadata.source_use && (
            <CardDescription className="mt-2 text-xs">
              {metadata.source_use}
            </CardDescription>
          )}
          {/* Info message moved to Knowledge Sources header tooltip */}
        </CardHeader>
        
        <CardFooter className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleTrain}
            disabled={isTraining || table.status === 'training' || table.status === 'trained'}
          >
            {isTraining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Training...
              </>
            ) : (
              'Train'
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (table.status !== 'trained') {
                toast.error('Manage Data is available after training completes');
                return;
              }
              setShowDataModal(true);
            }}
            title="View and edit table data"
            disabled={table.status !== 'trained'}
          >
            <Database className="h-4 w-4 mr-2" />
            Manage Data
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </CardFooter>
      </Card>

      <DeleteTableDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        tableName={sourceNameDisplay}
        isDeleting={isDeleting}
        isLastTable={isLastTable}
        onConfirm={confirmDelete}
      />

      <TableDataModal
        open={showDataModal}
        onClose={() => {
          setShowDataModal(false);
          // Refresh sources counts and metadata after managing data
          queryClient.invalidateQueries({ queryKey: ['knowledge-tables', table.agent_id] });
          queryClient.invalidateQueries({ queryKey: ['knowledge-files', table.agent_id] });
        }}
        tableId={table.id}
        tableName={sourceNameDisplay}
        metadata={metadata}
      />

      {/* Dialog: Table Instructions */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table Instructions</DialogTitle>
          </DialogHeader>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-[200px]"
            placeholder="Write instructions for this table..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstructions(false)}>Cancel</Button>
            <Button onClick={handleSaveInstructions} disabled={savingInstructions} className="bg-primary text-white">
              {savingInstructions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Instructions'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TableCard;
