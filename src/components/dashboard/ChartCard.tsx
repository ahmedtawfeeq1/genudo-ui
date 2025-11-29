
import React, { ReactNode } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  infoTooltip?: string;
  className?: string;
  contentClassName?: string;
};

const ChartCard = ({ 
  title, 
  description, 
  children, 
  infoTooltip,
  className,
  contentClassName
}: ChartCardProps) => {
  return (
    <Card className={`shadow-sm ${className || ""}`}>
      <CardHeader className="pb-0 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-md font-semibold">{title}</CardTitle>
            {infoTooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="ml-2 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{infoTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`pt-1 px-4 pb-3 ${contentClassName || ""}`}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
