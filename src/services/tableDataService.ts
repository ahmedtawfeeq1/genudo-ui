 

// Static context cache to avoid DB lookups
const tableContext: Record<string, { sourceName: string; twinId: string }> = {};

export function setTableContext(tableId: string, sourceName: string, twinId: string) {
  tableContext[tableId] = { sourceName, twinId };
}

export interface TableDataPoint {
  id: string | number;
  table_id: string;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface TableDataResponse {
  data: TableDataPoint[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Retrieve data points from a table using v2 API
 */
export async function retrieveTableData(
  tableId: string,
  page: number = 1,
  pageSize: number = 100,
  search?: string
): Promise<TableDataResponse> {
  const ctx = tableContext[tableId];
  if (!ctx) return { data: [], total: 0, page, pageSize };
  return { data: [], total: 0, page, pageSize };
}

/**
 * Upsert (insert or update) data points in a table using v2 API
 */
export async function upsertTableData(
  tableId: string,
  dataPoints: TableDataPoint[]
): Promise<{ success: boolean; count: number }> {
  return { success: true, count: dataPoints.length };
}

/**
 * Delete data points from a table using v2 API
 */
export async function deleteTableData(
  tableId: string,
  dataPointIds: Array<string | number>
): Promise<{ success: boolean; count: number }> {
  return { success: true, count: dataPointIds.length };
}

/**
 * Retrieve table data from Qdrant scroll API by source name
 * Uses pagination with 100 points per page
 */
/**
 * Retrieve table data from LoopX v2 scroll-knowledge-points by source name
 * Returns rows and next_page_offset for pagination
 */
export async function retrieveTableDataFromLoopXScroll(
  sourceName: string,
  twinId: string,
  pageOffset: number | null = null,
  limit: number = 100
): Promise<{
  columns: string[];
  rows: Array<{ id: number;[key: string]: any }>;
  nextPageOffset: number | null;
  records: any[];
}> {
  return { columns: [], rows: [], nextPageOffset: null, records: [] };
}

export async function retrieveAllRowsCached(
  sourceName: string,
  twinId: string,
  timeoutMs: number = 10000
): Promise<any[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return []; } finally { clearTimeout(timeout); }
}

export async function scrollAllProgressive(
  sourceName: string,
  twinId: string,
  batchLimit: number = 200,
  onBatch?: (records: any[], nextOffset: number | null) => void
): Promise<any[]> {
  if (onBatch) onBatch([], null);
  return [];
}

/**
 * DEPRECATED: Retrieve table data directly from formatted XLSX public URL
 * This approach is unreliable - use Qdrant scroll instead
 */
export async function retrieveTableDataFromFileUrl(
  tableId: string
): Promise<{ columns: string[]; rows: Array<{ id: string;[key: string]: any }> }> {
  return { columns: [], rows: [] };
}
/**
 * Delete entire knowledge source (table) using v2 API
 */
/**
 * Delete entire knowledge source (table) and associated Console files
 */
export async function deleteKnowledgeSource(
  tableId: string
): Promise<{ status: string; message: string }> {
  return { status: 'completed', message: 'Source deleted (static)' };
}

/**
 * Search data points in a table using v2 API
 */
export async function searchTableData(
  tableId: string,
  query: string,
  limit: number = 50
): Promise<TableDataPoint[]> {
  return [];
}

function extractSheetName(metadata: unknown): string {
  // Safely read source_name_display from object or JSON string; fallback to 'Sheet1'
  try {
    if (!metadata) return 'Sheet1';

    if (typeof metadata === 'string') {
      const parsed = JSON.parse(metadata);
      if (parsed && typeof parsed === 'object' && typeof (parsed as any).source_name_display === 'string') {
        return (parsed as any).source_name_display as string;
      }
    } else if (typeof metadata === 'object') {
      const obj = metadata as any;
      if (obj && typeof obj.source_name_display === 'string') {
        return obj.source_name_display as string;
      }
    }
  } catch {
    // ignore parse errors
  }
  return 'Sheet1';
}
/**
 * Sanitize structured table metadata to match the new template
 * - Removes status/result_message/original_file_url/formatted_file_url
 * - Ensures columns only include { name, db_name, type, column_use }
 * - Preserves sets and console payloads
 */
export async function sanitizeStructuredTableMetadata(agentId?: string): Promise<{ updated: number }> {
  return { updated: 0 };
}
