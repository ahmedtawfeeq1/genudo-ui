
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, FileText, X, Edit2 } from "lucide-react";
import { type InboxNote } from "@/hooks/useInboxData";

export interface NoteAuthor {
  name: string;
  initials: string;
}

export interface Note {
  id: string;
  author: NoteAuthor;
  content: string;
  createdAt: string;
}

interface NotesSectionProps {
  notes: InboxNote[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>; // Legacy prop, not used
  isLoadingNotes: boolean;
  onAddNote?: (content: string) => Promise<void>;
  isAddingNote?: boolean;
  onUpdateNote?: (noteId: string, content: string) => Promise<void>;
  isUpdatingNote?: boolean;
  onDeleteNote?: (noteId: string) => Promise<void>;
  isDeletingNote?: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  setNotes, // Not used, kept for compatibility
  isLoadingNotes,
  onAddNote,
  isAddingNote = false,
  onUpdateNote,
  isUpdatingNote = false,
  onDeleteNote,
  isDeletingNote = false,
}) => {
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const addNote = async () => {
    if (newNoteContent.trim().length === 0) return;

    if (onAddNote) {
      try {
        await onAddNote(newNoteContent);
        setNewNoteContent("");
        setShowAddNote(false); // Close the form after adding
      } catch (error) {
        console.error('Error adding note:', error);
        // Error is handled in the parent component
      }
    } else {
      // Legacy behavior for backward compatibility
      const newNote: Note = {
        id: `note-${Date.now()}`,
        author: { name: "You", initials: "YO" },
        content: newNoteContent,
        createdAt: "Just now",
      };

      // This won't work with the new type but kept for compatibility
      // setNotes([...notes as Note[], newNote]);
      setNewNoteContent("");
      setShowAddNote(false); // Close the form after adding
    }
  };

  const startEditing = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingContent(content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const saveEdit = async (noteId: string) => {
    if (editingContent.trim().length === 0 || !onUpdateNote) return;

    try {
      await onUpdateNote(noteId, editingContent);
      setEditingNoteId(null);
      setEditingContent("");
    } catch (error) {
      console.error('Error updating note:', error);
      // Error is handled in the parent component
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!onDeleteNote) return;

    try {
      await onDeleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      // Error is handled in the parent component
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-gray-400" />
          <h3 className="font-medium text-gray-900">Notes</h3>
        </div>
        {!showAddNote && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowAddNote(true)}
          >
            <PlusCircle size={16} className="text-gray-600" />
          </Button>
        )}
      </div>

      {showAddNote && (
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Add a note..."
            className="resize-none"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            disabled={isAddingNote}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={addNote}
              disabled={newNoteContent.trim().length === 0 || isAddingNote}
            >
              <PlusCircle size={16} className="mr-2" />
              {isAddingNote ? "Adding..." : "Add Note"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddNote(false);
                setNewNoteContent("");
              }}
              disabled={isAddingNote}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {isLoadingNotes ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md text-sm">
            No notes yet
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-gray-50 rounded-md overflow-hidden group relative"
            >
              {editingNoteId === note.id ? (
                // Edit mode
                <div className="space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="resize-none"
                    disabled={isUpdatingNote}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(note.id)}
                      disabled={editingContent.trim().length === 0 || isUpdatingNote}
                    >
                      {isUpdatingNote ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditing}
                      disabled={isUpdatingNote}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{note.author.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{note.createdAt}</span>
                      {/* Edit and Delete buttons - visible on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => startEditing(note.id, note.content)}
                          disabled={isDeletingNote || isUpdatingNote}
                        >
                          <Edit2 size={12} className="text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteNote(note.id)}
                          disabled={isDeletingNote || isUpdatingNote}
                        >
                          <X size={14} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;
