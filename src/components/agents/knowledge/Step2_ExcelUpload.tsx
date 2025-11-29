import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { parseExcelFile } from '@/services/knowledgeTableService';
import { toast } from 'sonner';

interface Step2Props {
  onFileUpload: (file: File, columns: string[], rows: Record<string, any>[]) => void;
  parsedInfo?: { columns: number; rows: number } | null;
}

const Step2_ExcelUpload: React.FC<Step2Props> = ({ onFileUpload, parsedInfo }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);

      try {
        const { columns, rows } = await parseExcelFile(file);
        
        // Validation
        const maxRows = 5000;
        const maxColumns = 50;
        
        if (columns.length === 0) {
          throw new Error('No columns found in Excel file');
        }
        
        if (rows.length === 0) {
          throw new Error('No data rows found in Excel file');
        }
        
        if (rows.length > maxRows) {
          throw new Error(`Maximum ${maxRows} rows allowed. Your file has ${rows.length} rows.`);
        }
        
        if (columns.length > maxColumns) {
          throw new Error(`Maximum ${maxColumns} columns allowed. Your file has ${columns.length} columns.`);
        }

        onFileUpload(file, columns, rows);
        toast.success(`Parsed ${columns.length} columns, ${rows.length} rows`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to parse Excel file');
      } finally {
        setIsUploading(false);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${parsedInfo ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {parsedInfo ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-green-700">
              ✓ Excel file parsed successfully
            </p>
            <p className="text-sm text-muted-foreground">
              {parsedInfo.columns} columns • {parsedInfo.rows} rows
            </p>
            <p className="text-xs text-muted-foreground">
              Drop another file to replace
            </p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-3">
            <FileSpreadsheet className="h-12 w-12 text-primary animate-bounce" />
            <p className="text-lg font-semibold">Drop your Excel file here</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-semibold">Upload Excel File</p>
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to select (.xlsx, .xls)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2_ExcelUpload;
