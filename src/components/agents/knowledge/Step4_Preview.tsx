import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2 } from 'lucide-react';
import type { ColumnConfig } from '@/services/knowledgeTableService';

interface Step4Props {
  sourceNameDisplay: string;
  sourceNameDb: string;
  sourceUse: string;
  columns: ColumnConfig[];
  rows: Record<string, any>[];
  searchWithSelection?: boolean[];
  answerWithSelection?: boolean[];
}

const Step4_Preview: React.FC<Step4Props> = ({
  sourceNameDisplay,
  sourceNameDb,
  sourceUse,
  columns,
  rows,
  searchWithSelection,
  answerWithSelection,
}) => {
  const normalizeHeader = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

  // Build robust accessors per column: exact key → normalized fallback across all rows
  const allRowKeys = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r || {})))
  );
  const normalizedKeyIndex: Record<string, string> = {};
  allRowKeys.forEach((k) => {
    normalizedKeyIndex[normalizeHeader(String(k))] = k;
  });

  const columnAccessors = columns.map((col) => {
    const exact = col.name;
    const norm = normalizeHeader(col.name);
    const fallback = normalizedKeyIndex[norm];
    return (row: Record<string, any>) => {
      const raw = row?.[exact] ?? (fallback ? row?.[fallback] : undefined);
      if (raw == null || raw === '') return '';
      if (typeof raw === 'string') return raw;
      if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
      try {
        return JSON.stringify(raw);
      } catch {
        return String(raw);
      }
    };
  });

  const indexedColumns = Array.isArray(searchWithSelection)
    ? columns.filter((_, i) => searchWithSelection[i])
    : columns.filter(c => c.is_indexed);
  const answerWithCols = Array.isArray(answerWithSelection)
    ? columns.filter((_, i) => answerWithSelection[i])
    : columns;
  const filterableColumns = columns.filter(c => c.filterable);
  const allColumns = columns;
  const previewRows = rows.slice(0, 2);
  const truncateWords = (s: string, n: number) => {
    const t = String(s || '').trim();
    if (t === '') return '';
    const parts = t.split(/\s+/);
    if (parts.length <= n) return t;
    return parts.slice(0, n).join(' ') + '...';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-semibold">Table Name:</span>{' '}
            {sourceNameDisplay}
            <span className="text-muted-foreground text-sm ml-2">
              ({sourceNameDb})
            </span>
          </div>
          <div>
            <span className="font-semibold">Purpose:</span>{' '}
            <span className="text-muted-foreground">{sourceUse}</span>
          </div>
          <div>
            <span className="font-semibold">Search With:</span>{' '}
            {indexedColumns.length}
            {indexedColumns.length > 0 ? ` (${indexedColumns.map(c => c.name).join(', ')})` : ''}
          </div>
          <div>
            <span className="font-semibold">Answer With:</span>{' '}
            {answerWithCols.length}
            {answerWithCols.length > 0 ? ` (${answerWithCols.map(c => c.name).join(', ')})` : ''}
          </div>
          <div>
            <span className="font-semibold">Filter By:</span>{' '}
            {filterableColumns.length}
            {filterableColumns.length > 0 ? ` (${filterableColumns.map(c => c.name).join(', ')})` : ''}
          </div>
          <div>
            <span className="font-semibold">Rows:</span> {rows.length}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview removed per requirement */}
    </div>
  );
};

export default Step4_Preview;
