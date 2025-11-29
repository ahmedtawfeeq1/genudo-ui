
import React, { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onTagsChange, 
  placeholder = "Add tags...",
  className = "" 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().replace(/,/g, ''); // Remove commas and trim
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className={`flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-[44px] bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all ${className}`}>
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
          <span className="text-sm">{tag}</span>
          <X 
            className="h-3 w-3 cursor-pointer hover:text-blue-900" 
            onClick={() => removeTag(index)}
          />
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="border-none shadow-none flex-1 min-w-[120px] h-auto p-0 focus-visible:ring-0 bg-transparent"
      />
    </div>
  );
};

export default TagInput;
