import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableTextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
  description?: string;
  maxLength?: number;
  hideOpenEditor?: boolean;
}

export const ExpandableTextarea: React.FC<ExpandableTextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  label,
  description,
  maxLength,
  hideOpenEditor = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedValue, setExpandedValue] = useState(value);

  const handleExpand = () => {
    setExpandedValue(value);
    setIsExpanded(true);
  };

  const handleSave = () => {
    onChange(expandedValue);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setExpandedValue(value);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Textarea and button container */}
      <div className="space-y-2">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={className}
          maxLength={maxLength}
        />

        {/* Open Editor button at bottom left */}
        {!hideOpenEditor && (
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExpand}
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Open Editor
            </Button>
          </div>
        )}
      </div>

      {/* Expanded modal editor */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minimize2 className="h-5 w-5" />
              {label || "Text Editor"}
            </DialogTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <Textarea
              value={expandedValue}
              onChange={(e) => setExpandedValue(e.target.value)}
              placeholder={placeholder}
              className="h-full min-h-[400px] resize-none"
              maxLength={maxLength}
            />
            {maxLength && (
              <div className="text-xs text-muted-foreground text-right mt-1">
                {expandedValue.length} / {maxLength} characters
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
