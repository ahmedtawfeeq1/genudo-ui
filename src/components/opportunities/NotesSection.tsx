
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface NotesSectionProps {
  opportunityNotes: string;
  onNotesChange: (value: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  opportunityNotes,
  onNotesChange,
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-3">
      <FileText className="h-5 w-5 text-purple-600" />
      <h3 className="text-lg font-medium text-gray-900">Notes</h3>
    </div>
    <div className="space-y-2">
      <Label htmlFor="opportunity_notes" className="text-sm font-medium text-gray-700">
        Opportunity Notes
      </Label>
      <Textarea
        id="opportunity_notes"
        value={opportunityNotes}
        onChange={e => onNotesChange(e.target.value)}
        placeholder="Add any additional notes about this opportunity..."
        rows={4}
        className="border-gray-300 focus:border-blue-500 resize-none"
      />
    </div>
  </div>
);

export default NotesSection;
