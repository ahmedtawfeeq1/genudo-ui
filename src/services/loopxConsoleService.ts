/**
 * Loop-X Console API Service
 * Static-mode implementation: builds mock results matching Loop-X response.
 * TODO: Replace with real backend integration when available.
 */

const LOOPX_CONSOLE_BASE_URL = "https://console.loop-x.co/api";

export interface LoopXConsoleUploadResponse {
  message: string;
  data: Array<{
    path: string;
    name: string;
    extension: string;
    size: string;
    twin_id: number;
    updated_at: string;
    created_at: string;
    id: number;
    short_path: string;
  }>;
}

export interface LoopXConsoleUploadParams {
  twin_external_id: string;
  files: File[];
  twin_token: string;
}

/**
 * Upload files to Loop-X console via Edge Function proxy
 * This function calls a Edge Function that handles the console API call
 * to keep the twin_token secure and avoid CORS issues
 */
export async function uploadFilesToLoopXConsole(
  params: LoopXConsoleUploadParams
): Promise<LoopXConsoleUploadResponse> {
  const results: LoopXConsoleUploadResponse['data'] = [];
  for (const file of params.files) {
    console.log(`Uploading ${file.name} (${(file.size / 1024).toFixed(1)}KB)...`);
    await new Promise(res => setTimeout(res, 100));
    const name = file.name;
    const extension = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : '';
    results.push({
      path: `/uploads/${params.twin_external_id}/${name}`,
      name,
      extension,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      twin_id: Math.floor(Math.random() * 10000),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      id: Math.floor(Math.random() * 1000000),
      short_path: `${params.twin_external_id}/${name}`,
    });
  }
  return { message: 'Files uploaded successfully', data: results };
}

/**
 * Upload a single file to Loop-X console
 */
export async function uploadFileToLoopXConsole(
  file: File,
  twinExternalId: string,
  twinToken: string
): Promise<LoopXConsoleUploadResponse['data'][0]> {
  const response = await uploadFilesToLoopXConsole({
    twin_external_id: twinExternalId,
    files: [file],
    twin_token: twinToken,
  });

  return response.data[0];
}

/**
 * Convert file size string to bytes
 * Handles formats like "26.29 KB", "1.5 MB", etc.
 */
export function parseFileSize(sizeStr: string): number {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const parts = sizeStr.trim().split(' ');

  if (parts.length !== 2) {
    return 0;
  }

  const size = parseFloat(parts[0]);
  const unit = parts[1].toUpperCase();
  const unitIndex = units.indexOf(unit);

  if (unitIndex === -1 || isNaN(size)) {
    return 0;
  }

  return Math.round(size * Math.pow(1024, unitIndex));
}

/**
 * Extract file type from extension
 */
export function getFileTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');

  switch (ext) {
    case 'xlsx':
    case 'xls':
      return 'excel';
    case 'md':
      return 'markdown';
    case 'txt':
      return 'text';
    case 'csv':
      return 'csv';
    case 'pdf':
      return 'pdf';
    default:
      return 'unknown';
  }
}

/**
 * Validate file before upload
 */
export function validateFileForUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  // Check file type
  const allowedExtensions = ['.xlsx', '.xls', '.md', '.txt', '.csv'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type ${fileExtension} is not supported. Allowed: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}
