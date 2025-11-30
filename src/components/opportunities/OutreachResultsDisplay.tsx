import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OutreachResult {
  id: string;
  opportunity_id: string;
  opportunity_name: string;
  client_name: string;
  client_phone: string;
  response_status: string;
  timestamp: string;
}

interface OutreachResultsDisplayProps {
  batchId: string;
  pipelineId: string;
  onClose?: () => void;
}

const OutreachResultsDisplay: React.FC<OutreachResultsDisplayProps> = ({
  batchId,
  pipelineId,
  onClose
}) => {
  const [results, setResults] = useState<OutreachResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchResults = async () => {
    if (!batchId) return;
    try {
      await new Promise(res => setTimeout(res, 200));
      const now = new Date();
      const sample: OutreachResult[] = [
        { id: `${batchId}-1`, opportunity_id: 'o-1', opportunity_name: 'First Deal', client_name: 'Alice Doe', client_phone: '+15550101', response_status: 'success', timestamp: new Date(now.getTime() - 60000).toISOString() },
        { id: `${batchId}-2`, opportunity_id: 'o-2', opportunity_name: 'Second Deal', client_name: 'Bob Roe', client_phone: '+15550102', response_status: 'failed', timestamp: new Date(now.getTime() - 30000).toISOString() },
        { id: `${batchId}-3`, opportunity_id: 'o-3', opportunity_name: 'Third Deal', client_name: 'Carol Poe', client_phone: '+15550103', response_status: 'pending', timestamp: now.toISOString() },
      ];
      setResults(sample);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch outreach results", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = async () => {
    try {
      await new Promise(res => setTimeout(res, 200));
      const headers = ['response_status','opportunity_name','client_name','client_phone','timestamp'];
      const rows = results.map(r => [r.response_status, r.opportunity_name, r.client_name, r.client_phone, r.timestamp].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `outreach_results_${batchId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Download Complete", description: `Downloaded ${results.length} results` });
    } catch (error: any) {
      console.error('Error downloading results:', error);
      toast({ title: "Download Failed", description: error.message || "Failed to download outreach results", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchResults();
  }, [batchId]);

  const successResults = results.filter(r => r.response_status === 'success');
  const failedResults = results.filter(r => r.response_status === 'failed');
  const pendingCount = results.filter(r => r.response_status === 'pending').length;

  const getStatusIcon = (result: OutreachResult) => {
    if (result.response_status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
    return result.response_status === 'success' ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (result: OutreachResult) => {
    const variants = {
      success: 'default',
      pending: 'secondary',
      failed: 'destructive',
      skipped: 'outline'
    } as const;

    return (
      <Badge variant={variants[result.response_status as keyof typeof variants] || 'outline'}>
        {result.response_status}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const ResultTable = ({ data, title }: { data: OutreachResult[], title: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title} ({data.length})</h3>
      </div>
      
      {/* TABLE WITH FIXED HEIGHT AND SCROLLING */}
      <div className="border rounded-lg h-64 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 border-b">
            <TableRow>
              <TableHead className="w-32">Response Status</TableHead>
              <TableHead>Opportunity Name</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Client Phone</TableHead>
              <TableHead className="w-40">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    {getStatusBadge(result)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{result.opportunity_name}</TableCell>
                <TableCell>{result.client_name}</TableCell>
                <TableCell>{result.client_phone}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatTimestamp(result.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="flex items-center">
            <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
            <span>Loading outreach results...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Outreach Results</CardTitle>
          {/* Only Download button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadResults}
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col space-y-4">
        {/* Summary Stats - Compact */}
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{successResults.length}</div>
            <div className="text-xs text-green-700">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{failedResults.length}</div>
            <div className="text-xs text-red-700">Failed</div>
          </div>
          {pendingCount > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-yellow-700">Pending</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{results.length}</div>
            <div className="text-xs text-blue-700">Total</div>
          </div>
        </div>

        {pendingCount > 0 && (
          <Alert className="flex-shrink-0">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {pendingCount} outreach requests are still being processed.
            </AlertDescription>
          </Alert>
        )}

        {/* Results Tables - Flex grow to fill remaining space */}
        <div className="flex-1 min-h-0">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="successful">Successful</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="flex-1 min-h-0 mt-4">
              <ResultTable data={results} title="All Results" />
            </TabsContent>
            
            <TabsContent value="successful" className="flex-1 min-h-0 mt-4">
              <ResultTable data={successResults} title="Successful Results" />
            </TabsContent>
            
            <TabsContent value="failed" className="flex-1 min-h-0 mt-4">
              <ResultTable data={failedResults} title="Failed Results" />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutreachResultsDisplay;
