
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, Edit, Copy, SendHorizontal, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Parameter = {
  id: string;
  name: string;
  value: string;
};

type Tool = {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  webhookUrl: string;
  parameters: Parameter[];
  status: "active" | "inactive";
};

const ToolsSection = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [currentParameter, setCurrentParameter] = useState<{ name: string; value: string }>({
    name: "",
    value: ""
  });
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [newTool, setNewTool] = useState<Omit<Tool, "id" | "parameters" | "status">>({
    name: "",
    description: "",
    whenToUse: "",
    method: "GET",
    webhookUrl: ""
  });

  const handleAddParameter = () => {
    if (currentParameter.name) {
      setParameters([
        ...parameters,
        {
          id: Date.now().toString(),
          name: currentParameter.name,
          value: currentParameter.value || ""
        }
      ]);
      setCurrentParameter({ name: "", value: "" });
    }
  };

  const handleRemoveParameter = (id: string) => {
    setParameters(parameters.filter(param => param.id !== id));
  };

  const handleSaveTool = () => {
    if (newTool.name && newTool.description && newTool.webhookUrl) {
      if (editingTool) {
        // Update existing tool
        setTools(tools.map(tool => 
          tool.id === editingTool.id
            ? {
                ...tool,
                ...newTool,
                parameters: parameters,
              }
            : tool
        ));
      } else {
        // Add new tool
        setTools([
          ...tools,
          {
            id: Date.now().toString(),
            ...newTool,
            parameters: parameters,
            status: "active"
          }
        ]);
      }
      
      resetForm();
      setShowAddDialog(false);
      
      toast({
        title: `Tool ${editingTool ? "updated" : "added"} successfully`,
        description: `The webhook tool "${newTool.name}" has been ${editingTool ? "updated" : "added"}.`,
      });
    }
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setNewTool({
      name: tool.name,
      description: tool.description,
      whenToUse: tool.whenToUse,
      method: tool.method,
      webhookUrl: tool.webhookUrl
    });
    setParameters(tool.parameters);
    setShowAddDialog(true);
  };

  const handleDeleteTool = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id));
    toast({
      title: "Tool deleted",
      description: "The webhook tool has been removed.",
    });
  };

  const handleDuplicateTool = (tool: Tool) => {
    const duplicatedTool = {
      ...tool,
      id: Date.now().toString(),
      name: `${tool.name} (Copy)`,
    };
    setTools([...tools, duplicatedTool]);
    toast({
      title: "Tool duplicated",
      description: `A copy of "${tool.name}" has been created.`,
    });
  };

  const handleTestWebhook = () => {
    setTestLoading(true);
    
    // Simulate webhook test
    setTimeout(() => {
      setTestLoading(false);
      toast({
        title: "Webhook test successful",
        description: "The webhook endpoint responded with status 200 OK.",
      });
    }, 1500);
  };

  const handleToggleStatus = (id: string, currentStatus: "active" | "inactive") => {
    setTools(tools.map(tool => 
      tool.id === id
        ? { ...tool, status: currentStatus === "active" ? "inactive" : "active" }
        : tool
    ));
    
    const targetTool = tools.find(tool => tool.id === id);
    if (targetTool) {
      toast({
        title: `Tool ${currentStatus === "active" ? "deactivated" : "activated"}`,
        description: `"${targetTool.name}" is now ${currentStatus === "active" ? "inactive" : "active"}.`,
      });
    }
  };

  const resetForm = () => {
    setNewTool({
      name: "",
      description: "",
      whenToUse: "",
      method: "GET",
      webhookUrl: ""
    });
    setParameters([]);
    setCurrentParameter({ name: "", value: "" });
    setEditingTool(null);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tools</h2>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              className="bg-primary text-white"
            >
              <Plus size={16} className="mr-2" />
              Add Tool
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Configure webhooks and external tools that your agent can interact with.
          </p>
          
          {tools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={tool.status === "active"} 
                          onCheckedChange={() => handleToggleStatus(tool.id, tool.status)}
                        />
                        <span className={`text-sm ${tool.status === "active" ? "text-green-500" : "text-gray-400"}`}>
                          {tool.status === "active" ? (
                            <span className="flex items-center">
                              <Check size={12} className="mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <X size={12} className="mr-1" />
                              Inactive
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`
                        px-2 py-1 text-xs rounded font-medium
                        ${tool.method === "GET" ? "bg-blue-100 text-blue-700" : ""}
                        ${tool.method === "POST" ? "bg-green-100 text-green-700" : ""}
                        ${tool.method === "PUT" ? "bg-yellow-100 text-yellow-700" : ""}
                        ${tool.method === "DELETE" ? "bg-red-100 text-red-700" : ""}
                      `}>
                        {tool.method}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{tool.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditTool(tool)}>
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicateTool(tool)}>
                          <Copy size={14} className="mr-1" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200"
                          onClick={() => handleDeleteTool(tool.id)}
                        >
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="border border-gray-200 rounded-md p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SendHorizontal size={24} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">No tools configured yet</p>
              <p className="text-sm text-gray-500 mb-4">Add webhooks and external tools for your agent to interact with</p>
              <Button 
                className="bg-primary text-white"
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Tool
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Tool Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowAddDialog(open);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTool ? "Edit Tool" : "Add Tool"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tool Name</Label>
                <Input 
                  id="name"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  placeholder="Enter tool name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method">Request Method</Label>
                <Select 
                  value={newTool.method} 
                  onValueChange={(value: "GET" | "POST" | "PUT" | "DELETE") => 
                    setNewTool({ ...newTool, method: value })
                  }
                >
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                placeholder="Enter tool description"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whenToUse">When to Use</Label>
              <Textarea 
                id="whenToUse"
                value={newTool.whenToUse}
                onChange={(e) => setNewTool({ ...newTool, whenToUse: e.target.value })}
                placeholder="Describe when this tool should be used"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <div className="flex space-x-2">
                <Input 
                  id="webhookUrl"
                  value={newTool.webhookUrl}
                  onChange={(e) => setNewTool({ ...newTool, webhookUrl: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleTestWebhook}
                  disabled={!newTool.webhookUrl || testLoading}
                >
                  {testLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <SendHorizontal size={14} className="mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Parameters</Label>
                <div className="text-sm text-gray-500">
                  {parameters.length} parameter{parameters.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Input 
                  placeholder="Parameter name"
                  value={currentParameter.name}
                  onChange={(e) => setCurrentParameter({ ...currentParameter, name: e.target.value })}
                  className="flex-1"
                />
                <Input 
                  placeholder="Sample value"
                  value={currentParameter.value}
                  onChange={(e) => setCurrentParameter({ ...currentParameter, value: e.target.value })}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleAddParameter}
                  disabled={!currentParameter.name}
                >
                  <Plus size={14} />
                </Button>
              </div>
              
              {parameters.length > 0 && (
                <div className="border rounded-md divide-y">
                  {parameters.map((param) => (
                    <div key={param.id} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <span className="font-medium">{param.name}</span>
                        {param.value && (
                          <span className="text-gray-500 ml-2">— {param.value}</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveParameter(param.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setShowAddDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTool}
              className="bg-primary text-white"
              disabled={!newTool.name || !newTool.description || !newTool.webhookUrl}
            >
              {editingTool ? "Update Tool" : "Add Tool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToolsSection;
