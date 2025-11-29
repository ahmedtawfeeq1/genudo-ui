
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileSpreadsheet, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Pipeline {
  id: string;
  pipeline_name: string;
  connector_account_id: string | null;
}

interface Stage {
  id: string;
  stage_name: string;
  opening_message: boolean;
}

interface ImportWizardStep1Props {
  fileError: string;
  pipelineData: Pipeline | null;
  stages: Stage[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImportWizardStep1: React.FC<ImportWizardStep1Props> = ({
  fileError,
  pipelineData,
  stages,
  onFileUpload,
  fileInputRef
}) => {
  const downloadTemplate = () => {
    const templateData = [{
      'Client Name': 'Ahmed Tawfeeq',
      'Phone Number': '201090190379',
      'Email': 'ahmed@example.com',
      'Source': 'WhatsApp DM',
      'Notes': 'Interested in coaching program',
      'Preferred Language': 'Arabic-Egyptian dialect',
      'Preferred Dialect': 'Egyptian dialect'
    }, {
      'Client Name': 'John Smith',
      'Phone Number': '1234567890',
      'Email': 'john@example.com',
      'Source': 'Website',
      'Notes': 'Interested in premium package',
      'Preferred Language': 'English-American dialect',
      'Preferred Dialect': 'American dialect'
    }];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Opportunities');
    XLSX.writeFile(workbook, 'opportunity_import_template.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Your Opportunities</h3>
        <p className="text-gray-600 mb-6">
          Download our template, fill in your opportunity data, then upload it back here.
        </p>
      </div>

      {fileError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-sm font-medium">
            {fileError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
          <div className="text-center">
            <Download className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">1. Download Template</h4>
            <p className="text-sm text-gray-600 mb-3">
              Get our Excel template with correct format and sample data.
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </Card>

        <Card className="p-4 border-2 border-dashed border-green-200 hover:border-green-300 transition-colors">
          <div className="text-center">
            <FileSpreadsheet className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">2. Upload Your Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Upload your completed Excel file. Only .xlsx files are supported.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={onFileUpload} 
              className="hidden" 
            />
          </div>
        </Card>
      </div>

      {pipelineData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-blue-800">📋 Import Details:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Pipeline:</strong> {pipelineData.pipeline_name}</p>
            <p><strong>Connector Account:</strong> {pipelineData.connector_account_id ? '✅ Connected' : '⚠️ No connector account'}</p>
            <p><strong>Auto-outreach:</strong> {stages.some(s => s.opening_message) ? '✅ Available for selected stages' : '❌ No stages configured'}</p>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-yellow-800">📋 Required Format:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Phone:</strong> 201090190379 (numbers only)</p>
          <p><strong>Language:</strong> Arabic-Egyptian dialect, English-American dialect</p>
          <p><strong>Dialect:</strong> Egyptian dialect, American dialect</p>
          <p><strong>Important:</strong> Fill ALL columns including Preferred Dialect</p>
        </div>
      </div>
    </div>
  );
};

export default ImportWizardStep1;
