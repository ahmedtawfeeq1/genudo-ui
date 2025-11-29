import React, { useState, useCallback, useMemo } from 'react';
import { db } from "@/lib/mock-db";
import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw, Search, Expand } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { 
  retrieveTableDataFromLoopXScroll,
  retrieveAllRowsCached,
  scrollAllProgressive,
  upsertTableData,
  deleteTableData,
  type TableDataPoint,
  setTableContext
} from '@/services/tableDataService';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';

interface TableDataGridProps {
  tableId: string;
  tableName: string;
  metadata: any;
  onClose: () => void;
}

/**
 * TableRow: Holds display values; internal id (qdrant_id) is hidden.
 */
interface TableRow {
  id: string | number;
  [key: string]: any;
}

/**
 * Component: TableDataGrid
 * Purpose: Manage knowledge table rows with stable v8 MUI DataGrid configuration,
 *          controlled pagination, and client-side export.
 */
const TableDataGrid: React.FC<TableDataGridProps> = ({ 
  tableId, 
  tableName, 
  metadata, 
  onClose 
}) => {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /**
   * Selection model state (v8 include model)
   * Ensures controlled selection works predictably
   */
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<string | number>(),
  });
  /**
   * Deletion progress state: isolates button label from general loading
   */
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [currentOffset, setCurrentOffset] = useState<number | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [offsetHistory, setOffsetHistory] = useState<Array<number | null>>([null]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [pageCache, setPageCache] = useState<Map<number | null, { rows: TableRow[]; rawRecords: any[]; displayColumns: string[] }>>(new Map());
  // scroll debounce ref removed
  const [twinId, setTwinId] = useState<string>('');
  const [agentName, setAgentName] = useState<string>('Agent');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState<string>(metadata?.source_name_display || tableName);
  /**
   * Live row count reflecting adds/deletes; persisted to metadata
   */
  const [liveRowCount, setLiveRowCount] = useState<number>(Number(metadata?.total_rows || 0));
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, string>>({});
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState<boolean>(false);
  const [columnWidthMap, setColumnWidthMap] = useState<Record<string, number>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<TableRow | null>(null);
  const [isSavingPoint, setIsSavingPoint] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<Set<string | number>>(new Set());
  const [recordById, setRecordById] = useState<Record<string, any>>({});
  /**
   * Export state controls
   */
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [isFullDataset, setIsFullDataset] = useState(false);
  const [fullRows, setFullRows] = useState<TableRow[]>([]);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [fullProgress, setFullProgress] = useState<number>(0);
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});
  const [newRows, setNewRows] = useState<TableRow[]>([]);
  const [newRowIds, setNewRowIds] = useState<Set<string | number>>(new Set());
  const [deletedRowIds, setDeletedRowIds] = useState<Set<string | number>>(new Set());
  const [renderSeq, setRenderSeq] = useState<number>(0);

  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const normalizedMap = useMemo(() => {
    const cols = Array.isArray(metadata?.columns) ? metadata.columns : [];
    const map: Record<string, string> = {};
    cols.forEach((c: any) => {
      const display = String(c.name || '').trim();
      const backend = String(c.db_name || '').trim();
      if (!display || !backend) return;
      map[backend] = display;
    });
    return map;
  }, [metadata]);
  const effectiveColumnNames = columnNames.length ? columnNames : Object.values(normalizedMap);
  const isGridReady = Array.isArray(rows) && Array.isArray(effectiveColumnNames) && effectiveColumnNames.length > 0;
  // Build columns from parsed names or metadata fallback
  const columns = useMemo(() => {
    const fields = effectiveColumnNames;
    const actionCol: GridColDef = {
      field: '_actions',
      headerName: '',
      width: 96,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              const row = params.row as TableRow;
              const cleaned: any = { ...row };
              effectiveColumnNames.forEach((display) => {
                const raw = String(cleaned[display] ?? '');
                cleaned[display] = raw.replace(/_x000d_/g, '');
              });
              setEditRow(cleaned as TableRow);
              setIsEditOpen(true);
            }}
            aria-label="Expand"
          >
            <Expand className="h-4 w-4" />
          </Button>
          {newRowIds.has((params.row as any)?.id) && (
            <Badge 
              variant="outline" 
              className="ml-1 animate-pulse bg-green-50 border-green-300 text-green-700"
            >
              NEW
            </Badge>
          )}
        </div>
      ),
    } as any;

    const gridColumns: GridColDef[] = [actionCol, ...fields.map((colName: string) => ({
      field: colName,
      headerName: colName,
      flex: 0,
      width: Math.max(180, Math.min(columnWidthMap[colName] ?? 180, 600)),
      editable: true,
      sortable: true,
      headerClassName: 'bg-muted',
      renderCell: (params) => {
        const raw = params.value ?? '';
        const text = String(raw).replace(/_x000d_/g, '');
        return (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>
        );
      },
      renderHeader: () => (
        <div className="flex items-center justify-between w-full">
          <span>{colName}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" aria-label={`Search ${colName}`}>
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-64">
              <div className="space-y-2">
                <div className="text-sm font-medium">Search {colName}</div>
                <Input
                  value={filters[colName] ?? ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [colName]: e.target.value }))}
                  placeholder={`Type to filter ${colName}`}
                />
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setFilters((prev) => ({ ...prev, [colName]: '' }))}>Clear</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    }))];
    return gridColumns;
  }, [effectiveColumnNames, filters, columnWidthMap]);

  React.useEffect(() => {
    try {
      // Build displayed rows similarly to DataGrid rows memoization
      const active = Object.entries(debouncedFilters).filter(([, v]) => v && v.trim());
      let baseRows: TableRow[] = [];
      if (isFullDataset) {
        baseRows = fullRows;
      } else {
        const cachedPage = pageCache.get(offsetHistory[pageIndex]);
        baseRows = cachedPage?.rows ?? rows;
      }

      const rowMap = new Map<string | number, TableRow>();
      baseRows.forEach((row) => {
        if (!deletedRowIds.has(row.id)) {
          rowMap.set(row.id, row);
        }
      });
      if (overlayEnabled) {
        newRows.forEach((row) => {
          if (!deletedRowIds.has(row.id)) {
            rowMap.set(row.id, row);
          }
        });
      }
      let combinedRows = Array.from(rowMap.values());
      if (active.length > 0) {
        combinedRows = combinedRows.filter((row) =>
          active.every(([columnKey, query]) =>
            String(row[columnKey] ?? '').toLowerCase().includes(String(query).toLowerCase())
          )
        );
      }

      // Measure widths using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = '14px Inter, system-ui, sans-serif';
      const next: Record<string, number> = {};
      effectiveColumnNames.forEach((col, idx) => {
        let max = idx === 0 ? 220 : 180; // widen first data column
        combinedRows.forEach((row) => {
          const text = String(row[col] ?? '');
          const w = Math.ceil(ctx.measureText(text).width) + 32; // padding
          if (w > max) max = w;
        });
        const minBase = idx === 0 ? 220 : 180;
        next[col] = Math.min(Math.max(minBase, max), 600);
      });
      setColumnWidthMap(next);
    } catch {}
  }, [rows, debouncedFilters, pageCache, offsetHistory, pageIndex, isFullDataset, fullRows, newRows, deletedRowIds, effectiveColumnNames, overlayEnabled]);

  /**
   * Persist metadata row count and modified date after operations
   */
  const updateTableMetadataCounts = useCallback(async (deltaRows: number) => {
    try {
      const nextCount = Math.max(0, Number(liveRowCount) + Number(deltaRows || 0));
      setLiveRowCount(nextCount);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const nextMeta = { ...(metadata || {}), total_rows: nextCount, modified_date: ts } as any;
      await db.from('knowledge_files').update({ metadata: nextMeta }).eq('id', tableId);
    } catch (e) {
      console.warn('Failed to update table metadata counts', e);
    }
  }, [liveRowCount, metadata, tableId]);

  /**
   * Helper: count selected rows across model variants
   */
  const getSelectedCount = useCallback((m: GridRowSelectionModel): number => {
    return Array.isArray(m) ? m.length : (m?.ids?.size ?? 0);
  }, []);

  /**
   * Helper: flatten selected ids to array
   */
  const getSelectedIds = useCallback((m: GridRowSelectionModel): Array<string | number> => {
    return Array.isArray(m) ? m : Array.from(m.ids ?? new Set<string | number>());
  }, []);

  /**
   * Helper: flatten selected original_id values from rawRecords
   */
  const getSelectedOriginalIds = useCallback((m: GridRowSelectionModel): string[] => {
    const ids = Array.isArray(m) ? m : Array.from(m.ids ?? new Set<string | number>());
    return ids
      .map((rowId) => {
        const rec = rawRecords.find((r) => r.qdrant_id === rowId);
        return rec?.payload?.metadata?.original_id ?? null;
      })
      .filter((v): v is string => typeof v === 'string' && v.length > 0);
  }, [rawRecords]);

  // Build deletion IDs: NEW rows use their local IDs directly; existing rows map qdrant_id → original_id
  const buildDeleteIds = useCallback((m: GridRowSelectionModel): string[] => {
    const ids = Array.isArray(m) ? m : Array.from(m.ids ?? new Set<string | number>());
    const results = new Set<string>();
    ids.forEach((rowId) => {
      if (newRowIds.has(rowId)) {
        results.add(String(rowId));
      } else {
        const rec = rawRecords.find((r) => r.qdrant_id === rowId);
        const orig = rec?.payload?.metadata?.original_id;
        if (typeof orig === 'string' && orig.length > 0) {
          results.add(orig);
        } else {
          results.add(String(rowId));
        }
      }
    });
    return Array.from(results);
  }, [newRowIds, rawRecords]);

  /**
   * Helper: get original_id for a single row by qdrant_id
   */
  const getOriginalIdForRow = useCallback((rowId: string | number): string | null => {
    const rec = rawRecords.find((r) => r.qdrant_id === rowId);
    const original = rec?.payload?.metadata?.original_id ?? null;
    if (original && typeof original === 'string') return original;
    // Fallback: if this is a newly added row, use its local id (default_id)
    if (newRowIds.has(rowId)) return String(rowId);
    return null;
  }, [rawRecords, newRowIds]);

  // Load data from LoopX scroll API by source name

  const loadData = useCallback(async () => {
    setLoading(true);
    setOverlayEnabled(false);
    setError(null);
    try {
      // Use source name from metadata for LoopX scroll
      const sourceName = metadata.source_name_db || tableName;
      // Resolve and cache twin_id from metadata payload in static mode
      const metaTwin = (metadata?.formatted_file?.twin_id || metadata?.original_file?.twin_id || '') as string;
      if (!twinId && metaTwin) {
        setTwinId(metaTwin);
      }
      const resolvedTwinId = twinId || metaTwin || '';

      setTableContext(tableId, sourceName, resolvedTwinId);
      const { columns: apiColumns, rows: apiRows, nextPageOffset, records } = await retrieveTableDataFromLoopXScroll(sourceName, resolvedTwinId, currentOffset, 20);
      const allBackendCols: string[] = Array.isArray(metadata?.columns) ? metadata.columns.map((c: any) => c.db_name) : apiColumns;
      const allDisplayCols: string[] = Array.isArray(metadata?.columns) ? metadata.columns.map((c: any) => c.name) : apiColumns.map((b: string) => normalizedMap[b] || b);
      const mappedRows: TableRow[] = (apiRows as any[]).map((r) => {
        const out: any = { id: r.id };
        allBackendCols.forEach((backend) => {
          const display = normalizedMap[backend] || backend;
          out[display] = r[backend] ?? '';
        });
        return out;
      });
      setColumnNames(allDisplayCols);
      setNextOffset(nextPageOffset);
      setHasMore(nextPageOffset !== null);
      setPageCache((prev) => {
        const next = new Map(prev);
        next.set(currentOffset, { rows: mappedRows, rawRecords: records, displayColumns: allDisplayCols });
        setRawRecords(Array.from(next.values()).flatMap((p) => p.rawRecords));
        return next;
      });
      setOffsetHistory((prev) => {
        if (prev.includes(currentOffset)) return prev;
        return [...prev, currentOffset];
      });
      setRows(mappedRows);
      setIsDirty(false);
      toast.success('Table data loaded! ✅️');
    } catch (error) {
      console.error('Error loading data from LoopX:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data from LoopX');
      toast.error('Failed to load data from LoopX');
    } finally {
      setLoading(false);
      setOverlayEnabled(true);
    }
  }, [tableName, metadata.source_name_db, normalizedMap, currentOffset]);

  const handleNextPage = async () => {
    const nextCachedOffset = offsetHistory[pageIndex + 1];
    if (typeof nextCachedOffset !== 'undefined') {
      setPageIndex((p) => p + 1);
      const cached = pageCache.get(offsetHistory[pageIndex + 1]);
      if (cached) {
        setRows(cached.rows);
        setRawRecords(Array.from(pageCache.values()).flatMap((p) => p.rawRecords));
      }
      return;
    }
    if (nextOffset === null) return;
    setCurrentOffset(nextOffset);
    await loadData();
    setPageIndex((p) => p + 1);
  };

  const handlePrevPage = async () => {
    if (pageIndex <= 0) return;
    const prevIdx = pageIndex - 1;
    setPageIndex(prevIdx);
    const prevOffset = offsetHistory[prevIdx];
    const cached = pageCache.get(prevOffset);
    if (cached) {
      setRows(cached.rows);
      setRawRecords(Array.from(pageCache.values()).flatMap((p) => p.rawRecords));
      return;
    }
    setCurrentOffset(prevOffset ?? null);
    await loadData();
  };

  // Add new row
  const handleAddRow = () => {
    const initial = effectiveColumnNames.reduce((acc: any, d) => { acc[d] = ''; return acc; }, {});
    setAddForm(initial);
    setIsAddOpen(true);
  };

  // Delete selected rows
  const handleDeleteRows = async () => {
    setIsDeleting(true);
    try {
      // Build point_ids for delete: NEW → local id; existing → original_id
      const originalIds = buildDeleteIds(selectedRows);
      if (!originalIds || originalIds.length === 0) {
        toast.error('No rows selected or missing IDs');
        return;
      }

      // Send original IDs to delete_points
      await deleteTableData(tableId, originalIds);

      const removedIds = getSelectedIds(selectedRows);
      
      // Update deleted row IDs using functional update
      setDeletedRowIds((prevDeletedIds) => {
        const updatedDeletedIds = new Set([...Array.from(prevDeletedIds), ...removedIds]);
        
        // Update session storage with the correct state
        try {
          const data = {
            newRows,
            newRowIds: Array.from(newRowIds),
            deletedRowIds: Array.from(updatedDeletedIds),
          };
          sessionStorage.setItem(`tdg_cache_${tableId}`, JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to cache deleted rows:', e);
        }
        
        return updatedDeletedIds;
      });
      
      // Remove from newRows/newRowIds overlay
      setNewRows((prev) => prev.filter((r) => !removedIds.includes(r.id as any)));
      setNewRowIds((prev) => {
        const next = new Set(Array.from(prev));
        removedIds.forEach((id) => next.delete(id));
        return next;
      });

      // Remove from current display rows
      setRows((prevRows) => prevRows.filter((r) => !removedIds.includes(r.id as any)));
      setFullRows((prevFullRows) => prevFullRows.filter((r) => !removedIds.includes(r.id as any)));
      
      // Remove from page cache
      setPageCache((prevCache) => {
        const next = new Map(prevCache);
        next.forEach((val, key) => {
          next.set(key, {
            ...val,
            rows: val.rows.filter((r) => !removedIds.includes(r.id as any)),
            rawRecords: val.rawRecords.filter((rec: any) => !removedIds.includes(rec.qdrant_id as any)),
          });
        });
        return next;
      });
      
      // Remove from new rows if they were newly added
      setNewRows((prevNewRows) => prevNewRows.filter((r) => !removedIds.includes(r.id as any)));
      setNewRowIds((prevNewRowIds) => {
        const updated = new Set(prevNewRowIds);
        removedIds.forEach(id => updated.delete(id));
        return updated;
      });

      // Clear selection
      setSelectedRows({ type: 'include', ids: new Set() });
      setIsDirty(true);
      
      toast.success(`${originalIds.length} rows deleted successfully`);
      await updateTableMetadataCounts(-originalIds.length);
      
      // Force DataGrid re-render
      setRenderSeq((s) => s + 1);
      
    } catch (error) {
      console.error('Error deleting rows:', error);
      toast.error('Failed to delete rows');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cell edit (legacy). Use processRowUpdate for v8 commit.
  const handleCellEdit = (params: any) => {
    setIsDirty(true);
  };

  // Commit edits via v8 API
  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    setRows(prev => prev.map(r => (r.id === oldRow.id ? { ...oldRow, ...newRow } as TableRow : r)));
    // If editing a NEW overlay row, keep overlay in sync
    if (newRowIds.has(oldRow.id as any)) {
      setNewRows((prev) => prev.map((r) => (r.id === oldRow.id ? { ...r, ...newRow } : r)));
    }
    setIsDirty(true);
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(oldRow.id as any);
      return next;
    });
    return newRow;
  };
  const onProcessRowUpdateError = (error: any) => {
    console.error('Row update error:', error);
    toast.error('Failed to update row');
  };

  // Save changes: convert display names back to backend names
  const handleSave = async () => {
    setLoading(true);
    try {
      const cols = columnNames.length ? columnNames : [];
      const dirtyOnly = rows.filter(r => dirtyIds.has(r.id));
      const dataPoints: TableDataPoint[] = dirtyOnly.map(row => ({
        id: row.id,
        table_id: tableId,
        data: cols.reduce((acc: any, display: string) => {
          const backend = Object.keys(normalizedMap).find(k => normalizedMap[k] === display) || display;
          acc[backend] = row[display] ?? '';
          return acc;
        }, {})
      }));
      await upsertTableData(tableId, dataPoints);
      
      setIsDirty(false);
      setDirtyIds(new Set());
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function: handleExport
   * Purpose: Export currently loaded rows (ID + indexed columns) to XLSX.
   */
  // export feature removed

  React.useEffect(() => {
    if (!hasLoadedInitial) {
      loadData();
      setHasLoadedInitial(true);
    }
  }, [loadData, hasLoadedInitial]);

  React.useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`tdg_cache_${tableId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const nRows = Array.isArray(parsed?.newRows) ? parsed.newRows : [];
        const nIds = Array.isArray(parsed?.newRowIds) ? new Set(parsed.newRowIds) : new Set();
        const dIds = Array.isArray(parsed?.deletedRowIds) ? new Set(parsed.deletedRowIds) : new Set();
        setNewRows(nRows);
        setNewRowIds(nIds as any);
        setDeletedRowIds(dIds as any);
      }
    } catch (e) {
      toast.error('Failed to load cached changes');
    }
  }, [tableId]);

  const persistCache = React.useCallback(() => {
    try {
      const data = {
        newRows,
        newRowIds: Array.from(newRowIds),
        deletedRowIds: Array.from(deletedRowIds),
      };
      sessionStorage.setItem(`tdg_cache_${tableId}`, JSON.stringify(data));
    } catch (e) {
      toast.error('Failed to cache changes');
    }
  }, [newRows, newRowIds, deletedRowIds, tableId]);

  React.useEffect(() => {
    const fullLen = isFullDataset ? fullRows.length : (pageCache.get(offsetHistory[pageIndex])?.rows?.length ?? rows.length);
    const size = Math.max(1, isFullDataset ? fullLen : 20);
    setPaginationModel({ page: 0, pageSize: size });
  }, [isFullDataset, fullRows.length, pageCache, offsetHistory, pageIndex, rows.length]);

  // scroll-based loading removed; explicit pagination only

  React.useEffect(() => {
    const active = Object.entries(filters).filter(([, v]) => v && v.trim());
    if (active.length > 0) {
      setPageIndex(0);
      const scroller = document.querySelector('.MuiDataGrid-virtualScroller') as HTMLElement | null;
      if (scroller) scroller.scrollTop = 0;
    }
  }, [filters]);

  React.useEffect(() => {
    const h = window.setTimeout(() => setDebouncedFilters(filters), 250);
    return () => window.clearTimeout(h);
  }, [filters]);

  // Persist cache whenever overlay states change
  React.useEffect(() => {
    persistCache();
  }, [newRows, newRowIds, deletedRowIds, persistCache]);

  const handleShowAllRows = useCallback(async () => {
    if (isFullLoading || isFullDataset) return;
    setIsFullLoading(true);
    setFullProgress(5);
    const sourceName = metadata.source_name_db || tableName;
    const metaTwin = (metadata?.formatted_file?.twin_id || metadata?.original_file?.twin_id || '') as string;
    const resolvedTwinId = twinId || metaTwin || '';
    try {
      const scroller = document.querySelector('.MuiDataGrid-virtualScroller') as HTMLElement | null;
      const prevTop = scroller?.scrollTop ?? 0;
      const total = Number(metadata?.total_rows || 0);
      const limit = total > 0 ? total : 1000;
      setTableContext(tableId, sourceName, resolvedTwinId);
      const { columns: apiColumns, rows: apiRows, nextPageOffset, records } = await retrieveTableDataFromLoopXScroll(sourceName, resolvedTwinId, null, limit);
      const allBackendCols: string[] = Array.isArray(metadata?.columns) ? metadata.columns.map((c: any) => c.db_name) : apiColumns;
      const allDisplayCols: string[] = Array.isArray(metadata?.columns) ? metadata.columns.map((c: any) => c.name) : apiColumns.map((b: string) => normalizedMap[b] || b);
      const mappedRows: TableRow[] = (apiRows as any[]).map((r) => {
        const out: any = { id: r.id };
        allBackendCols.forEach((backend) => {
          const display = normalizedMap[backend] || backend;
          out[display] = r[backend] ?? '';
        });
        return out;
      });
      setColumnNames(allDisplayCols);
      setFullRows(mappedRows);
      setRawRecords(records);
      setIsFullDataset(true);
      setFullProgress(100);
      toast.success('All rows loaded');
      if (scroller) scroller.scrollTop = prevTop;
    } catch (e) {
      console.error(e);
      toast.error('Failed to load all rows');
    } finally {
      setIsFullLoading(false);
    }
  }, [isFullLoading, isFullDataset, metadata, tableName, twinId, normalizedMap, tableId]);

  const handleGetLatestData = useCallback(async () => {
    setLoading(true);
    try {
      const sourceName = metadata.source_name_db || tableName;
    const metaTwin = (metadata?.formatted_file?.twin_id || metadata?.original_file?.twin_id || '') as string;
    const resolvedTwinId = twinId || metaTwin || '';
      const total = Number(metadata?.total_rows || 0);
      const limit = total > 0 ? total : 1000;
      setTableContext(tableId, sourceName, resolvedTwinId);
      const { columns: apiColumns, rows: apiRows, records } = await retrieveTableDataFromLoopXScroll(sourceName, resolvedTwinId, null, limit);
      const allBackendCols: string[] = Array.isArray(metadata?.columns) ? metadata.columns.map((c: any) => c.db_name) : apiColumns;
      const allDisplayCols: string[] = Array.isArray(metadata?.columns) ? metadata.columns.map((c: any) => c.name) : apiColumns.map((b: string) => normalizedMap[b] || b);
      const mappedRows: TableRow[] = (apiRows as any[]).map((r) => {
        const out: any = { id: r.id };
        allBackendCols.forEach((backend) => {
          const display = normalizedMap[backend] || backend;
          out[display] = r[backend] ?? '';
        });
        return out;
      });
      
      // Clear overlay states first
      setNewRows([]);
      setNewRowIds(new Set());
      setDeletedRowIds(new Set());
      
      // Clear session storage
      try {
        const data = {
          newRows: [],
          newRowIds: [],
          deletedRowIds: [],
        };
        sessionStorage.setItem(`tdg_cache_${tableId}`, JSON.stringify(data));
      } catch {}
      
      // Update display data
      setColumnNames(allDisplayCols);
      setFullRows(mappedRows);
      setRawRecords(records);
      setIsFullDataset(true);
      
      // Force a complete re-render
      setRenderSeq((s) => s + 1);
      
      toast.success('Latest data fetched');
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch latest data');
    } finally {
      setLoading(false);
    }
  }, [metadata, tableName, twinId, normalizedMap, tableId]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          {!editingName ? (
            <h2 className="text-xl font-semibold cursor-pointer" onClick={() => setEditingName(true)}>{displayName}</h2>
          ) : (
            <div className="flex items-center gap-2">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-64" />
              <Button size="sm" variant="default" onClick={async () => {
                try {
                  await db.from('knowledge_files').update({ metadata: { ...metadata, source_name_display: displayName } as any }).eq('id', tableId);
                  toast.success('Table name updated');
                } catch {
                  toast.error('Failed to update table name');
                } finally {
                  setEditingName(false);
                }
              }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setDisplayName(metadata?.source_name_display || tableName); setEditingName(false); }}>Cancel</Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {liveRowCount} rows • {(Array.isArray(metadata?.columns) ? metadata.columns.length : (metadata?.total_columns || 0))} columns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetLatestData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Get Latest Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowAllRows}
            disabled={isFullLoading || isFullDataset}
            aria-busy={isFullLoading}
            aria-live="polite"
          >
            {isFullLoading ? 'Loading All…' : (isFullDataset ? 'All Rows Loaded' : 'Show All Rows')}
          </Button>
          {/* Close handled by modal header */}
        </div>
      </div>

      {/* Export feature removed */}

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteRows}
          disabled={getSelectedCount(selectedRows) === 0 || isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? 'Deleting…' : `Delete Selected (${getSelectedCount(selectedRows)})`}
        </Button>
      </div>

      {/* Column-level search moved to header popovers */}

      {/* DataGrid */}
          <div className="flex-1 p-4 overflow-hidden">
            {error ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-sm text-destructive border rounded-lg bg-card">
                <div className="mb-2">Error loading table data</div>
                <div className="text-xs text-muted-foreground mb-4">{error}</div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setError(null);
                    loadData();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : !isGridReady ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground border rounded-lg bg-card">
                Loading table structure...
              </div>
            ) : (
            <DataGrid
              key={`${tableId}-${currentOffset}-${renderSeq}-${newRows.length}-${deletedRowIds.size}`}
              rows={useMemo(() => {
                const active = Object.entries(debouncedFilters).filter(([, v]) => v && v.trim());
                
                // Get base rows from cache or current state
                let baseRows: TableRow[] = [];
                if (isFullDataset) {
                  baseRows = fullRows;
                } else {
                  const cachedPage = pageCache.get(offsetHistory[pageIndex]);
                  baseRows = cachedPage?.rows ?? rows;
                }
                
                // Create a map for efficient lookups and deduplication
                const rowMap = new Map<string | number, TableRow>();
                
                // Add base rows first (existing data)
                baseRows.forEach((row) => {
                  if (!deletedRowIds.has(row.id)) {
                    rowMap.set(row.id, row);
                  }
                });
                
                // Build combined rows with NEW rows first
                let overlayNewRows: TableRow[] = [];
                if (overlayEnabled) {
                  overlayNewRows = newRows.filter((row) => !deletedRowIds.has(row.id));
                }
                const baseRowsOrdered = Array.from(rowMap.values());
                const combinedRows = [...overlayNewRows, ...baseRowsOrdered];
                
                // Apply filters if any are active
                if (active.length === 0) {
                  return combinedRows;
                }
                
                return combinedRows.filter((row) => 
                  active.every(([columnKey, query]) => 
                    String(row[columnKey] ?? '').toLowerCase().includes(String(query).toLowerCase())
                  )
                );
              }, [rows, debouncedFilters, pageCache, offsetHistory, pageIndex, isFullDataset, fullRows, newRows, deletedRowIds, overlayEnabled])}
              columns={columns}
              loading={loading || isFullLoading}
              
              checkboxSelection
              disableRowSelectionOnClick
              keepNonExistentRowsSelected
              disableRowSelectionExcludeModel
          
          onRowClick={(params) => {
            const row = params.row as TableRow;
            const cleaned: any = { ...row };
            effectiveColumnNames.forEach((display) => {
              const raw = String(cleaned[display] ?? '');
              cleaned[display] = raw.replace(/_x000d_/g, '');
            });
            setEditRow(cleaned as TableRow);
            setIsEditOpen(true);
          }}
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={(next) => {
                /**
                 * Normalize v8/v7 payloads to include model
                 */
                const normalized: GridRowSelectionModel = Array.isArray(next)
                  ? { type: 'include', ids: new Set(next) }
                  : next && typeof next === 'object' && 'ids' in next
                  ? next
                  : { type: 'include', ids: new Set() };
                setSelectedRows(normalized);
              }}
          onCellEditStop={handleCellEdit}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={onProcessRowUpdateError}
          disableColumnMenu
          getRowId={(row) => row.id}
          getRowClassName={(params) => {
            const rowId = params.row.id;
            if (overlayEnabled && newRowIds.has(rowId)) {
              return 'new-row-highlight';
            }
            if (deletedRowIds.has(rowId)) {
              return 'deleted-row-hide';
            }
            return '';
          }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[paginationModel.pageSize]}
          hideFooterSelectedRowCount
          hideFooter
          className="bg-card border rounded-lg"
          sx={{
            height: '65vh',
            '& .MuiDataGrid-cell': {
              padding: '8px',
            },
            '& .MuiDataGrid-columnHeader': {
              position: 'sticky',
              top: 0,
              zIndex: 1,
              backgroundColor: 'hsl(var(--muted))',
              fontWeight: 600,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'hsl(var(--accent))',
            },
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: 'hsl(var(--accent))',
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: 'hsl(var(--accent))',
            },
            // New row highlighting
            '& .new-row-highlight': {
              backgroundColor: 'rgba(34, 197, 94, 0.1) !important',
              '&:hover': {
                backgroundColor: 'rgba(34, 197, 94, 0.15) !important',
              },
              // Add left border indicator
              borderLeft: '3px solid rgb(34, 197, 94) !important',
              position: 'relative',
            },
            // Deleted row hiding (should not be visible due to filtering, but just in case)
            '& .deleted-row-hide': {
              display: 'none',
            },
          }}
        />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">Default: 20 rows</span>
          <span className="text-muted-foreground">Note: After add/delete, press ‘Get Latest Data’ to verify updates.</span>
          {getSelectedCount(selectedRows) > 0 && (
            <span>{getSelectedCount(selectedRows)} rows selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isFullDataset && (
            <Badge variant="outline">Full Table Data Loaded!</Badge>
          )}
        </div>
      </div>

      {/* Add Row Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Add Row</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {effectiveColumnNames.map((display) => (
              <div key={`add-${display}`} className="space-y-2 p-3">
                <div className="text-sm mb-1">{display}</div>
                <ExpandableTextarea
                  value={addForm[display] ?? ''}
                  onChange={(val) => setAddForm((p) => ({ ...p, [display]: val }))}
                  rows={3}
                  className="w-full min-h-[88px] p-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (isAddingRow) return;
                try {
                  setIsAddingRow(true);
                  toast.info(`${agentName} is learning...`, { duration: 0, id: 'learning-toast' });

                  const cols = effectiveColumnNames;
                  const backendData = cols.reduce((acc: any, display: string) => {
                    const backend = Object.keys(normalizedMap).find(k => normalizedMap[k] === display) || display;
                    acc[backend] = addForm[display] ?? '';
                    return acc;
                  }, {});

                  const tempId = uuidv4();

                  // Save first
                  await upsertTableData(tableId, [{ id: tempId, table_id: tableId, data: backendData }]);

                  // Only now add to UI and cache
                  const newRow: TableRow = { id: tempId } as any;
                  cols.forEach((colName: string) => { newRow[colName] = addForm[colName] ?? ''; });

                  setNewRows((prevNewRows) => {
                    const updatedNewRows = [newRow, ...prevNewRows];
                    setNewRowIds((prevNewRowIds) => {
                      const updatedNewRowIds = new Set([...Array.from(prevNewRowIds), tempId]);
                      try {
                        const data = {
                          newRows: updatedNewRows,
                          newRowIds: Array.from(updatedNewRowIds),
                          deletedRowIds: Array.from(deletedRowIds),
                        };
                        sessionStorage.setItem(`tdg_cache_${tableId}`, JSON.stringify(data));
                      } catch {}
                      return updatedNewRowIds;
                    });
                    return updatedNewRows;
                  });

                  setRows((prevRows) => [newRow, ...prevRows]);
                  setIsDirty(true);
                  setRenderSeq((s) => s + 1);
                  const scroller = document.querySelector('.MuiDataGrid-virtualScroller') as HTMLElement | null;
                  if (scroller) scroller.scrollTop = 0;

                  setIsAddOpen(false);
                  await updateTableMetadataCounts(1);
                  toast.dismiss('learning-toast');
                  toast.success(`${agentName} got your point!`, { duration: 3000, icon: '✅' });
                  // Persist overlay cache after add
                  try {
                    const cacheData = {
                      newRows,
                      newRowIds: Array.from(newRowIds),
                      deletedRowIds: Array.from(deletedRowIds),
                    };
                    sessionStorage.setItem(`tdg_cache_${tableId}`, JSON.stringify(cacheData));
                  } catch {}
                } catch (e) {
                  toast.dismiss('learning-toast');
                  toast.error('Failed to add row', { duration: 5000, description: e instanceof Error ? e.message : 'An unexpected error occurred' });
                } finally {
                  setIsAddingRow(false);
                }
              }}
              disabled={isAddingRow}
            >
              {isAddingRow ? 'Adding...' : 'Add Row'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Row Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Edit Row</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {effectiveColumnNames.map((display) => (
              <div key={`edit-${display}`} className="space-y-2 p-3">
                <div className="text-sm mb-1">{display}</div>
                <ExpandableTextarea
                  value={(editRow?.[display] as string) ?? ''}
                  onChange={(val) => setEditRow((prev) => (prev ? { ...prev, [display]: val } : prev))}
                  rows={4}
                  className="w-full min-h-[88px] p-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button
              disabled={isSavingPoint}
              onClick={async () => {
                setIsSavingPoint(true);
                if (!editRow) return;
                try {
                  toast.info(`${agentName} is learning...`, { duration: 0, id: 'learning-toast' });
                  const cols = effectiveColumnNames;
                  const backendData = cols.reduce((acc: any, display: string) => {
                    const backend = Object.keys(normalizedMap).find(k => normalizedMap[k] === display) || display;
                    acc[backend] = editRow[display] ?? '';
                    return acc;
                  }, {});
                  const originalId = getOriginalIdForRow(editRow.id);
                  if (!originalId) {
                    // As a final fallback, use the row id itself
                    // This matches our delete behavior for NEW points
                    const fallbackId = String(editRow.id);
                    // Keep overlay in sync if this is a NEW row
                    if (newRowIds.has(editRow.id)) {
                      setNewRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
                    }
                    setRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
                    setFullRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
                    setPageCache((prevCache) => {
                      const next = new Map(prevCache);
                      next.forEach((val, key) => {
                        next.set(key, {
                          ...val,
                          rows: val.rows.map((r) => (r.id === editRow.id ? { ...editRow } : r)),
                        });
                      });
                      return next;
                    });
                    setRenderSeq((s) => s + 1);
                    await upsertTableData(tableId, [{ id: fallbackId, table_id: tableId, data: backendData }]);
                    await updateTableMetadataCounts(0);
                    toast.dismiss('learning-toast');
                    toast.success(`${agentName} got your update!`);
                    setIsEditOpen(false);
                  } else {
                    if (newRowIds.has(editRow.id)) {
                      setNewRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
                    }
                    setRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
                    setFullRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
                    setPageCache((prevCache) => {
                      const next = new Map(prevCache);
                      next.forEach((val, key) => {
                        next.set(key, {
                          ...val,
                          rows: val.rows.map((r) => (r.id === editRow.id ? { ...editRow } : r)),
                        });
                      });
                      return next;
                    });
                    setRenderSeq((s) => s + 1);
                    await upsertTableData(tableId, [{ id: originalId, table_id: tableId, data: backendData }]);
                    await updateTableMetadataCounts(0);
                    toast.dismiss('learning-toast');
                    toast.success(`${agentName} got your update!`);
                    setIsEditOpen(false);
                  }
                } catch (e) {
                  toast.dismiss('learning-toast');
                  console.error(e);
                  toast.error('Failed to update row');
                } finally {
                  setIsSavingPoint(false);
                }
              }}
            >
            {isSavingPoint ? 'Saving…' : 'Save Row'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableDataGrid;
