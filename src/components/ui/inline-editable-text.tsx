import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  textClassName?: string;
  maxLength?: number;
  disabled?: boolean;
  showEditIcon?: boolean;
  editIconSize?: 'sm' | 'md' | 'lg';
  variant?: 'title' | 'description' | 'text';
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onSave,
  placeholder = "Click to edit...",
  multiline = false,
  className,
  textClassName,
  maxLength,
  disabled = false,
  showEditIcon = false,
  editIconSize = 'sm',
  variant = 'text'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      const element = multiline ? textareaRef.current : inputRef.current;
      if (element) {
        element.focus();
        element.select();
      }
    }
  }, [isEditing, multiline]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      // Revert to original value on error
      setEditValue(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur if there are changes
    if (editValue.trim() !== value.trim() && editValue.trim()) {
      handleSave();
    } else {
      handleCancel();
    }
  };

  const getTextSizeClass = () => {
    switch (variant) {
      case 'title':
        return 'text-xl md:text-2xl lg:text-3xl font-bold';
      case 'description':
        return 'text-sm md:text-base text-gray-600';
      default:
        return 'text-base';
    }
  };

  const getEditIconSize = () => {
    switch (editIconSize) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-3 w-3';
    }
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        {multiline ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            maxLength={maxLength}
            disabled={isLoading}
            rows={3}
            className={cn(
              "focus:ring-2 focus:ring-blue-400 focus:border-blue-400 border-2 border-blue-300 min-h-[80px] resize-none transition-all duration-200",
              variant === 'title' && "text-xl md:text-2xl lg:text-3xl font-bold",
              variant === 'description' && "text-sm md:text-base",
              isLoading && "opacity-70"
            )}
            placeholder={placeholder}
          />
        ) : (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            maxLength={maxLength}
            disabled={isLoading}
            className={cn(
              "focus:ring-2 focus:ring-blue-400 focus:border-blue-400 border-2 border-blue-300 transition-all duration-200",
              variant === 'title' && "text-xl md:text-2xl lg:text-3xl font-bold",
              variant === 'description' && "text-sm md:text-base",
              isLoading && "opacity-70"
            )}
            placeholder={placeholder}
          />
        )}
        {(multiline || isLoading) && (
          <div className="text-xs text-gray-500 flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            )}
            {!isLoading && multiline && (
              <span>Press Cmd+Enter to save, Escape to cancel</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-md transition-all duration-200",
        !disabled && "hover:bg-blue-50 hover:ring-1 hover:ring-blue-200 px-2 py-1",
        className
      )}
      onClick={handleStartEdit}
    >
      <div className={cn(
        getTextSizeClass(),
        textClassName,
        !value && "text-gray-400 italic"
      )}>
        {value || placeholder}
      </div>
      
      {showEditIcon && !disabled && (
        <Edit2 
          className={cn(
            getEditIconSize(),
            "absolute top-1 right-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
        />
      )}
      
      {!value && !disabled && (
        <div className="text-xs text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Click to add {variant === 'title' ? 'title' : variant === 'description' ? 'description' : 'text'}
        </div>
      )}
    </div>
  );
};

export default InlineEditableText;