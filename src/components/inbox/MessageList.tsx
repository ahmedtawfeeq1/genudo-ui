
import React, { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, FileVideo, Volume2, Download, Eye, Play, RefreshCw } from "lucide-react";
import type { InboxMessage } from "@/hooks/useInboxData";
import { useSignedMediaUrl } from "@/hooks/useSignedMediaUrl";

interface MessageListProps {
  displayedMessages: InboxMessage[];
  messageHistory: InboxMessage[];
  loading: boolean;
  loadMoreMessages: () => void;
  fontSize: number;
}

const MessageList: React.FC<MessageListProps> = ({
  displayedMessages,
  messageHistory,
  loading,
  loadMoreMessages,
  fontSize,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine conversation direction based on assistant messages
  const getConversationDirection = () => {
    const assistantMessages = displayedMessages.filter(msg =>
      msg.sender.type === 'ai' || msg.sender.type === 'admin'
    );

    // Check if any assistant message has Arabic response language
    const hasArabic = assistantMessages.some(msg =>
      msg.responseLanguage === 'ar'
    );

    return hasArabic ? 'rtl' : 'ltr';
  };

  const conversationDirection = getConversationDirection();
  const isRTL = conversationDirection === 'rtl';

  useEffect(() => {
    const currentCount = displayedMessages.length;
    const prevCount = prevMessageCountRef.current;

    // If this is the first load or new messages arrived (appended to end)
    if (prevCount === 0 || currentCount === prevCount + 1) {
      // Scroll to bottom for new messages
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (currentCount > prevCount && prevCount > 0) {
      // Messages were loaded at the top (prepended), scroll to top
      messagesStartRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCountRef.current = currentCount;
  }, [displayedMessages]);

  const formatMessageDate = (time: string) => {
    return time;
  };

  const MediaRenderer: React.FC<{ message: any }> = ({ message }) => {
    const mediaUrl = message.media_url || message.mediaUrl;
    const mediaType = message.media_type || message.mediaType;
    const fileName = message.content || 'Media file';
    
    const { signedUrl, loading, error, refresh } = useSignedMediaUrl(mediaUrl);

    if (!mediaUrl) return null;

    const handleView = () => {
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      }
    };

    const handleDownload = () => {
      if (signedUrl) {
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    if (loading) {
      return (
        <div className="mt-2 p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading media...</span>
          </div>
        </div>
      );
    }

    if (error || !signedUrl) {
      return (
        <div className="mt-2 p-3 bg-muted rounded-lg border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Media unavailable</span>
              <Button
                size="sm"
                variant="outline"
                onClick={refresh}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your media storage time has expired and the file has been deleted. 
              If you need longer storage time, please contact support to upgrade your plan.
            </p>
          </div>
        </div>
      );
    }

    // Image rendering
    if (mediaType === 'image') {
      return (
        <div className="mt-2">
          <div className="relative group/image">
            <img 
              src={signedUrl} 
              alt="Shared image" 
              className="max-w-xs rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleView}
              onError={(e) => {
                e.currentTarget.style.filter = 'blur(8px)';
                e.currentTarget.style.opacity = '0.5';
              }}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="flex items-center gap-1"
            >
              <Eye size={14} />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-1"
            >
              <Download size={14} />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    // Audio rendering
    if (mediaType === 'audio') {
      return (
        <div className="mt-2 p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={16} className="text-green-500" />
            <span className="text-sm">Audio message</span>
          </div>
          <audio controls className="w-full mb-2">
            <source src={signedUrl} type="audio/webm" />
            <source src={signedUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-1"
            >
              <Download size={14} />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    // Video rendering
    if (mediaType === 'video') {
      return (
        <div className="mt-2">
          <video 
            controls 
            className="max-w-xs rounded-lg shadow-sm"
            onError={(e) => {
              e.currentTarget.style.filter = 'blur(8px)';
              e.currentTarget.style.opacity = '0.5';
            }}
          >
            <source src={signedUrl} type="video/mp4" />
            <source src={signedUrl} type="video/webm" />
            Your browser does not support the video element.
          </video>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="flex items-center gap-1"
            >
              <Play size={14} />
              Play
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-1"
            >
              <Download size={14} />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    // File rendering (documents, etc.)
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border hover:bg-muted/80 transition-colors">
          <FileText size={16} className="text-muted-foreground" />
          <span className="text-sm truncate max-w-xs flex-1">
            {fileName || 'Document'}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleView}
            className="flex items-center gap-1"
          >
            <Eye size={14} />
            Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {displayedMessages.length < messageHistory.length && (
        <div className="flex justify-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadMoreMessages}
            disabled={loading}
            className="text-xs shadow-sm hover:bg-gray-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 mr-2"></div>
                Loading...
              </div>
            ) : (
              "Load older messages"
            )}
          </Button>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <Badge variant="outline" className="bg-white/80 text-gray-600 border-gray-200 shadow-sm">
          Conversation History
        </Badge>
      </div>

      <div ref={messagesStartRef} />

      <div className="space-y-6">
        {displayedMessages.map((msg) => {
          const isAgent = msg.sender.type === "ai" || msg.sender.type === "admin";
          const senderLabel = msg.senderTypeLabel || (isAgent ? "AI" : "User");
          
          return (
            <div key={msg.id} className="group">
              <div className={`flex items-start space-x-3 ${isAgent ? "flex-row-reverse space-x-reverse" : ""}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarImage 
                      src={msg.sender.thumbnail || msg.sender.avatar} 
                      alt={msg.sender.name}
                    />
                    <AvatarFallback
                      className={`${isAgent 
                        ? "bg-primary-100 text-primary-600" 
                        : "bg-gray-100 text-gray-600"
                      } text-xs font-semibold`}
                    >
                      {msg.sender.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Message Content */}
                <div className={`flex-1 max-w-[75%] ${isAgent ? "text-right" : ""}`}>
                  {/* Sender Info */}
                  <div className={`flex items-center mb-1 space-x-2 ${isAgent ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <span className="font-medium text-sm text-gray-900">
                      {msg.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(msg.time)}
                    </span>
                    {isAgent && (
                      <Badge className={`text-xs px-2 py-0.5 ${
                        msg.sender.type === 'admin' 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-primary-50 text-primary-700'
                      }`}>
                        {senderLabel}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`relative p-4 rounded-lg shadow-sm break-words ${
                      isAgent
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-white text-gray-900 rounded-tl-sm border border-gray-100"
                    }`}
                    style={{
                      direction: conversationDirection,
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {/* Message Text */}
                    {msg.message && (
                      <p 
                        className="whitespace-pre-wrap text-sm leading-relaxed"
                        style={{
                          fontFamily: isRTL
                            ? "'Cairo', 'Noto Sans Arabic', 'Arial', sans-serif"
                            : "'Inter', 'Segoe UI', 'Roboto', sans-serif",
                          fontSize: `${fontSize}px`,
                          lineHeight: '1.6',
                          fontWeight: '400',
                          direction: conversationDirection,
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      >
                        {msg.message}
                      </p>
                    )}

                    {/* Media Content */}
                    <MediaRenderer message={msg} />
                    
                    {/* Message Tail */}
                    <div
                      className={`absolute top-0 w-0 h-0 ${
                        isAgent
                          ? isRTL 
                            ? "left-0 border-r-[8px] border-r-primary border-t-[8px] border-t-transparent"
                            : "right-0 border-l-[8px] border-l-primary border-t-[8px] border-t-transparent"
                          : isRTL
                            ? "right-0 border-l-[8px] border-l-white border-t-[8px] border-t-transparent"
                            : "left-0 border-r-[8px] border-r-white border-t-[8px] border-t-transparent"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
