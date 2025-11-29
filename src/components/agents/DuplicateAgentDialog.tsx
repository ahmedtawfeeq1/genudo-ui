import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface DuplicateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newName: string) => Promise<void>;
  isLoading?: boolean;
  originalName: string;
}

const DuplicateAgentDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading,
  originalName 
}: DuplicateAgentDialogProps) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (open && originalName) {
      setNewName(`${originalName} (Copy)`);
    }
  }, [open, originalName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    await onSubmit(newName);
    setNewName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Duplicate Agent</DialogTitle>
            <DialogDescription>
              Create a copy of "{originalName}". Enter a new name for the duplicate agent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-agent-name">New Agent Name *</Label>
              <Input
                id="new-agent-name"
                placeholder="Enter name for duplicated agent"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim() || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duplicate Agent
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateAgentDialog;
