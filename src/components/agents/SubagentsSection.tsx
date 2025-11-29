
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, UserPlus, Trash, Edit, Copy } from "lucide-react";

type Subagent = {
  id: string;
  name: string;
  description: string;
  howToUse: string;
  messageTemplate: string;
};

const SubagentsSection = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [subagents, setSubagents] = useState<Subagent[]>([]);
  const [newSubagent, setNewSubagent] = useState<Partial<Subagent>>({
    name: "",
    description: "",
    howToUse: "",
    messageTemplate: ""
  });

  const handleAddSubagent = () => {
    if (newSubagent.name && newSubagent.description) {
      setSubagents([
        ...subagents,
        {
          id: Date.now().toString(),
          name: newSubagent.name,
          description: newSubagent.description,
          howToUse: newSubagent.howToUse || "",
          messageTemplate: newSubagent.messageTemplate || ""
        }
      ]);
      setNewSubagent({ name: "", description: "", howToUse: "", messageTemplate: "" });
      setShowAddDialog(false);
    }
  };

  const handleDeleteSubagent = (id: string) => {
    setSubagents(subagents.filter(agent => agent.id !== id));
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Subagents</h2>
            <Button 
              variant="outline" 
              className="shadow-sm border-gray-200 hover:border-primary hover:text-primary"
              onClick={() => setShowAddDialog(true)}
            >
              <UserPlus size={16} className="mr-2" />
              Add Subagent
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Configure other agents that this agent can delegate tasks to.
          </p>
          
          {subagents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subagents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy size={14} className="mr-1" />
                          Duplicate
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200"
                          onClick={() => handleDeleteSubagent(agent.id)}
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
              <Users size={36} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">No subagents configured yet</p>
              <p className="text-sm text-gray-500 mb-4">Add subagents to delegate specific tasks to specialized agents</p>
              <Button 
                className="bg-primary text-white"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Subagent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subagent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subagent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subagent Name</Label>
              <Input 
                id="name" 
                placeholder="Enter name"
                value={newSubagent.name}
                onChange={(e) => setNewSubagent({...newSubagent, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="Enter description"
                value={newSubagent.description}
                onChange={(e) => setNewSubagent({...newSubagent, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="howToUse">How to Use This Subagent</Label>
              <Textarea 
                id="howToUse" 
                placeholder="Describe how the main agent should use this subagent"
                value={newSubagent.howToUse}
                onChange={(e) => setNewSubagent({...newSubagent, howToUse: e.target.value})}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageTemplate">Message Template</Label>
              <Textarea 
                id="messageTemplate" 
                placeholder="Enter the first message that would be sent from the main agent"
                value={newSubagent.messageTemplate}
                onChange={(e) => setNewSubagent({...newSubagent, messageTemplate: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary text-white"
              onClick={handleAddSubagent}
              disabled={!newSubagent.name || !newSubagent.description}
            >
              Add Subagent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubagentsSection;
