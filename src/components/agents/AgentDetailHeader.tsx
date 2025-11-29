
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type AgentDetailHeaderProps = {
  id: string;
};

const AgentDetailHeader = ({ id }: AgentDetailHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-4">
      <Button 
        variant="ghost" 
        className="px-0 text-gray-600 hover:text-primary hover:bg-transparent" 
        onClick={() => navigate("/agents")}
      >
        <ArrowLeft size={16} className="mr-2" />
        <span className="text-sm font-medium">Back to Agents</span>
      </Button>
    </div>
  );
};

export default AgentDetailHeader;
