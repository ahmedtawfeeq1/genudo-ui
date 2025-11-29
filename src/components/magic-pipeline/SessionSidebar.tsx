import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Clock,
  Loader2 
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionManager';
import DeleteSessionDialog from './DeleteSessionDialog';

interface SessionSidebarProps {
  sessions: SessionData[];
  isLoading: boolean;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => Promise<boolean>;
  currentSessionId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  isLoading,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  currentSessionId,
  collapsed,
  onToggleCollapse
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    sessionId: string | null;
    sessionName: string | null;
  }>({
    isOpen: false,
    sessionId: null,
    sessionName: null,
  });

  // Resizable functionality
  const [width, setWidth] = useState(300); // Default 600px
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    mouseDownEvent.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
        if (newWidth >= 300 && newWidth <= 400) { // Min 300px, Max 800px
          setWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [resize, stopResizing, isResizing]);

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string, sessionName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDeleteDialog({
      isOpen: true,
      sessionId,
      sessionName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.sessionId) {
      await onDeleteSession(deleteDialog.sessionId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      sessionId: null,
      sessionName: null,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <div 
        ref={sidebarRef}
        className="relative bg-white border-r border-gray-200 shadow-lg h-full transition-all duration-300"
        style={{ width: collapsed ? '48px' : `${width}px` }}
      >
        <Card className="h-full rounded-none border-0 shadow-none flex flex-col">
          <CardHeader className="px-3 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  AI Conversations
                </CardTitle>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {!collapsed && (
              <Button
                onClick={onNewSession}
                className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 h-9"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0 flex-1 min-h-0">
            {collapsed ? (
              <div className="flex flex-col items-center py-4 gap-3">
                <Button
                  onClick={onNewSession}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                  title="New Conversation"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                </Button>
                <div className="w-6 h-px bg-gray-200" />
                <div className="text-xs text-gray-400 writing-mode-vertical">
                  {sessions.length}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-3 space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-1">No conversations yet</p>
                      <p className="text-xs text-gray-400">Start your first AI conversation</p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => onSessionSelect(session.id)}
                        className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          currentSessionId === session.id
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                                {session.session_name || 'Unnamed Conversation'}
                              </h3>
                              {currentSessionId === session.id && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 flex-shrink-0">
                                  Active
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{formatTimestamp(session.updated_at)}</span>
                              <span>•</span>
                              <span className="flex-shrink-0">{session.message_count || 0} messages</span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, session.id, session.session_name)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Resize Handle */}
        {!collapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 hover:w-2 transition-all duration-150 bg-transparent"
            onMouseDown={startResizing}
            title="Drag to resize"
          />
        )}
      </div>

      {/* Custom Delete Dialog */}
      <DeleteSessionDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        sessionName={deleteDialog.sessionName || undefined}
      />
    </>
  );
};

export default SessionSidebar;