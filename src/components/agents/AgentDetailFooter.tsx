
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface AgentDetailFooterProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const AgentDetailFooter = ({
  hasUnsavedChanges,
  isSaving,
  onSave,
  onCancel
}: AgentDetailFooterProps) => {
  const [showSavedStatus, setShowSavedStatus] = useState(false);

  // Show saved status when saving completes
  useEffect(() => {
    if (!isSaving && !hasUnsavedChanges) {
      setShowSavedStatus(true);
      const timer = setTimeout(() => {
        setShowSavedStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, hasUnsavedChanges]);

  return (
    <div className="p-4 border-t border-gray-200 flex justify-end items-center bg-white sticky bottom-0 shadow-md z-10">
      <div className="flex items-center mr-auto">
        {showSavedStatus && !hasUnsavedChanges && (
          <div className="flex items-center text-green-600 animate-fade-in">
            <CheckCircle size={16} className="mr-1" />
            <span>Changes saved</span>
          </div>
        )}
        {hasUnsavedChanges && !isSaving && (
          <div className="flex items-center text-amber-600">
            <span className="text-sm">You have unsaved changes</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving || !hasUnsavedChanges}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="bg-primary text-white"
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AgentDetailFooter;
