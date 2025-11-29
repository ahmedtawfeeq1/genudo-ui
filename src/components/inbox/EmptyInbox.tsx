
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface EmptyInboxProps {
  resetFilters: () => void;
}

const EmptyInbox: React.FC<EmptyInboxProps> = ({ resetFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <MessageCircle size={64} className="mb-4 text-gray-300" />
      <h2 className="text-xl font-medium mb-2">No conversations found</h2>
      <p>Try adjusting your filters to see more results</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={resetFilters}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default EmptyInbox;
