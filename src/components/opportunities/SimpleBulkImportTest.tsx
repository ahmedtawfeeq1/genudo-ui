import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleBulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  pipelineId: string;
  stages?: any[];
}

const SimpleBulkImportTest: React.FC<SimpleBulkImportProps> = ({
  open,
  onOpenChange,
  onSuccess,
  pipelineId,
  stages = []
}) => {
  const { toast } = useToast();
  
  const handleTest = () => {
    toast({
      title: "Test Successful!",
      description: "The bulk import modal is working correctly.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Test</DialogTitle>
        </DialogHeader>
        <div className="p-6 text-center">
          <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Import Modal Working!</h3>
          <p className="text-gray-600 mb-4">
            Pipeline ID: {pipelineId}<br/>
            Stages: {stages.length}
          </p>
          <div className="space-y-2">
            <Button onClick={handleTest} className="w-full">
              Test Toast
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBulkImportTest;