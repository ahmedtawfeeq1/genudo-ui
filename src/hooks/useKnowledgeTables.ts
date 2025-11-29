import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  parseExcelFile,
  toDbFormat,
  generateFormattedExcel,
  uploadFormattedExcel,
  createKnowledgeTable,
  type ColumnConfig,
  type RowData
} from '@/services/knowledgeTableService';
import { trainStructuredTables, fetchKnowledgeFiles, deleteKnowledgeFile } from '@/services/agentService';
import { deleteKnowledgeSource } from '@/services/tableDataService';
import { db } from "@/lib/mock-db";
import { uploadFileToLoopXConsole } from '@/services/loopxConsoleService';

/**
 * Fetch all structured tables for an agent
 */
export function useKnowledgeTables(agentId: string) {
  return useQuery({
    queryKey: ['knowledge-tables', agentId],
    queryFn: async () => {
      const files = await fetchKnowledgeFiles(agentId);
      return files.filter((f: any) => f.file_type === 'structured_table');
    },
    enabled: !!agentId
  });
}

/**
 * Create a new knowledge table
 */
export function useCreateKnowledgeTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      sourceNameDisplay: string;
      sourceUse: string;
      columns: ColumnConfig[];
      excelFile: File;
      rowsData: any[][];
      answerWithColumns?: string[];
    }) => {
      const user = (await db.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');
      
      // Convert source name to DB format
      const sourceNameDb = toDbFormat(params.sourceNameDisplay);
      
      // Validate limits
      const maxRows = 5000;
      const maxColumns = 50;
      
      if (params.rowsData.length > maxRows) {
        throw new Error(`Maximum ${maxRows} rows allowed. Your file has ${params.rowsData.length} rows.`);
      }
      
      if (params.columns.length > maxColumns) {
        throw new Error(`Maximum ${maxColumns} columns allowed. Your file has ${params.columns.length} columns.`);
      }
      
      // Static twin ID for UI-only mode
      const twinExternalId = `twin-${params.agentId}`;

      // The twin token is handled server-side in the Edge Function

      // Upload original Excel to Loop-X console
      const originalFile = new File([params.excelFile], params.excelFile.name, {
        type: params.excelFile.type
      });

      const originalUploadResponse = await uploadFileToLoopXConsole(originalFile, twinExternalId, '');
      
      // Generate rows with UUIDs (support both array-of-arrays and array-of-objects)
      const rows: RowData[] = params.rowsData.map((row: any) => {
        const dataObj: Record<string, any> = {};
        params.columns.forEach((col, idx) => {
          if (Array.isArray(row)) {
            dataObj[col.name] = row[idx];
          } else if (row && typeof row === 'object') {
            const exact = row[col.name];
            const normKey = toDbFormat(col.name);
            const fallback = row[normKey];
            dataObj[col.name] = exact ?? fallback ?? '';
          } else {
            dataObj[col.name] = '';
          }
        });
        return {
          id: uuidv4(),
          data: dataObj
        };
      });
      
      // Generate formatted Excel
      const formattedBlob = await generateFormattedExcel(
        sourceNameDb,
        params.sourceUse,
        params.columns,
        rows,
        params.answerWithColumns // Pass the Answer With columns
      );
      
      // Upload formatted Excel to Loop-X console
      const timestamp = Date.now();
      const formattedFileName = `formatted_${sourceNameDb}_${timestamp}.xlsx`;
      const formattedFile = new File([formattedBlob], formattedFileName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const formattedUploadResponse = await uploadFileToLoopXConsole(formattedFile, twinExternalId, '');
      
      // Create database record
      const tableId = await createKnowledgeTable({
        agentId: params.agentId,
        sourceNameDisplay: params.sourceNameDisplay,
        sourceNameDb: sourceNameDb,
        sourceUse: params.sourceUse,
        columns: params.columns,
        rowsData: params.rowsData,
        originalFilePath: originalUploadResponse.path,
        formattedFilePath: formattedUploadResponse.short_path,
        formattedPublicUrl: formattedUploadResponse.path,
        originalFileSize: params.excelFile.size,
        originalConsoleData: originalUploadResponse,
        formattedConsoleData: formattedUploadResponse,
        answerWithColumns: params.answerWithColumns
      });
      
      return tableId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['knowledge-tables', variables.agentId] 
      });
      toast.success('Knowledge table created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create table: ${error.message}`);
    }
  });
}

/**
 * Train structured tables
 */
export function useTrainStructuredTables() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      tableIds: string[];
    }) => {
      await trainStructuredTables(params.agentId, params.tableIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['knowledge-tables', variables.agentId] 
      });
      toast.success('Training started successfully');
    },
    onError: (error) => {
      toast.error(`Training failed: ${error.message}`);
    }
  });
}

/**
 * Delete knowledge table
 */
export function useDeleteKnowledgeTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      tableId: string;
    }) => {
      // Delete source via v2 API
      await deleteKnowledgeSource(params.tableId);
      // Then delete from static store
      await deleteKnowledgeFile(params.tableId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['knowledge-tables', variables.agentId] 
      });
      toast.success('Table deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    }
  });
}
