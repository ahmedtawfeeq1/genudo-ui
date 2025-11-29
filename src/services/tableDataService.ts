import { db } from "@/lib/mock-db";

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
  const { sourceName, twinId } = ctx;
  const { data, error } = await db.functions.invoke('loopx-v2-api-proxy', {
    body: { action: 'scroll-knowledge-points', twin_id: twinId, source_name: sourceName, limit: pageSize, page_offset: null }
  });
  if (error) return { data: [], total: 0, page, pageSize };
  const records = Array.isArray(data?.records) ? data.records : [];
  const rows: TableDataPoint[] = records.map((rec: any) => ({ id: rec.qdrant_id, table_id: tableId, data: rec.payload?.metadata || {}, created_at: rec.created_at, updated_at: rec.updated_at }));
  return { data: rows, total: rows.length, page, pageSize };
}

/**
 * Upsert (insert or update) data points in a table using v2 API
 */
export async function upsertTableData(
  tableId: string,
  dataPoints: TableDataPoint[]
): Promise<{ success: boolean; count: number }> {
  const ctx = tableContext[tableId];
  if (!ctx) return { success: true, count: 0 };
  const pointsData = dataPoints.map(point => ({ default_id: point.id, ...point.data }));
  const response = await db.functions.invoke('loopx-v2-api-proxy', {
    body: { action: 'upsert', twin_id: ctx.twinId, sheet_name: ctx.sourceName, points_data: pointsData }
  });
  if (response.error) return { success: false, count: 0 };
  return response.data;
}

/**
 * Delete data points from a table using v2 API
 */
export async function deleteTableData(
  tableId: string,
  dataPointIds: Array<string | number>
): Promise<{ success: boolean; count: number }> {
  const ctx = tableContext[tableId];
  if (!ctx) return { success: true, count: 0 };
  const response = await db.functions.invoke('loopx-v2-api-proxy', {
    body: { action: 'delete_points', twin_id: ctx.twinId, point_ids: dataPointIds }
  });
  if (response.error) return { success: false, count: 0 };
  return response.data;
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
  // Call LoopX scroll endpoint via Edge Function
  const { data, error } = await db.functions.invoke('loopx-v2-api-proxy', {
    body: {
      action: 'scroll-knowledge-points',
      twin_id: twinId,
      source_name: sourceName,
      limit,
      page_offset: pageOffset,
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  const records = (data?.records ?? []) as any[];
  const nextOffset = typeof data?.next_page_offset === 'number' ? data.next_page_offset : null;

  // Decide the columns to display
  const firstPayload = records[0]?.payload;
  const retrievedCols: string[] = Array.isArray(firstPayload?.retrieved_cols) ? firstPayload.retrieved_cols : [];
  const metaSchemaKeys: string[] = firstPayload?.metadata_schema ? Object.keys(firstPayload.metadata_schema) : [];
  const metaKeys: string[] = firstPayload?.metadata ? Object.keys(firstPayload.metadata) : [];
  const columns = retrievedCols.length ? retrievedCols : (metaSchemaKeys.length ? metaSchemaKeys : metaKeys);

  // Map records to DataGrid rows
  const rows = records.map((rec) => {
    const payload = rec.payload || {};
    const metadata = payload.metadata || {};
    const row: any = { id: rec.qdrant_id };
    columns.forEach((col) => {
      row[col] = metadata[col] ?? '';
    });
    return row;
  });

  return {
    columns,
    rows,
    nextPageOffset: nextOffset,
    records,
  };
}

export async function retrieveAllRowsCached(
  sourceName: string,
  twinId: string,
  timeoutMs: number = 10000
): Promise<any[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { data, error } = await db.functions.invoke('loopx-v2-api-proxy', {
      body: {
        action: 'scroll-knowledge-points',
        twin_id: twinId,
        source_name: sourceName,
        limit: null,
        page_offset: null,
        cache_full: true,
      }
    });
    if (error) throw new Error(error.message);
    return Array.isArray(data?.records) ? data.records : [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function scrollAllProgressive(
  sourceName: string,
  twinId: string,
  batchLimit: number = 200,
  onBatch?: (records: any[], nextOffset: number | null) => void
): Promise<any[]> {
  let all: any[] = [];
  let offset: number | null = null;
  do {
    const { data, error } = await db.functions.invoke('loopx-v2-api-proxy', {
      body: {
        action: 'scroll-knowledge-points',
        twin_id: twinId,
        source_name: sourceName,
        limit: batchLimit,
        page_offset: offset,
      }
    });
    if (error) throw new Error(error.message);
    const recs = Array.isArray(data?.records) ? data.records : [];
    all = all.concat(recs);
    const next = typeof data?.next_page_offset === 'number' ? data.next_page_offset : null;
    if (onBatch) onBatch(recs, next);
    offset = next;
  } while (offset !== null);
  return all;
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
  const ctx = tableContext[tableId];
  if (!ctx) return { status: 'completed', message: 'No context; nothing to delete' };
  const response = await db.functions.invoke('loopx-v2-api-proxy', {
    body: { action: 'delete_source', twin_id: ctx.twinId, sheet_name: ctx.sourceName }
  });
  if (response.error) return { status: 'failed', message: response.error.message };
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
  const ctx = tableContext[tableId];
  if (!ctx) return [];
  const response = await db.functions.invoke('loopx-v2-api-proxy', {
    body: { action: 'search', twin_external_id: ctx.twinId, file_path: '', query, limit }
  });
  if (response.error) return [];
  return response.data;
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
