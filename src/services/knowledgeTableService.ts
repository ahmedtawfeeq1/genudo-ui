import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
 
import { uploadFileToLoopXConsole } from './loopxConsoleService';

/**
 * Parse uploaded Excel file and extract columns + header-keyed row objects
 */
export async function parseExcelFile(file: File): Promise<{
  columns: string[];
  rows: Record<string, any>[];
}> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const raw = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true }) as Record<string, any>[];
  if (!raw || raw.length === 0) return { columns: [], rows: [] };

  // Extract and normalize header names from the first row keys
  const firstRow = raw[0];
  const columns = Object.keys(firstRow).map((k) => String(k).trim());

  // Normalize each row to include all headers with defaults
  const rows = raw.map((rowObj) => {
    const out: Record<string, any> = {};
    columns.forEach((name) => {
      const val = rowObj[name] ?? rowObj[name + ' '] ?? '';
      out[name] = val;
    });
    return out;
  });

  return { columns, rows };
}

/**
 * Convert UI-friendly name to DB format
 * "General Info" → "general_info"
 */
export function toDbFormat(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

export interface ColumnConfig {
  name: string;
  is_indexed: boolean;
  type: 'string' | 'integer';
  filterable: boolean;
  column_use: string;
}

export interface RowData {
  id: string;
  data: Record<string, any>;
}

/**
 * Generate formatted Excel for Loop-X training
 * Format:
 * Row 1: "source_settings"
 * Row 2: "source_name" | {source_name_db}
 * Row 3: "source_use" | {source_use}
 * Row 4: "indexed_columns" | col1_name | col2_name | ...
 * Row 5: "retrieved_cols" | col1_name,col2_name | ... (Answer With columns)
 * Row 6: "filteration_rules" | nonfilterable | filterable | ...
 * Row 7: "column_type" | string | integer | ...
 * Row 8: "column_use" | "the question" | "the answer" | ...
 * Row 9: "default_id" | col1_name | col2_name | ...
 * Row 10+: {uuid} | value1 | value2 | ...
 */
export async function generateFormattedExcel(
  sourceNameDb: string,
  sourceUse: string,
  columns: ColumnConfig[],
  rows: RowData[],
  answerWithColumns?: string[] // New parameter for Answer With columns
): Promise<Blob> {
  const workbook = XLSX.utils.book_new();
  const sheetData: any[][] = [];
  
  // Columns
  const indexedColumns = columns.filter(c => c.is_indexed);
  const allColumns = columns;
  const allNormalized = allColumns.map(c => toDbFormat(c.name));
  
  // Row 1: source_settings header
  sheetData.push(['source_settings']);
  
  // Row 2: source_name
  sheetData.push(['source_name', sourceNameDb]);
  
  // Row 3: source_use
  sheetData.push(['source_use', sourceUse]);
  
  // Row 4: indexed_columns with column names (comma-separated in single cell)
  sheetData.push([
    'indexed_columns',
    indexedColumns.map(c => toDbFormat(c.name)).join(',')
  ]);
  
  // Row 5: retrieved_columns (Answer With columns - comma-separated in single cell)
  const answerWithColNames = answerWithColumns || [];
  sheetData.push([
    'retrieved_columns',
    answerWithColNames.map(n => toDbFormat(n)).join(',')
  ]);
  
  // Row 6: filteration_rules (ALL columns)
  sheetData.push([
    'filteration_rules',
    ...allColumns.map(c => c.filterable ? 'filterable' : 'nonfilterable')
  ]);
  
  // Row 7: column_type (ALL columns)
  sheetData.push([
    'column_type',
    ...allColumns.map(c => c.type)
  ]);
  
  // Row 8: column_use (ALL columns) with defensive fallback
  const friendlyUse = (name: string) => {
    const cleaned = name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[\/_\-.]+/g, ' ')
      .replace(/[^a-zA-Z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const titled = cleaned
      .split(' ')
      .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ');
    return `the ${titled || name}`;
  };
  sheetData.push([
    'column_use',
    ...allColumns.map(c => {
      const v = (c.column_use || '').trim();
      return v || friendlyUse(c.name);
    })
  ]);
  
  // Row 9: default_id with ALL normalized column names
  sheetData.push([
    'default_id',
    ...allNormalized
  ]);
  
  // Row 10+: Data rows with UUIDs for ALL columns
  rows.forEach(row => {
    const values = allColumns.map(col => {
      const raw = row.data[col.name] ?? '';
      const str = String(raw);
      return str
        .replace(/_x000d_/g, '')
        .replace(/\r\n?|\n/g, "\\n\\n");
    });
    sheetData.push([row.id, ...values]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Generate as buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * Upload formatted Excel to Loop-X Console
 */
export async function uploadFormattedExcel(
  blob: Blob,
  userId: string,
  agentId: string,
  tableNameDb: string,
  twinExternalId: string
): Promise<{ filePath: string; publicUrl: string }> {
  const timestamp = Date.now();
  const fileName = `formatted_${tableNameDb}_${timestamp}.xlsx`;
  
  // Convert blob to file
  const file = new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  // Upload to Loop-X console
  // The twin token is handled server-side in the Edge Function
  const uploadResponse = await uploadFileToLoopXConsole(
    file,
    twinExternalId,
    '' // Token is handled server-side
  );
  
  return { 
    filePath: uploadResponse.short_path, 
    publicUrl: uploadResponse.path 
  };
}

/**
 * Create knowledge table record in database
 */
export async function createKnowledgeTable(params: {
  agentId: string;
  sourceNameDisplay: string;
  sourceNameDb: string;
  sourceUse: string;
  columns: ColumnConfig[];
  rowsData: any[];
  originalFilePath: string;
  formattedFilePath: string;
  formattedPublicUrl: string;
  originalFileSize: number;
  originalConsoleData?: any; // Console response data for original file
  formattedConsoleData?: any; // Console response data for formatted file
  answerWithColumns?: string[]; // Answer With columns to persist in metadata
}): Promise<string> {
  const user = { id: 'user-static' } as any;

  // Generate rows with UUIDs (for formatted Excel only)
  const rows: RowData[] = params.rowsData.map((row) => {
    const dataObj: Record<string, any> = {};
    params.columns.forEach((col, idx) => {
      if (Array.isArray(row)) {
        dataObj[col.name] = row[idx];
      } else {
        dataObj[col.name] = (row && typeof row === 'object') ? row[col.name] : '';
      }
    });
    return { id: uuidv4(), data: dataObj };
  });

  // Organized metadata with explicit retrieved_column_names and URLs
  const metadata = {
    // 1–3: source identifiers
    source_name_display: params.sourceNameDisplay,
    source_name_db: params.sourceNameDb,
    source_use: params.sourceUse,
    // 4–5: totals
    total_columns: params.columns.length,
    total_rows: rows.length,
    // 6: full columns definition
    columns: params.columns.map((c) => ({
      name: c.name,
      db_name: toDbFormat(c.name),
      type: c.type,
      column_use: c.column_use,
    })),
    // 7–9: normalized sets
    indexed_column_names: params.columns.filter(c => c.is_indexed).map(c => toDbFormat(c.name)),
    retrieved_column_names: (params.answerWithColumns || []).map(n => toDbFormat(n)),
    filterable_column_names: params.columns.filter(c => c.filterable).map(c => toDbFormat(c.name)),
    // 12–13: console payloads
    original_file: params.originalConsoleData ? {
      path: params.originalConsoleData.path,
      short_path: params.originalConsoleData.short_path,
      extension: params.originalConsoleData.extension,
      size: params.originalConsoleData.size,
      console_id: params.originalConsoleData.id,
      twin_id: params.originalConsoleData.twin_id,
      created_at: params.originalConsoleData.created_at,
      updated_at: params.originalConsoleData.updated_at,
    } : undefined,
    formatted_file: params.formattedConsoleData ? {
      path: params.formattedConsoleData.path,
      short_path: params.formattedConsoleData.short_path,
      extension: params.formattedConsoleData.extension,
      size: params.formattedConsoleData.size,
      console_id: params.formattedConsoleData.id,
      twin_id: params.formattedConsoleData.twin_id,
      created_at: params.formattedConsoleData.created_at,
      updated_at: params.formattedConsoleData.updated_at,
    } : undefined,
  };

  // Static mode: return a generated id without persistence
  await new Promise(res => setTimeout(res, 100));
  return `kf-${Date.now()}`;
}
