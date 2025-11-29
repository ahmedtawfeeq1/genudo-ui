
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ModernLayout from "@/components/layout/ModernLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FlowBuilderStudio = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ModernLayout title="Flow Builder Studio">
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" className="mr-2" onClick={() => navigate(`/agents/${id}`)}>
            <ArrowLeft size={18} />
          </Button>
          <span className="text-lg font-medium">Back to Agent</span>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Flow Builder Studio</h2>
            <p className="text-gray-600 mb-4">
              This is where you can create visual conversation flows for your agent.
              The Flow Builder Studio interface is under development.
            </p>
            
            <div className="p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Flow Builder Canvas</h3>
              <p className="text-gray-500">
                The visual flow builder will be implemented here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
};

export default FlowBuilderStudio;
