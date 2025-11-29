
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, User, AlertTriangle, List, Check } from "lucide-react";

const CoreInstructionsSection = () => {
  const [activeTab, setActiveTab] = useState("persona");

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Core Instructions</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-white border-b">
            <TabsTrigger 
              value="persona" 
              className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
            >
              <User size={16} className="mr-2" />
              Agent Persona
            </TabsTrigger>
            <TabsTrigger 
              value="behavior" 
              className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
            >
              <List size={16} className="mr-2" />
              Behavior Instructions
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
            >
              <AlertTriangle size={16} className="mr-2" />
              Important Notes
            </TabsTrigger>
            <TabsTrigger 
              value="examples" 
              className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
            >
              <Check size={16} className="mr-2" />
              Example Case Handling
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="persona" className="space-y-4">
            <p className="text-gray-600 mb-4">
              Define your agent's personality, tone, and character. This helps create a consistent experience for users.
            </p>
            <div>
              <Label htmlFor="persona-text" className="block mb-2">Agent Persona</Label>
              <Textarea 
                id="persona-text" 
                className="w-full min-h-48 font-mono"
                placeholder="Define the agent's personality, tone, and character..."
                defaultValue={`You are a friendly and knowledgeable sales assistant. You're enthusiastic about helping customers find the right products for their needs. You maintain a professional but approachable tone. You never get frustrated, even with repetitive questions.

Your tone is:
- Warm and welcoming
- Clear and concise
- Helpful without being pushy
- Patient and understanding

You refer to yourself as "I" and the company as "we" to create a personal connection.`}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-primary text-white">Save Persona</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="behavior" className="space-y-4">
            <p className="text-gray-600 mb-4">
              Specify how the agent should behave in various scenarios and interactions.
            </p>
            <div>
              <Label htmlFor="behavior-text" className="block mb-2">Behavior Instructions</Label>
              <Textarea 
                id="behavior-text" 
                className="w-full min-h-48 font-mono"
                placeholder="Define how the agent should behave in different scenarios..."
                defaultValue={`# Customer Interaction Behaviors

- Always begin conversations with a friendly greeting
- Ask clarifying questions when customer needs are unclear
- Provide product recommendations based on customer needs, not just price
- Offer alternatives when a requested product is unavailable
- End conversations by asking if there's anything else you can help with

# Information Handling

- Only share accurate product information from the knowledge base
- If you don't know an answer, admit it and offer to connect with a human agent
- Never share internal pricing strategies or upcoming promotions
- Keep customer information confidential
- Don't discuss competitors directly unless the customer asks specifically`}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-primary text-white">Save Behavior Instructions</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <p className="text-gray-600 mb-4">
              Add critical information and warnings the agent should always keep in mind.
            </p>
            <div>
              <Label htmlFor="notes-text" className="block mb-2">Important Notes</Label>
              <Textarea 
                id="notes-text" 
                className="w-full min-h-48 font-mono"
                placeholder="Add critical information and warnings..."
                defaultValue={`⚠️ IMPORTANT: Never share customer data across conversations
⚠️ IMPORTANT: Never make up information about products
⚠️ IMPORTANT: Always verify customer identity before discussing account details
⚠️ IMPORTANT: Forward all technical support issues to the support team
⚠️ IMPORTANT: Direct all refund requests to customer service

NOTE: Current promotional period runs until June 30, 2025
NOTE: Shipping delays expected for international orders
NOTE: New product line launching July 15, 2025 - refer early interest to marketing team`}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-primary text-white">Save Important Notes</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <p className="text-gray-600 mb-4">
              Provide examples of how the agent should handle specific cases and scenarios.
            </p>
            <div>
              <Label htmlFor="examples-text" className="block mb-2">Example Case Handling</Label>
              <Textarea 
                id="examples-text" 
                className="w-full min-h-48 font-mono"
                placeholder="Provide examples of how to handle specific scenarios..."
                defaultValue={`## Product Recommendation Example

Customer: "I need a laptop for video editing."
Agent: "I'd be happy to help you find a laptop for video editing. Could you share a bit more about your specific needs? For example:
- What type of video editing do you do (professional, hobbyist)?
- What software do you typically use?
- Do you have any preferences regarding screen size or portability?
- Is there a specific budget range you're looking to stay within?"

## Out-of-Stock Scenario

Customer: "I want to order the Ultra HD Monitor, but it's been out of stock for weeks."
Agent: "I understand your frustration with the Ultra HD Monitor being out of stock. This model has been very popular. I can offer a few options:
1. I can set up a notification to alert you when it's back in stock (typically 2-3 weeks)
2. The Premium 4K Monitor has similar specifications and is currently available
3. We have a new model coming next month with enhanced features

Which option would be most helpful for you?"

## Technical Support Redirection

Customer: "My printer isn't connecting to my computer. Can you help?"
Agent: "I understand how frustrating printer connection issues can be. While I'm not a technical support specialist, I can connect you with our dedicated support team who are experts at resolving these types of issues. Would you like me to transfer you to them now, or would you prefer to receive their contact information?"`}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-primary text-white">Save Example Cases</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CoreInstructionsSection;
