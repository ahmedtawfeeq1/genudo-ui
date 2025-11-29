import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from "@/lib/mock-db";
import { toast } from 'sonner';
import TagInput from '@/components/ui/tag-input';
import { Tag } from 'lucide-react';

interface OpportunityTagsSectionProps {
  opportunityId: string | null;
  initialTags: string[];
  conversationId: string;
}

const OpportunityTagsSection: React.FC<OpportunityTagsSectionProps> = ({
  opportunityId,
  initialTags,
  conversationId,
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const queryClient = useQueryClient();

  // Update local state when initialTags change
  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const updateTagsMutation = useMutation({
    mutationFn: async (newTags: string[]) => {
      if (!opportunityId) throw new Error('No opportunity ID');
      await new Promise(res => setTimeout(res, 150));
      return newTags;
    },
    onSuccess: (newTags) => {
      // Invalidate and refetch inbox conversations to update the tags display
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
      toast.success('Tags updated successfully');
    },
    onError: (error) => {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
      // Revert to initial tags on error
      setTags(initialTags);
    },
  });

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    // Auto-save on change
    updateTagsMutation.mutate(newTags);
  };

  if (!opportunityId) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-3">
        <Tag size={16} className="text-gray-400" />
        <h3 className="font-medium text-gray-900">Opportunity Tags</h3>
      </div>

      <div className="max-h-[80px] overflow-y-auto">
        <TagInput
          tags={tags}
          onTagsChange={handleTagsChange}
          placeholder="Add tags..."
        />
      </div>
    </div>
  );
};

export default OpportunityTagsSection;
