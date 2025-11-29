
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Copy, ExternalLink, HelpCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { AgentListItem } from "@/types/agent";

interface AgentsTableProps {
  agents: AgentListItem[];
  onDuplicate?: (agentId: string, agentName: string) => void;
  onDelete?: (agentId: string) => void;
}

const AgentsTable = ({ agents, onDuplicate, onDelete }: AgentsTableProps) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow
              key={agent.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/agents/${agent.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                    {agent.avatar || agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); navigate(`/agents/${agent.id}`); }} className="hover:underline">
                    {agent.name}
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={agent.description || ""}>
                {agent.description || <span className="text-gray-400 italic">No description</span>}
              </TableCell>
              <TableCell>{format(new Date(agent.updated_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <Badge
                  variant={agent.is_active ? "success" : "destructive"}
                  className={`whitespace-nowrap ${!agent.is_active ? 'bg-opacity-10 text-destructive hover:bg-destructive/20' : ''}`}
                >
                  {agent.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => navigate(`/agents/${agent.id}`)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-50 text-primary hover:bg-primary-100"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open Agent</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>More Options</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border">
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => onDuplicate && onDuplicate(agent.id, agent.name)}
                      >
                        <Copy size={14} />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer text-destructive"
                        onClick={() => onDelete && onDelete(agent.id)}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentsTable;
