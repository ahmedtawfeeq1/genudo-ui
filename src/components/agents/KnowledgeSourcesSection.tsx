import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  HelpCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  Trash,
  FileSpreadsheet,
  XCircle,
  Download,
  Loader2,
  CheckCircle,
  X as XIcon,
  FileText,
  Eye,
  Table2,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from "sonner";
import {
  useKnowledgeFiles,
  useUploadKnowledgeFile,
  useCreateUrlKnowledgeFile,
  useCreateQAKnowledgeFile,
  useDeleteKnowledgeFile
} from "@/hooks/useKnowledgeFiles";
import { useTrainAgent } from "@/hooks/useAgents";
import { useKnowledgeTables } from "@/hooks/useKnowledgeTables";
import type { KnowledgeFile } from "@/types/agent";
import KnowledgeTableManager from "./knowledge/KnowledgeTableManager";

type KnowledgeSourcesSectionProps = {
  agentId: string;
};

const KnowledgeSourcesSection = ({ agentId }: KnowledgeSourcesSectionProps) => {
  // Hooks
  const { data: knowledgeFiles = [], isLoading } = useKnowledgeFiles(agentId);
  const { data: tables = [] } = useKnowledgeTables(agentId);
  const uploadFileMutation = useUploadKnowledgeFile();
  const createUrlMutation = useCreateUrlKnowledgeFile();
  const createQAMutation = useCreateQAKnowledgeFile();
  const deleteFileMutation = useDeleteKnowledgeFile();
  const trainMutation = useTrainAgent();

  // State
  const [knowledgeTab, setKnowledgeTab] = useState("structured");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const tableFileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [urlInput, setUrlInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");

  // Filter files by type
  const fileTypeFiles = knowledgeFiles.filter(f => ['excel', 'markdown', 'text'].includes(f.file_type));
  const urlTypeFiles = knowledgeFiles.filter(f => f.file_type === "website");
  const qaTypeFiles = knowledgeFiles.filter(f => f.file_type === "qa");

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'md') {
      toast.error("Only Markdown (.md) files are allowed in Text Files. For Excel files, use Structured Tables tab.");
      return;
    }

    uploadFileMutation.mutate({ agentId, file });

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBrowseTableFiles = () => {
    if (tableFileInputRef.current) {
      tableFileInputRef.current.click();
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    createUrlMutation.mutate({ agentId, url: urlInput });
    setUrlInput("");
  };

  const handleAddQA = () => {
    if (!questionInput.trim() || !answerInput.trim()) return;
    createQAMutation.mutate({ agentId, question: questionInput, answer: answerInput });
    setQuestionInput("");
    setAnswerInput("");
  };

  const handleDeleteFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFile = () => {
    if (selectedFileId) {
      deleteFileMutation.mutate({ fileId: selectedFileId, agentId });
      setShowDeleteDialog(false);
      setSelectedFileId(null);
    }
  };

  const handleTrainAgent = async () => {
    // Get all pending Excel files (file_type === 'file')
    const pendingFiles = fileTypeFiles.filter(
      f => f.status === "pending" && f.file_url
    );

    if (pendingFiles.length === 0) {
      toast.error("No files ready for training. Please upload files first.");
      return;
    }

    trainMutation.mutate({
      agentId,
      fileIds: pendingFiles.map(f => f.id),
    });
  };

  const handleTrainFile = (file: KnowledgeFile) => {
    const url = (file.public_url || file.file_url || '').toLowerCase();
    console.log('[train:file] request', { fileId: file.id, url, type: file.file_type });
    if (!url || !(url.endsWith('.md') || url.endsWith('.xlsx') || url.endsWith('.xls') || url.endsWith('.txt'))) {
      toast.error(`Training failed: Invalid file URL (${file.file_name}). Only .md, .xlsx, .xls are accepted.`);
      console.error('[train:file] blocked due to invalid extension', { url });
      return;
    }
    trainMutation.mutate({ agentId, fileIds: [file.id] });
  };

  const getStatusBadge = (status: KnowledgeFile["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Loader2 size={12} className="mr-1 animate-spin" />
            Uploading
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Pending
          </Badge>
        );
      case "training":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Loader2 size={12} className="mr-1 animate-spin" />
            Training
          </Badge>
        );
      case "trained":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle size={12} className="mr-1" />
            Trained
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XIcon size={12} className="mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(',', '');
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getFileTypeBadge = (fileType: string) => {
    const configs = {
      excel: { label: 'Excel', color: 'bg-green-100 text-green-700' },
      markdown: { label: 'Markdown', color: 'bg-blue-100 text-blue-700' },
      text: { label: 'Text', color: 'bg-gray-100 text-gray-700' },
    };
    const config = configs[fileType as keyof typeof configs] || configs.text;
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleDownloadFile = async (file: KnowledgeFile) => {
    if (!file.file_url) {
      toast.error("File URL not available");
      return;
    }

    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download file");
      console.error(error);
    }
  };

  const handleResetKnowledgeBase = async () => {
    if (knowledgeFiles.length === 0) {
      toast.error("No knowledge files to reset");
      setShowResetDialog(false);
      return;
    }

    try {
      // Delete all files one by one
      for (const file of knowledgeFiles) {
        await deleteFileMutation.mutateAsync({ fileId: file.id, agentId });
      }
      toast.success(`Successfully reset knowledge base (${knowledgeFiles.length} files deleted)`);
      setShowResetDialog(false);
    } catch (error) {
      toast.error("Failed to reset knowledge base");
      console.error(error);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Knowledge Sources</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label="Knowledge sources guide" className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  If you need to change the table config, remove the table and recreate it as you need
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs value={knowledgeTab} onValueChange={setKnowledgeTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start bg-white border-b">
              <TabsTrigger value="structured" className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                <Table2 size={16} className="mr-2" />
                Structured Tables
              </TabsTrigger>
              {/* <TabsTrigger value="tables" className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                <FileText size={16} className="mr-2" />
                Text Files
              </TabsTrigger> */}
              {/* <TabsTrigger value="website" className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                <Globe size={16} className="mr-2" />
                Web URLs
              </TabsTrigger> */}
              {/* Q&As tab removed */}
            </TabsList>

            {/* Structured Tables Tab */}
            <TabsContent value="structured" className="space-y-4">
              <KnowledgeTableManager agentId={agentId} />
            </TabsContent>

            {/* Text Files Tab commented out */}
            {/* <TabsContent value="tables" className="space-y-4"> ... </TabsContent> */}

            {/* Website Tab */}
            <TabsContent value="website" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Add Web URL</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="https://www.example.com"
                      className="w-full"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <p className="text-sm text-gray-600">
                      Add URLs to train your agent on web content.
                    </p>
                    <div className="flex justify-end">
                      <Button
                        className="bg-primary text-white"
                        onClick={handleAddUrl}
                        disabled={!urlInput.trim() || createUrlMutation.isPending}
                      >
                        {createUrlMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add URL'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* URL List */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Added URLs</h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : urlTypeFiles.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No URLs added yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {urlTypeFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="flex items-center">
                              <Globe size={16} className="mr-2 text-primary" />
                              <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {file.file_name}
                              </a>
                            </TableCell>
                            <TableCell>{formatDate(file.upload_date)}</TableCell>
                            <TableCell>{getStatusBadge(file.status)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200"
                                onClick={() => handleDeleteFile(file.id)}
                                disabled={deleteFileMutation.isPending}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Q&As content removed */}
          </Tabs>
        </CardContent>
      </Card>

      {/* Reset Knowledge Base Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Danger Zone: Reset Knowledge Base</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start bg-red-50 p-3 rounded-md">
              <AlertTriangle className="text-red-500 mr-2 mt-1" size={20} />
              <div>
                <p className="text-red-600 font-medium">
                  This action cannot be undone!
                </p>
                <p className="text-gray-700 mt-1">
                  Are you sure you want to delete <strong>all {knowledgeFiles.length} knowledge sources</strong>? 
                  This will permanently remove all uploaded files, URLs, and Q&A pairs.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-gray-600 pl-4">
              <li>• {fileTypeFiles.length} Files</li>
              <li>• {urlTypeFiles.length} URLs</li>
              {/* Q&As count removed */}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleResetKnowledgeBase}
              disabled={deleteFileMutation.isPending}
            >
              {deleteFileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Reset Knowledge Base
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start">
              <AlertTriangle className="text-amber-500 mr-2 mt-1" size={20} />
              <p className="text-red-500 font-medium">
                Are you sure you want to delete this file?
              </p>
            </div>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmDeleteFile}
              disabled={deleteFileMutation.isPending}
            >
              {deleteFileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete File'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KnowledgeSourcesSection;
