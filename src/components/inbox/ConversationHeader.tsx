
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Zap, ZapOff } from "lucide-react";
import { Conversation } from "./ConversationList";

interface ConversationHeaderProps {
  selectedConversation: Conversation;
  aiEnabled: boolean;
  toggleAI: () => void;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  fontSize: number;
  setFontSize: (size: number) => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  selectedConversation,
  contactDetails,
  aiEnabled,
  toggleAI,
  fontSize,
  setFontSize,
}) => {
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={selectedConversation?.contact.avatar} />
          <AvatarFallback className="bg-primary-100 text-primary">
            {selectedConversation?.contact.initials || <User size={16} />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{selectedConversation?.contact.name}</h2>
          {selectedConversation?.contact.type === "customer" && (
            <div className="text-sm text-gray-500">
              <span>{contactDetails.phone}</span>
            </div>
          )}
          {selectedConversation?.tags && selectedConversation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedConversation.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
          >
            A-
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
          >
            A+
          </Button>
        </div>
        <Button
          variant={aiEnabled ? "outline" : "destructive"}
          onClick={toggleAI}
          title={aiEnabled ? "Pause AI" : "Enable AI"}
          className="flex items-center gap-2"
        >
          {aiEnabled ? (
            <Zap size={18} className="text-amber-500" />
          ) : (
            <ZapOff size={18} />
          )}
          {aiEnabled ? "Paused AI" : "Enable AI"}
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
