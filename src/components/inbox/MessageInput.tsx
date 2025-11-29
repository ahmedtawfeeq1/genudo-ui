
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileImage, FileText, FileVideo, Paperclip, Smile, Send, Mic, MicOff, X, Play, Pause, Trash2, Check, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/mock-db";
import { useAudioRecording } from "@/hooks/useAudioRecording";

interface MessageInputProps {
  onSendMessage?: (message: string, attachments?: File[]) => void;
  chatId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, chatId }) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    recordingDuration,
    audioRecording,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    clearRecording,
    formatDuration
  } = useAudioRecording();

  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "40px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [message]);

  // Reset success state after a delay
  useEffect(() => {
    if (sendSuccess) {
      const timer = setTimeout(() => setSendSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [sendSuccess]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: `File "${file.name}" is too large. Maximum size is 50MB.` };
    }

    // Check for potentially problematic file types
    const dangerousTypes = ['application/x-executable', 'application/x-msdownload'];
    if (dangerousTypes.includes(file.type)) {
      return { valid: false, error: `File type "${file.type}" is not supported for security reasons.` };
    }

    return { valid: true };
  };

  const handleFileSelect = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    switch (type) {
      case 'Image':
        input.accept = 'image/*';
        break;
      case 'Video':
        input.accept = 'video/*';
        break;
      case 'Document':
        input.accept = '.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx';
        break;
      default:
        input.accept = '*/*';
    }
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        // Validate each file
        const validFiles = [];
        const errors = [];

        for (const file of files) {
          const validation = validateFile(file);
          if (validation.valid) {
            validFiles.push(file);
          } else {
            errors.push(validation.error);
          }
        }

        // Show errors if any
        if (errors.length > 0) {
          errors.forEach(error => toast.error(error));
        }

        // Add valid files
        if (validFiles.length > 0) {
          setAttachments(prev => [...prev, ...validFiles]);
          toast.success(`${validFiles.length} file(s) selected successfully!`);
        }
      }
    };
    
    input.click();
    setShowAttachmentOptions(false);
  };

  const removeAttachment = (index: number) => {
    const removedFile = attachments[index];
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast.info(`"${removedFile.name}" removed from attachments`);
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      toast.info("🎙️ Recording started...", {
        duration: 1000,
      });
    } catch (error) {
      toast.error("Unable to start recording. Please check your microphone permissions and try again.");
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast.success("🎵 Recording completed! You can preview it below.", {
      duration: 2000,
    });
  };

  const simulateProgress = () => null;

  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0 && !audioRecording) || isRecording || isSending) return;

    if (!chatId) {
      toast.error("Unable to send message. Please select a conversation first.");
      return;
    }

    setIsSending(true);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      
      if (message.trim()) {
        formData.append('message', message.trim());
      }

      // Add regular file attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      // Add audio recording as attachment if exists
      if (audioRecording) {
        const audioFile = new File([audioRecording.blob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm'
        });
        formData.append('attachments', audioFile);
      }

      const response = await db.functions.invoke('inbox-send-message', {
        body: formData
      });

      // Complete the progress
      if (progressInterval) clearInterval(progressInterval as any);

      if (response.error) {
        throw new Error('We couldn’t send your message right now. Please try again in a moment or contact the admin.');
      }

      if (!response.data?.success) {
        const errorMessage = response.data?.userMessage || 'We couldn’t send your message right now. Please try again in a moment or contact the admin.';
        throw new Error(errorMessage);
      }

      // Success - clear the form
      setMessage("");
      setAttachments([]);
      clearRecording();
      setSendSuccess(true);
      setUploadProgress(0);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }

      // Show user-friendly success message from backend
      const successMessage = response.data?.userMessage || "Message sent successfully!";
      toast.success(successMessage, {
        duration: 2000,
      });

      // Notify parent component if callback provided
      if (onSendMessage) {
        const allAttachments = [...attachments];
        if (audioRecording) {
          const audioFile = new File([audioRecording.blob], `voice-${Date.now()}.webm`, {
            type: 'audio/webm'
          });
          allAttachments.push(audioFile);
        }
        onSendMessage(message.trim(), allAttachments.length > 0 ? allAttachments : undefined);
      }

    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval as any);
      
      console.error('Error sending message:', error);
      
      // Show user-friendly error message
      const errorMessage = 'We couldn’t send your message right now. Please try again in a moment or contact the admin.';
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsSending(false);
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <FileImage size={16} className="text-blue-500" />;
    if (type.startsWith('video/')) return <FileVideo size={16} className="text-purple-500" />;
    if (type.startsWith('audio/')) return <FileText size={16} className="text-green-500" />;
    return <FileText size={16} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasContent = message.trim() || attachments.length > 0 || audioRecording;

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      <div className="flex flex-col">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                📎 {attachments.length} file(s) ready to send
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded border shadow-sm">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Audio Recording Preview */}
        {audioRecording && (
          <div className="mb-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="flex flex-col">
                  <div className="text-sm font-semibold text-purple-900">🎵 Voice Message Ready</div>
                  <div className="text-xs text-purple-700">
                    Duration: {formatDuration(audioRecording.duration)}
                  </div>
                </div>
              </div>
              <div className="flex-1" />
              <button
                onClick={clearRecording}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                title="Delete recording"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {false && (
          <div />
        )}

        <div className="border border-gray-200 rounded-lg p-3 mb-2 focus-within:border-primary transition-colors">
          <Textarea
            ref={textareaRef}
            placeholder={isRecording ? `🎙️ Recording... ${formatDuration(recordingDuration)}` : "Write a message..."}
            className="w-full min-h-[40px] max-h-[200px] resize-none outline-none p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={isRecording ? "" : message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            disabled={isRecording || isSending}
            rows={1}
          />
          
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    disabled={isRecording || isSending}
                    title="Add emoji"
                  >
                    <Smile size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      "😀", "😊", "🙂", "😍", "😎", "🤔", "😂", "🥳",
                      "👍", "👋", "❤️", "🙏", "🔥", "⭐", "💯", "✅",
                    ].map((emoji) => (
                      <button
                        key={emoji}
                        className="text-lg p-1 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => setMessage((prev) => prev + emoji)}
                        disabled={isRecording || isSending}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              className={`px-6 py-2 transition-all ${
                sendSuccess 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                  : 'bg-primary hover:bg-primary-600 text-white'
              }`}
              disabled={!hasContent || isRecording || isSending}
              onClick={handleSendMessage}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                  Sending...
                </>
              ) : sendSuccess ? (
                <>
                  <Check size={16} className="mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            // Validate each file
            const validFiles = [];
            const errors = [];

            for (const file of files) {
              const validation = validateFile(file);
              if (validation.valid) {
                validFiles.push(file);
              } else {
                errors.push(validation.error);
              }
            }

            // Show errors if any
            if (errors.length > 0) {
              errors.forEach(error => toast.error(error));
            }

            // Add valid files
            if (validFiles.length > 0) {
              setAttachments(prev => [...prev, ...validFiles]);
              toast.success(`${validFiles.length} file(s) selected successfully!`);
            }
          }
        }}
      />
    </div>
  );
};

export default MessageInput;
