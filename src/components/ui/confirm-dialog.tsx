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
import { AlertTriangle, Save, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <Save className="h-5 w-5 text-orange-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'destructive':
        return {
          iconBg: 'bg-red-100',
          titleColor: 'text-red-900',
          descColor: 'text-red-700'
        };
      case 'warning':
        return {
          iconBg: 'bg-orange-100',
          titleColor: 'text-orange-900',
          descColor: 'text-orange-700'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-900',
          descColor: 'text-blue-700'
        };
    }
  };

  const colors = getColors();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${colors.iconBg}`}>
                {getIcon()}
              </div>
              <AlertDialogTitle className={`${colors.titleColor} text-lg font-semibold`}>
                {title}
              </AlertDialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogDescription className={`${colors.descColor} text-left leading-relaxed`}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 mt-6">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="min-w-[80px]"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={`min-w-[80px] ${
              variant === 'destructive' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' 
                : variant === 'warning'
                ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

//  Clean two-option unsaved changes dialog with X button
interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDraft: () => void;
  onIgnoreChanges: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onOpenChange,
  onSaveDraft,
  onIgnoreChanges,
  onCancel,
}) => {
  const handleSaveDraft = () => {
    onSaveDraft();
    onOpenChange(false);
  };

  const handleIgnoreChanges = () => {
    onIgnoreChanges();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      handleCancel(); // X button and ESC key trigger cancel
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleDialogClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Save className="h-5 w-5 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-orange-900 text-lg font-semibold">
                Unsaved Changes
              </AlertDialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogDescription className="text-orange-700 text-left leading-relaxed">
            You have unsaved changes. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleIgnoreChanges}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ignore Changes
          </Button>
          
          <Button
            onClick={handleSaveDraft}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft & Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook for managing confirm dialogs
interface UseConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

interface UseConfirmDialogResult {
  ConfirmDialog: React.FC;
  confirm: () => Promise<boolean>;
  showConfirm: (callback: () => void) => void;
}

export const useConfirmDialog = (options: UseConfirmDialogOptions): UseConfirmDialogResult => {
  const [open, setOpen] = React.useState(false);
  const [resolveCallback, setResolveCallback] = React.useState<((value: boolean) => void) | null>(null);
  const [actionCallback, setActionCallback] = React.useState<(() => void) | null>(null);

  const confirm = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
      setOpen(true);
    });
  }, []);

  const showConfirm = React.useCallback((callback: () => void) => {
    setActionCallback(() => callback);
    setOpen(true);
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (resolveCallback) {
      resolveCallback(true);
      setResolveCallback(null);
    }
    if (actionCallback) {
      actionCallback();
      setActionCallback(null);
    }
    setOpen(false);
  }, [resolveCallback, actionCallback]);

  const handleCancel = React.useCallback(() => {
    if (resolveCallback) {
      resolveCallback(false);
      setResolveCallback(null);
    }
    setActionCallback(null);
    setOpen(false);
  }, [resolveCallback]);

  const DialogComponent = React.useCallback<React.FC>(
    () => (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [options, open, handleConfirm, handleCancel]
  );

  return {
    ConfirmDialog: DialogComponent,
    confirm,
    showConfirm,
  };
};

// Hook for unsaved changes dialog - simplified for 2-button design
interface UseUnsavedChangesDialogResult {
  UnsavedChangesDialog: React.FC;
  showUnsavedChangesDialog: (options: {
    onSaveDraft: () => void;
    onIgnoreChanges: () => void;
    onCancel: () => void;
  }) => void;
}

export const useUnsavedChangesDialog = (): UseUnsavedChangesDialogResult => {
  const [open, setOpen] = React.useState(false);
  const [callbacks, setCallbacks] = React.useState<{
    onSaveDraft: () => void;
    onIgnoreChanges: () => void;
    onCancel: () => void;
  } | null>(null);

  const showUnsavedChangesDialog = React.useCallback((options: {
    onSaveDraft: () => void;
    onIgnoreChanges: () => void;
    onCancel: () => void;
  }) => {
    setCallbacks(options);
    setOpen(true);
  }, []);

  const DialogComponent = React.useCallback<React.FC>(
    () => (
      <UnsavedChangesDialog
        open={open}
        onOpenChange={setOpen}
        onSaveDraft={callbacks?.onSaveDraft || (() => {})}
        onIgnoreChanges={callbacks?.onIgnoreChanges || (() => {})}
        onCancel={callbacks?.onCancel || (() => {})}
      />
    ),
    [open, callbacks]
  );

  return {
    UnsavedChangesDialog: DialogComponent,
    showUnsavedChangesDialog,
  };
};