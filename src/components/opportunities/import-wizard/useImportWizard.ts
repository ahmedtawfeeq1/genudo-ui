
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
/**
 * useImportWizard
 * Static import wizard hook replacing backend calls with local mocks.
 */
import { useImportValidation } from './useImportValidation';
import { useRealTimeImport } from './useRealTimeImport';
import { useBulkOutreach } from '@/hooks/useBulkOutreach';
import { ImportedOpportunity, Pipeline, Stage } from './types';
import * as XLSX from 'xlsx';

export const useImportWizard = (
  pipelineId: string,
  stages: Stage[],
  onSuccess: () => void
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedData, setUploadedData] = useState<ImportedOpportunity[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [outreachBatchId, setOutreachBatchId] = useState<string>('');
  const [pipelineData, setPipelineData] = useState<Pipeline | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  const [hasImportedOpportunities, setHasImportedOpportunities] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { validateOpportunity } = useImportValidation();
  const { processingStatus, importResults, processRealTimeImport } = useRealTimeImport(pipelineId, pipelineData);
  const { sendBulkOutreach } = useBulkOutreach();

  // Set default stage to first stage when wizard opens
  useEffect(() => {
    if (stages.length > 0 && !selectedStage) {
      setSelectedStage(stages[0].id);
    }
  }, [stages, selectedStage]);

  // Fetch pipeline data when component mounts
  useEffect(() => {
    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId]);

  // Poll for outreach completion when processing
  useEffect(() => {
    if (!processingStarted || !outreachBatchId || currentStep !== 3) return;
    const timeout = setTimeout(() => {
      setCurrentStep(4);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [processingStarted, outreachBatchId, currentStep]);

  const fetchPipelineData = async () => {
    try {
      await new Promise(res => setTimeout(res, 200));
      setPipelineData({ id: pipelineId, pipeline_name: 'Sales Pipeline', connector_account_id: 'acc-1' } as any);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch pipeline information", variant: "destructive" });
    }
  };

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setUploadedData([]);
    setSelectedStage(stages.length > 0 ? stages[0].id : '');
    setFileError('');
    setOutreachBatchId('');
    setProcessingStarted(false);
    setHasImportedOpportunities(false);
  }, [stages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileError('');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames.includes('Opportunities')) {
          setFileError('❌ No "Opportunities" sheet found. Make sure your file has a sheet named "Opportunities".');
          toast({
            title: "Wrong Sheet Name",
            description: 'Your file must have a sheet named "Opportunities". Please check the sheet name.',
            variant: "destructive"
          });
          return;
        }

        const worksheet = workbook.Sheets['Opportunities'];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawData.length < 2) {
          setFileError('❌ File needs at least a header row and one data row.');
          toast({
            title: "Insufficient Data",
            description: "Please add at least one row of opportunity data.",
            variant: "destructive"
          });
          return;
        }

        const headers = rawData[0] as string[];
        const requiredColumns = ['Client Name', 'Phone Number', 'Preferred Language', 'Preferred Dialect'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setFileError(`❌ Missing required columns: ${missingColumns.join(', ')}`);
          toast({
            title: "Missing Columns",
            description: `Please add these columns: ${missingColumns.join(', ')}`,
            variant: "destructive"
          });
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const processedData = jsonData.map(row => validateOpportunity(row));
        
        setUploadedData(processedData);
        setCurrentStep(2);
        
        const validCount = processedData.filter(opp => opp.isValid).length;
        const invalidCount = processedData.length - validCount;
        
        toast({
          title: "File Uploaded Successfully!",
          description: `Processed ${processedData.length} rows. ${validCount} valid, ${invalidCount} need fixing.`
        });
      } catch (error) {
        console.error('Error parsing file:', error);
        setFileError('❌ Failed to read Excel file. Please make sure it\'s a valid .xlsx file.');
        toast({
          title: "File Error",
          description: "Failed to parse the uploaded file. Please check the format and try again.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleStartProcessing = async () => {
    if (!selectedStage) {
      toast({
        title: "Stage Required",
        description: "Please select a stage to import opportunities to.",
        variant: "destructive"
      });
      return;
    }

    if (processingStarted) return;

    console.log('🚀 Starting import and outreach process');
    setProcessingStarted(true);
    setCurrentStep(3);
    
    try {
      console.log('📥 Processing import...');
      const finalImportResults = await processRealTimeImport(uploadedData, selectedStage, stages);
      
      setHasImportedOpportunities(true);
      
      if (finalImportResults.opportunityIds.length > 0) {
        console.log('📤 Starting outreach...');
        
        const result = await sendBulkOutreach({
          opportunity_ids: finalImportResults.opportunityIds,
          pipeline_id: pipelineId,
          delay_ms: 5000
        });

        if (result.success && result.batch_id) {
          console.log('✅ Outreach started:', result.batch_id);
          setOutreachBatchId(result.batch_id);
          toast({
            title: "Processing Started",
            description: `Importing ${finalImportResults.opportunityIds.length} opportunities and sending messages`,
          });
        } else {
          console.error('❌ Outreach failed:', result.error);
          toast({
            title: "Outreach Failed",
            description: "Failed to start outreach messages",
            variant: "destructive"
          });
          setTimeout(() => setCurrentStep(4), 2000);
        }
      } else {
        setTimeout(() => setCurrentStep(4), 2000);
      }
      
    } catch (error) {
      console.error('Error during processing:', error);
      setProcessingStarted(false);
      toast({
        title: "Processing Error",
        description: "Failed to complete processing",
        variant: "destructive"
      });
    }
  };

  return {
    currentStep,
    setCurrentStep,
    uploadedData,
    selectedStage,
    setSelectedStage,
    fileError,
    outreachBatchId,
    pipelineData,
    processingStarted,
    hasImportedOpportunities,
    fileInputRef,
    importResults,
    resetWizard,
    handleFileUpload,
    handleStartProcessing,
    validOpportunities: uploadedData.filter(opp => opp.isValid)
  };
};
