import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Download, ExternalLink, Clock, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
 

interface OutreachConfigurationTabProps {
  pipelineId: string;
  userId: string;
}

interface OutreachBatch {
  batch_id: string;
  created_at: string;
  total_count: number;
  successful_count: number;
  failed_count: number;
}

const OutreachConfigurationTab: React.FC<OutreachConfigurationTabProps> = ({
  pipelineId,
  userId
}) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [batches, setBatches] = useState<OutreachBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [downloadingBatch, setDownloadingBatch] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setWebhookUrl("");
    setBatches([]);
    setLoadingBatches(false);
  }, [pipelineId]);

  const fetchPipelineSettings = async () => {};

  const fetchOutreachBatches = async () => {};

  const handleSaveWebhook = async () => {
    setSaving(true);
    toast({ title: "Success", description: "Outreach webhook URL updated (static)" });
    setSaving(false);
  };

  const downloadBatchResults = async (batchId: string) => {
    setDownloadingBatch(batchId);
    const csv = 'id,status\n1,success\n2,failed';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `outreach_${batchId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Complete", description: "Downloaded static outreach results" });
    setDownloadingBatch(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Outreach Configuration
          </CardTitle>
          <CardDescription>
            Configure the webhook URL for bulk outreach operations. If not set, the default system webhook will be used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Outreach Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-endpoint.com/outreach"
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              This webhook will receive outreach requests for opportunities in this pipeline.
            </p>
          </div>
          
          <Button onClick={handleSaveWebhook} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Webhook URL
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Outreach Results
          </CardTitle>
          <CardDescription>
            Download reports from recent bulk outreach operations. Results are automatically cleaned up after download.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBatches ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading results...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Results Available</h3>
              <p className="text-sm text-gray-500">
                Run a bulk outreach operation to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.batch_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        Batch {batch.batch_id.slice(0, 8)}...
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {batch.total_count} total • {batch.successful_count} successful • {batch.failed_count} failed
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBatchResults(batch.batch_id)}
                    disabled={downloadingBatch === batch.batch_id}
                  >
                    {downloadingBatch === batch.batch_id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OutreachConfigurationTab;
