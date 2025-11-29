import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import TableDataGrid from './TableDataGrid';

interface TableDataModalProps {
  open: boolean;
  onClose: () => void;
  tableId: string;
  tableName: string;
  metadata: any;
}

const TableDataModal: React.FC<TableDataModalProps> = ({ 
  open, 
  onClose, 
  tableId, 
  tableName, 
  metadata 
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="table-data-description" className="max-w-full max-h-full w-[95vw] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Manage Table: {tableName}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div id="table-data-description" className="sr-only">
          Manage and paginate through your knowledge points loaded from LoopX. Use Next/Prev to scroll 100 records.
        </div>
        <div className="flex-1 overflow-hidden">
          <TableDataGrid
            tableId={tableId}
            tableName={tableName}
            metadata={metadata}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableDataModal;
