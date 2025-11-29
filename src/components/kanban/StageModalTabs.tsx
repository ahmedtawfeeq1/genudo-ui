
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Props {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}

const tabDefs = [
  { value: "general", label: "General" },
  { value: "ai-config", label: "AI Configuration" },
  { value: "navigation", label: "Stage Navigation" },
];

const StageModalTabs: React.FC<Props> = ({ value, onValueChange, children }) => (
  <Tabs value={value} onValueChange={onValueChange} defaultValue="general" className="w-full">
    <TabsList className="grid w-full grid-cols-3">
      {tabDefs.map((tab) => (
        <TabsTrigger value={tab.value} key={tab.value}>{tab.label}</TabsTrigger>
      ))}
    </TabsList>
    {children}
  </Tabs>
);

export default StageModalTabs;
