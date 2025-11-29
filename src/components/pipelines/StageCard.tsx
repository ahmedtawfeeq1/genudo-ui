
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Settings, GripVertical } from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import UniversalStageDialog from '../stages/UniversalStageDialog';

interface Stage {
  id: string;
  stage_name: string;
  stage_description: string | null;
  requires_action: boolean;
  assigned_agent_id: string | null;
  stage_position_index?: number;
  opening_message?: boolean;
  created_at: string;
}

interface StageCardProps {
  stage: Stage;
  index: number;
  onDeleted: (stageId: string) => void;
}

const StageCard: React.FC<StageCardProps> = ({ stage, index, onDeleted }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    toast({ title: "Success", description: "Stage deleted (static)" });
    onDeleted(stage.id);
    setShowDeleteAlert(false);
    setDeleting(false);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    // Trigger a refresh of the stage list
    window.location.reload();
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                {(stage.stage_position_index || 0) + 1}
              </div>
              <CardTitle className="text-lg">{stage.stage_name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {stage.stage_description && (
            <CardDescription>{stage.stage_description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {stage.requires_action && (
                <Badge variant="secondary">Requires Action</Badge>
              )}
              {stage.opening_message && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Auto Outreach
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Created {new Date(stage.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the stage
              "{stage.stage_name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UniversalStageDialog
        mode="edit"
        stage={stage}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default StageCard;
