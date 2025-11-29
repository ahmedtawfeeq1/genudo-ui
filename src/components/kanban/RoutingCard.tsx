
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import KeyConditionEditor from "./KeyConditionEditor";

interface Props {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const RoutingCard: React.FC<Props> = ({ formData, onInputChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Handover Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <KeyConditionEditor
          value={formData.routing_array}
          onChange={(v) => onInputChange("routing_array", v)}
          label="Routing Conditions"
        />
        <p className="text-sm text-gray-500 mt-2">
          Define key-condition pairs that determine when to hand over the conversation to a human agent.
        </p>
      </CardContent>
    </Card>
  );
};

export default RoutingCard;
