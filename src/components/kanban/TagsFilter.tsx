import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TagsFilterProps {
  opportunities: any[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({
  opportunities,
  selectedTags,
  onTagsChange
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Extract unique tags from opportunities
  useEffect(() => {
    const tagsSet = new Set<string>();
    opportunities.forEach(opp => {
      if (opp.tags) {
        // Split comma-separated tags and trim whitespace
        const tags = opp.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        tags.forEach((tag: string) => tagsSet.add(tag));
      }
    });
    setAvailableTags(Array.from(tagsSet).sort());
  }, [opportunities]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative shadow-sm">
          <Filter className="h-4 w-4" />
          {selectedTags.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter by Tags</h4>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
          
          {availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags available</p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {availableTags.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagsFilter;
