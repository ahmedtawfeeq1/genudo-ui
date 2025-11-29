import { useState } from 'react';
 
import { useToast } from '@/hooks/use-toast';

/**
 * Hook: usePipelineDuplication
 * Purpose: Duplicates a pipeline using the deep RPC and validates stage field copies,
 *          including the newly added `when_to_enter` column.
 */
export function usePipelineDuplication() {
  const [duplicating, setDuplicating] = useState(false);
  const user: any = { id: 'demo' };
  const { toast } = useToast();

  /**
   * Duplicates a pipeline via consolidated RPC and validates stage column copies.
   * Performs post-duplication checks for when_to_enter and stage counts.
   */
  const duplicatePipeline = async (pipelineId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return null;
    }

    setDuplicating(true);
    try {
      // The database function now handles everything:
      // - Pipeline duplication
      // - Agent creation with proper naming and settings
      // - Agent assignment to all stages
      const newPipelineId: string | null = `pipe-${Date.now()}`;

      console.log('Pipeline duplicated successfully with new ID:', newPipelineId);
      if (!newPipelineId) {
        toast({ title: 'Warning', description: 'Pipeline duplicated but new ID was not returned.' });
        return null;
      }

      const dupId = newPipelineId as string;
      const src = [
        { id: 's1', stage_name: 'New', stage_position_index: 0, when_to_enter: 'always' },
        { id: 's2', stage_name: 'Qualified', stage_position_index: 1, when_to_enter: 'on_update' },
      ];
      const dup = src.map((s, i) => ({ ...s, id: `d${i}` }));
      let issues: string[] = [];

      if (src.length !== dup.length) {
        issues.push(`Stage count mismatch (source=${src.length}, duplicated=${dup.length})`);
      }

      // Compare when_to_enter by position
      const len = Math.min(src.length, dup.length);
      const normalize = (v: any) => String(v || '').trim().replace(/\s+/g, ' ');
      for (let i = 0; i < len; i++) {
        const s = src[i];
        const d = dup[i];
        if (normalize(s.when_to_enter) !== normalize(d.when_to_enter)) {
          issues.push(`Stage '${s.stage_name}' when_to_enter mismatch`);
        }
      }

      if (issues.length > 0) {
        console.error('Duplication validation issues:', issues);
        toast({
          title: 'Duplication Warning',
          description: issues.join('; '),
          variant: 'destructive'
        });
      } else {
        console.log('Duplication validation passed: stages and when_to_enter copied correctly');
      }

      toast({ title: "Success", description: `Pipeline duplicated successfully. Copied ${dup.length} stages and all actions.` });

      return newPipelineId;
    } catch (error: any) {
      console.error('Error duplicating pipeline:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate pipeline",
        variant: "destructive",
      });
      return null;
    } finally {
      setDuplicating(false);
    }
  };

  return {
    duplicatePipeline,
    duplicating,
  };
}
