
import React from "react";
import RoutingCard from "./RoutingCard";

interface Props {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const StageModalRoutingTab: React.FC<Props> = ({ formData, onInputChange }) => (
  <div className="space-y-4">
    <RoutingCard formData={formData} onInputChange={onInputChange} />
  </div>
);

export default StageModalRoutingTab;
