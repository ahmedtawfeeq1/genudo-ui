
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash } from "lucide-react";

type RoutingRule = {
  id: string;
  key: string;
  whenToRoute: string;
};

const AgentRoutingRulesSection = () => {
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<RoutingRule>>({
    key: "",
    whenToRoute: ""
  });

  const handleAddRule = () => {
    if (newRule.key && newRule.whenToRoute) {
      if (editingRule) {
        // Update existing rule
        setRoutingRules(routingRules.map(rule => 
          rule.id === editingRule.id 
            ? { ...rule, key: newRule.key!, whenToRoute: newRule.whenToRoute! } 
            : rule
        ));
        setEditingRule(null);
      } else {
        // Add new rule
        setRoutingRules([
          ...routingRules,
          {
            id: Date.now().toString(),
            key: newRule.key,
            whenToRoute: newRule.whenToRoute
          }
        ]);
      }
      
      setNewRule({ key: "", whenToRoute: "" });
      setShowAddDialog(false);
    }
  };

  const handleEditRule = (rule: RoutingRule) => {
    setEditingRule(rule);
    setNewRule({
      key: rule.key,
      whenToRoute: rule.whenToRoute
    });
    setShowAddDialog(true);
  };

  const handleDeleteRule = (id: string) => {
    setRoutingRules(routingRules.filter(rule => rule.id !== id));
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Agent Routing Rules</h2>
            <Button
              onClick={() => {
                setEditingRule(null);
                setNewRule({ key: "", whenToRoute: "" });
                setShowAddDialog(true);
              }}
              className="bg-primary text-white"
            >
              <Plus size={16} className="mr-2" />
              Add Rule
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Configure routing rules to determine when the agent should forward requests to other services or agents.
          </p>
          
          {routingRules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Routing Key</TableHead>
                  <TableHead>When to Route</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routingRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.key}</TableCell>
                    <TableCell>{rule.whenToRoute}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200"
                          onClick={() => handleDeleteRule(rule.id)}
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
              <p className="text-lg font-medium text-gray-700 mb-2">No routing rules configured yet</p>
              <p className="text-sm text-gray-500 mb-4">Add routing rules to control when the agent should forward requests</p>
              <Button 
                className="bg-primary text-white"
                onClick={() => {
                  setEditingRule(null);
                  setNewRule({ key: "", whenToRoute: "" });
                  setShowAddDialog(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Routing Rule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Routing Rule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Routing Rule" : "Add Routing Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="key" className="text-sm font-medium">Routing Key</label>
              <Input 
                id="key"
                value={newRule.key}
                onChange={(e) => setNewRule({ ...newRule, key: e.target.value })}
                placeholder="Enter routing key"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="whenToRoute" className="text-sm font-medium">When to Route</label>
              <Textarea
                id="whenToRoute"
                value={newRule.whenToRoute}
                onChange={(e) => setNewRule({ ...newRule, whenToRoute: e.target.value })}
                placeholder="Describe conditions for when to route"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddRule}
              className="bg-primary text-white"
              disabled={!newRule.key || !newRule.whenToRoute}
            >
              {editingRule ? "Update Rule" : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgentRoutingRulesSection;
