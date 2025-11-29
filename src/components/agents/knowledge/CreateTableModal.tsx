import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Step1_SourceSettings from './Step1_SourceSettings';
import Step2_ExcelUpload from './Step2_ExcelUpload';
import Step3_ColumnConfig from './Step3_ColumnConfig';
import Step4_Preview from './Step4_Preview';
import { useCreateKnowledgeTable } from '@/hooks/useKnowledgeTables';
import { toDbFormat, type ColumnConfig } from '@/services/knowledgeTableService';
import { toast } from 'sonner';

interface CreateTableModalProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({ open, onClose, agentId }) => {
  const [step, setStep] = useState(1);
  const [sourceNameDisplay, setSourceNameDisplay] = useState('');
  const [sourceUse, setSourceUse] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedColumns, setParsedColumns] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [answerWithColumns, setAnswerWithColumns] = useState<string[]>([]);
  const [searchWithSelection, setSearchWithSelection] = useState<boolean[]>([]);
  const [answerWithSelection, setAnswerWithSelection] = useState<boolean[]>([]);
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const { mutate: createTable, isPending } = useCreateKnowledgeTable();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleFileUpload = (file: File, cols: string[], rows: Record<string, any>[]) => {
    setExcelFile(file);
    setParsedColumns(cols);
    setParsedRows(rows);
    
    // Initialize column config - let the Step3 component handle default selections
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

    setColumns(
      cols.map((name) => ({
        name,
        is_indexed: false,
        type: 'string',
        filterable: false,
        column_use: makeFriendlyColumnUse(name),
      }))
    );
    // Initialize default selections (first two columns)
    const defaults = cols.map((_, idx) => idx < 2);
    setSearchWithSelection(defaults);
    setAnswerWithSelection(defaults);
    // Set initial is_indexed based on defaults
    setColumns(prev => prev.map((c, idx) => ({ ...c, is_indexed: defaults[idx] })));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!sourceNameDisplay.trim()) {
          toast.error('Please enter a table name');
          return false;
        }
        if (!sourceUse.trim()) {
          toast.error('Please enter the table use description');
          return false;
        }
        return true;
      
      case 2:
        if (!excelFile || parsedColumns.length === 0) {
          toast.error('Please upload an Excel file');
          return false;
        }
        return true;
      
      case 3:
        const indexedCols = searchWithSelection.filter(Boolean);
        if (indexedCols.length === 0) {
          toast.error('At least one column must be selected for Search With');
          return false;
        }
        if (!answerWithSelection || answerWithSelection.filter(Boolean).length === 0) {
          toast.error('At least one column must be selected for Answer With');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = () => {
    if (!excelFile) return;
    
    const computedAnswerWithNames = columns
      .map((c, idx) => (answerWithSelection[idx] ? c.name : null))
      .filter((n): n is string => !!n);
    createTable(
      {
        agentId,
        sourceNameDisplay,
        sourceUse,
        columns,
        excelFile,
        rowsData: parsedRows,
        answerWithColumns: computedAnswerWithNames,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setStep(1);
    setSourceNameDisplay('');
    setSourceUse('');
    setExcelFile(null);
    setParsedColumns([]);
    setParsedRows([]);
    setColumns([]);
    setAnswerWithColumns([]);
    setShowAdvancedColumns(false);
  };

  const handleClose = (open?: boolean) => {
    if (open === false) {
      if (step > 1) {
        setShowConfirmClose(true);
      } else {
        resetForm();
        onClose();
      }
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Knowledge Table - Step {step} of {totalSteps}</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Configure table settings'}
            {step === 2 && 'Upload your Excel file'}
            {step === 3 && 'Configure column settings'}
            {step === 4 && 'Review and confirm'}
          </DialogDescription>
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="py-6">
          {step === 1 && (
            <Step1_SourceSettings
              sourceNameDisplay={sourceNameDisplay}
              sourceUse={sourceUse}
              onSourceNameChange={setSourceNameDisplay}
              onSourceUseChange={setSourceUse}
            />
          )}

          {step === 2 && (
            <Step2_ExcelUpload
              onFileUpload={handleFileUpload}
              parsedInfo={
                excelFile
                  ? { columns: parsedColumns.length, rows: parsedRows.length }
                  : null
              }
            />
          )}

          {step === 3 && (
            <Step3_ColumnConfig 
              columns={columns} 
              onColumnsChange={setColumns}
              searchWithSelection={searchWithSelection}
              answerWithSelection={answerWithSelection}
              onSearchWithChange={setSearchWithSelection}
              onAnswerWithChange={setAnswerWithSelection}
              showAdvanced={showAdvancedColumns}
              onShowAdvancedChange={setShowAdvancedColumns}
            />
          )}

          {step === 4 && (
            <Step4_Preview
              sourceNameDisplay={sourceNameDisplay}
              sourceNameDb={toDbFormat(sourceNameDisplay)}
              sourceUse={sourceUse}
              columns={columns}
              rows={parsedRows}
              searchWithSelection={searchWithSelection}
              answerWithSelection={answerWithSelection}
            />
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isPending}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Table'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress will be lost. Do you want to cancel?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={() => { resetForm(); onClose(); setShowConfirmClose(false); }}>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default CreateTableModal;
