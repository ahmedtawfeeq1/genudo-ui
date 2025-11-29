import React from 'react';
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
import { AlertTriangle, MessageSquare, Zap, Shield } from 'lucide-react';

interface DeleteSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionName?: string;
}

const DeleteSessionDialog: React.FC<DeleteSessionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sessionName
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                Delete Conversation?
              </AlertDialogTitle>
            </div>
          </div>
          
          <AlertDialogDescription className="text-sm text-gray-600 space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">
                    What will be deleted:
                  </p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    <li>• All chat messages in this conversation</li>
                    <li>• Pipeline visualization history for this session</li>
                    <li>• Conversation context and memory</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 text-sm">
                    What will be preserved:
                  </p>
                  <ul className="text-xs text-green-700 mt-1 space-y-1">
                    <li>• Your actual pipelines (if already created)</li>
                    <li>• Pipeline configurations and settings</li>
                    <li>• Other conversations remain untouched</li>
                  </ul>
                </div>
              </div>
            </div>

            {sessionName && (
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Conversation:</span> {sessionName}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
              <Zap className="w-3 h-3" />
              <span>This action cannot be undone</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            className="px-4 py-2 text-sm font-medium"
            onClick={onClose}
          >
            Keep Conversation
          </AlertDialogCancel>
          <AlertDialogAction
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete Forever
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSessionDialog;
