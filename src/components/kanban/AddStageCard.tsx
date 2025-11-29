
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddStageCardProps {
  onAddStage: () => void;
}

const AddStageCard: React.FC<AddStageCardProps> = ({
  onAddStage
}) => {
  return (
    <Button 
      onClick={onAddStage} 
      variant="default" 
      size="sm" 
      className="w-full min-h-[60px] border-2 border-dashed border-primary/30 hover:border-primary bg-primary text-white hover:bg-primary/90 transition-all duration-200 flex flex-col gap-1 my-[13px]"
    >
      <Plus className="h-5 w-5" />
      <span className="text-sm font-medium">Add Stage</span>
    </Button>
  );
};

export default AddStageCard;
