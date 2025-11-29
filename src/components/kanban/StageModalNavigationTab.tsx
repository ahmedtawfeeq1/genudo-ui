import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Compass } from "lucide-react";
import { ExpandableTextarea } from "@/components/ui/expandable-textarea";

interface Props {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const StageModalNavigationTab: React.FC<Props> = ({ formData, onInputChange }) => {
  const whenToEnterLength = formData.when_to_enter?.length || 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Stage Navigation Rules
          </CardTitle>
          <CardDescription>
            Define the conditions for when leads should enter this stage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* When to Enter */}
          <div className="space-y-2">
            <ExpandableTextarea
              id="when_to_enter"
              value={formData.when_to_enter || ""}
              onChange={(value) => onInputChange("when_to_enter", value)}
              placeholder="E.g., When the client confirms interest and provides their budget. Target stage: 'Lead Qualification'"
              rows={3}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {whenToEnterLength} characters
            </div>
          </div>

          {/* Exit rules removed per spec */}

          
        </CardContent>
      </Card>
    </div>
  );
};

export default StageModalNavigationTab;
