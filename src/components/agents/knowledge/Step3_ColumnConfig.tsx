import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ColumnConfig } from '@/services/knowledgeTableService';

interface Step3Props {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  searchWithSelection?: boolean[];
  answerWithSelection?: boolean[];
  onSearchWithChange?: (sel: boolean[]) => void;
  onAnswerWithChange?: (sel: boolean[]) => void;
  showAdvanced?: boolean;
  onShowAdvancedChange?: (show: boolean) => void;
}

const Step3_ColumnConfig: React.FC<Step3Props> = ({ columns, onColumnsChange, searchWithSelection, answerWithSelection, onSearchWithChange, onAnswerWithChange, showAdvanced, onShowAdvancedChange }) => {
  const [internalShowAdvanced, setInternalShowAdvanced] = useState(false);
  const effectiveShowAdvanced = (typeof showAdvanced !== 'undefined') ? showAdvanced : internalShowAdvanced;
  const [searchWithColumns, setSearchWithColumns] = useState<boolean[]>(searchWithSelection || []);
  const [answerWithColumns, setAnswerWithColumns] = useState<boolean[]>(answerWithSelection || []);

  // Generate a friendly default Column Use string from a column name
  const makeFriendlyColumnUse = (name: string): string => {
    let friendly = name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[\/_\-.]+/g, ' ')
      .replace(/[^a-zA-Z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    friendly = friendly
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return `the ${friendly}`;
  };

  // Sync selections from parent when they change
  useEffect(() => {
    if (Array.isArray(searchWithSelection)) {
      setSearchWithColumns(searchWithSelection);
    }
  }, [searchWithSelection?.length]);
  useEffect(() => {
    if (Array.isArray(answerWithSelection)) {
      setAnswerWithColumns(answerWithSelection);
    }
  }, [answerWithSelection?.length]);

  const updateColumn = (index: number, updates: Partial<ColumnConfig>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onColumnsChange(newColumns);
  };

  const handleSearchWithChange = (index: number, checked: boolean) => {
    const newSearchWith = [...searchWithColumns];
    newSearchWith[index] = checked;
    setSearchWithColumns(newSearchWith);
    
    // Update the underlying column config
    updateColumn(index, { is_indexed: checked });
    if (onSearchWithChange) onSearchWithChange(newSearchWith);
  };

  const handleAnswerWithChange = (index: number, checked: boolean) => {
    const newAnswerWith = [...answerWithColumns];
    newAnswerWith[index] = checked;
    setAnswerWithColumns(newAnswerWith);
    
    if (onAnswerWithChange) onAnswerWithChange(newAnswerWith);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Column Name</TableHead>
              <TableHead className="w-[240px]">Column Use</TableHead>
              <TableHead className="w-[120px]">Search With</TableHead>
              <TableHead className="w-[120px]">Answer With</TableHead>
              {effectiveShowAdvanced && (
                <>
                  <TableHead className="w-[100px]">Filter By</TableHead>
                  <TableHead className="w-[130px]">Column Type</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((column, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{column.name}</TableCell>

                <TableCell>
                  <Input
                    placeholder="e.g., the question"
                    value={column.column_use}
                    onChange={(e) =>
                      updateColumn(index, { column_use: e.target.value })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={searchWithColumns[index] || false}
                    onCheckedChange={(checked) =>
                      handleSearchWithChange(index, checked === true)
                    }
                  />
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={answerWithColumns[index] || false}
                    onCheckedChange={(checked) =>
                      handleAnswerWithChange(index, checked === true)
                    }
                  />
                </TableCell>

                {effectiveShowAdvanced && (
                  <>
                    <TableCell>
                      <Checkbox
                        checked={column.filterable}
                        onCheckedChange={(checked) =>
                          updateColumn(index, { filterable: checked === true })
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Select
                        value={column.type === 'integer' ? 'number' : 'text'}
                        onValueChange={(value) =>
                          updateColumn(index, { type: value === 'number' ? 'integer' : 'string' })
                        }
                        disabled={!column.filterable}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const next = !effectiveShowAdvanced;
            if (onShowAdvancedChange) onShowAdvancedChange(next);
            else setInternalShowAdvanced(next);
          }}
          className="gap-2"
        >
          {effectiveShowAdvanced ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Advanced Settings
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show Advanced Settings
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>• At least 1 column must be selected for Search With</p>
          <p>• At least 1 column must be selected for Answer With</p>
          <p>• Search With columns are used to search your knowledge</p>
          <p>• Answer With columns are used to generate responses</p>
          <p>• Filter By is for numeric filters (years, prices, sizes). Use with Number type</p>
        </div>
      </div>
    </div>
  );
};

export default Step3_ColumnConfig;
