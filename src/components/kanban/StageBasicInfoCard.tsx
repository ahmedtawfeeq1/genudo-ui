
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Award, TrendingDown, Minus } from "lucide-react";

interface Props {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const getStageNatureIcon = (nature: string) => {
  switch (nature) {
    case "won":
      return <Award className="h-4 w-4 text-green-600" />;
    case "lost":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case "neutral":
    default:
      return <Minus className="h-4 w-4 text-gray-600" />;
  }
};

const getStageNatureColor = (nature: string) => {
  switch (nature) {
    case "won":
      return "text-green-700 bg-green-50 border-green-200";
    case "lost":
      return "text-red-700 bg-red-50 border-red-200";
    case "neutral":
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

const StageBasicInfoCard: React.FC<Props> = ({ formData, onInputChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stage_name">Stage Name *</Label>
            <Input
              id="stage_name"
              value={formData.stage_name}
              onChange={(e) => onInputChange("stage_name", e.target.value)}
              placeholder="Enter stage name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_stage_id">External Stage ID</Label>
            <Input
              id="external_stage_id"
              type="number"
              value={formData.external_stage_id !== null ? formData.external_stage_id : ""}
              onChange={(e) => onInputChange("external_stage_id", e.target.value === "" ? null : e.target.value)}
              placeholder="Optional external stage ID"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage_description">Description</Label>
          <Textarea
            id="stage_description"
            value={formData.stage_description}
            onChange={(e) => onInputChange("stage_description", e.target.value)}
            placeholder="Enter stage description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage_nature">Stage Nature *</Label>
          <Select value={formData.stage_nature} onValueChange={(value) => onInputChange("stage_nature", value)}>
            <SelectTrigger className={`h-12 ${getStageNatureColor(formData.stage_nature)}`}>
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getStageNatureIcon(formData.stage_nature)}
                  <span className="capitalize">{formData.stage_nature}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="z-[100] bg-white">
              <SelectItem value="neutral">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-gray-600" />
                  <span>Neutral Stage</span>
                </div>
              </SelectItem>
              <SelectItem value="won">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span>Winning Stage</span>
                </div>
              </SelectItem>
              <SelectItem value="lost">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span>Lost Stage</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {formData.stage_nature === "won" && "Opportunities moved to this stage will be marked as 'Won'"}
            {formData.stage_nature === "lost" && "Opportunities moved to this stage will be marked as 'Lost'"}
            {formData.stage_nature === "neutral" && "This is a regular pipeline stage with no automatic status change"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageBasicInfoCard;
