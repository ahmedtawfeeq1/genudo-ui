
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface ImportedOpportunity {
  client_name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  preferred_language: string;
  preferred_dialect: string;
  isValid: boolean;
  errors: string[];
}

interface Stage {
  id: string;
  stage_name: string;
  opening_message: boolean;
}

interface ImportWizardStep2Props {
  uploadedData: ImportedOpportunity[];
  stages: Stage[];
  selectedStage: string;
  onStageChange: (stageId: string) => void;
}

const ImportWizardStep2: React.FC<ImportWizardStep2Props> = ({
  uploadedData,
  stages,
  selectedStage,
  onStageChange
}) => {
  const validOpportunities = uploadedData.filter(opp => opp.isValid);
  const invalidOpportunities = uploadedData.filter(opp => !opp.isValid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review & Confirm Data</h3>
          <p className="text-gray-600">
            Review your uploaded data and select the stage to import to.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {validOpportunities.length} Valid
          </Badge>
          {invalidOpportunities.length > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              {invalidOpportunities.length} Invalid
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="stage-select" className="text-sm font-medium">
            Select Target Stage *
          </Label>
          <select 
            id="stage-select" 
            value={selectedStage} 
            onChange={e => onStageChange(e.target.value)} 
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.stage_name} {stage.opening_message ? '(Auto Outreach)' : ''}
              </option>
            ))}
          </select>
          {selectedStage && stages.find(s => s.id === selectedStage)?.opening_message && (
            <p className="text-xs text-green-600 mt-1">
              ✅ This stage will trigger automatic outreach messages for imported opportunities
            </p>
          )}
        </div>

        {invalidOpportunities.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {invalidOpportunities.length} opportunities have validation errors and will be skipped.
              Fix the errors in your Excel file and re-upload to include them.
            </AlertDescription>
          </Alert>
        )}

        <div className="max-h-64 overflow-y-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Client Name</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Language</th>
                <th className="px-3 py-2 text-left">Dialect</th>
                <th className="px-3 py-2 text-left">Issues</th>
              </tr>
            </thead>
            <tbody>
              {uploadedData.map((opp, index) => (
                <tr key={index} className={`border-t ${opp.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td className="px-3 py-2">
                    {opp.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{opp.client_name || 'Missing'}</td>
                  <td className="px-3 py-2">{opp.phone || 'Missing'}</td>
                  <td className="px-3 py-2">{opp.preferred_language || 'Missing'}</td>
                  <td className="px-3 py-2">{opp.preferred_dialect || 'Missing'}</td>
                  <td className="px-3 py-2">
                    {opp.errors.length > 0 ? (
                      <span className="text-red-600 text-xs">
                        {opp.errors.join('; ')}
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs">✅ Valid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImportWizardStep2;
