import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { KnowledgeFile } from "@/types/agent";
import { 
  fetchKnowledgeFiles, 
  uploadKnowledgeFile, 
  deleteKnowledgeFile 
} from "@/services/agentService";
import {
  createUrlKnowledgeFile,
  createQAKnowledgeFile,
  createBulkQAKnowledgeFiles,
  updateKnowledgeFile
} from "@/services/agentKnowledgeService";

/**
 * Hook to fetch knowledge files for an agent
 */
export const useKnowledgeFiles = (agentId: string | undefined) => {
  return useQuery({
    queryKey: ["knowledgeFiles", agentId],
    queryFn: () => fetchKnowledgeFiles(agentId!),
    enabled: !!agentId,
  });
};

/**
 * Hook to upload a file-type knowledge file
 */
export const useUploadKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, file }: { agentId: string; file: File }) => {
      // Determine file type from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      let fileType: "excel" | "markdown" | "text" = "excel";
      
      if (ext === 'md') fileType = "markdown";
      else if (ext === 'txt') fileType = "text";
      else if (ext === 'xlsx' || ext === 'xls') fileType = "excel";
      
      return uploadKnowledgeFile(agentId, file, fileType);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeFiles", variables.agentId] });
      toast.success("File uploaded successfully");
    },
    onError: (error: any) => {
      const msg = String(error?.message || error);
      if (msg.includes("You don't have permission")) {
        toast.error("You don't have permission to add files for this agent.");
      } else if (msg.toLowerCase().includes("row-level security")) {
        toast.error("Permission denied by security policy. Make sure you own this agent and try again.");
      } else {
        toast.error(`Failed to upload file: ${msg}`);
      }
    },
  });
};

/**
 * Hook to create a URL-type knowledge file
 */
export const useCreateUrlKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, url, name }: { agentId: string; url: string; name?: string }) =>
      createUrlKnowledgeFile(agentId, url, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeFiles", variables.agentId] });
      toast.success("URL added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add URL: ${error.message}`);
    },
  });
};

/**
 * Hook to create a Q&A-type knowledge file
 */
export const useCreateQAKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, question, answer }: { agentId: string; question: string; answer: string }) =>
      createQAKnowledgeFile(agentId, question, answer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeFiles", variables.agentId] });
      toast.success("Q&A pair added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add Q&A pair: ${error.message}`);
    },
  });
};

/**
 * Hook to create bulk Q&A-type knowledge files
 */
export const useCreateBulkQAKnowledgeFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      agentId, 
      qaPairs 
    }: { 
      agentId: string; 
      qaPairs: Array<{ question: string; answer: string }> 
    }) => createBulkQAKnowledgeFiles(agentId, qaPairs),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeFiles", variables.agentId] });
      toast.success(`${variables.qaPairs.length} Q&A pairs added successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add Q&A pairs: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a knowledge file
 */
export const useDeleteKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, agentId }: { fileId: string; agentId: string }) =>
      deleteKnowledgeFile(fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeFiles", variables.agentId] });
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete file: ${error.message}`);
    },
  });
};

/**
 * Hook to update a knowledge file
 */
export const useUpdateKnowledgeFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      fileId, 
      agentId,
      updates 
    }: { 
      fileId: string;
      agentId: string;
      updates: Partial<Pick<KnowledgeFile, "file_name" | "file_url" | "status" | "metadata">>
    }) => updateKnowledgeFile(fileId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeFiles", variables.agentId] });
      toast.success("File updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update file: ${error.message}`);
    },
  });
};
