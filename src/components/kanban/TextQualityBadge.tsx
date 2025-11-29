import React from "react";
import { Badge } from "@/components/ui/badge";
import type { QualityLevel } from "@/utils/textMetrics";

interface Props {
  quality: QualityLevel;
  className?: string;
}

const TextQualityBadge: React.FC<Props> = ({ quality, className }) => {
  if (quality.label === 'Empty') {
    return null; // Don't show badge for empty fields
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Badge variant={quality.variant}>
        {quality.label}
      </Badge>
      {quality.message && (
        <span className="text-xs text-muted-foreground">
          {quality.message}
        </span>
      )}
    </div>
  );
};

export default TextQualityBadge;
