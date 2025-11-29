import React from "react";
import { Badge } from "@/components/ui/badge";
import { getTotalQuality } from "@/utils/textMetrics";
import { InfoIcon } from "lucide-react";

interface Props {
  totalWords: number;
  totalChars: number;
  maxWords?: number;
  className?: string;
}

const TotalInstructionsBar: React.FC<Props> = ({
  totalWords,
  totalChars,
  maxWords = 1800,
  className
}) => {
  const quality = getTotalQuality(totalWords);
  const percentage = Math.min((totalWords / maxWords) * 100, 100);

  // Determine progress bar color based on quality
  let barColor = 'bg-gray-300';
  if (quality.variant === 'warning') {
    barColor = 'bg-yellow-500';
  } else if (quality.variant === 'secondary') {
    barColor = 'bg-blue-500';
  } else if (quality.variant === 'success') {
    barColor = 'bg-green-500';
  } else if (quality.variant === 'destructive') {
    barColor = 'bg-red-500';
  }

  return (
    <div className={`border-t pt-4 mt-4 ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Total Instructions</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalWords} / {maxWords} words · {totalChars} characters
          </span>
          {quality.label !== 'Empty' && (
            <Badge variant={quality.variant}>
              {quality.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Message for too much content */}
      {quality.message && (
        <div className="mt-2 text-xs text-destructive flex items-center gap-1">
          <span>{quality.message}</span>
        </div>
      )}
    </div>
  );
};

export default TotalInstructionsBar;
