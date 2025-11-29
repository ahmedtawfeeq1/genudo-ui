
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AgentCardProps = {
  agent: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    isActive: boolean;
  };
  className?: string;
};

const AgentCard = ({ agent, className }: AgentCardProps) => {
  return (
    <div className={cn("agent-card", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary text-lg font-bold">
              {agent.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium text-lg">{agent.name}</h3>
              <Badge
                variant={agent.isActive ? "default" : "outline"}
                className={cn(
                  "ml-2",
                  agent.isActive ? "bg-success text-white hover:bg-success" : "text-gray-500"
                )}
              >
                {agent.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline">View Details</Button>
        <Button>Edit Agent</Button>
      </div>
    </div>
  );
};

export default AgentCard;
