/**
 * Loop-X API Service
 * Handles integration with Loop-X knowledge base training API
 */

const LOOPX_API_BASE_URL = "https://api.loop-x.co/api/v1";

export interface TrainKnowledgeBaseRequest {
  files: string[]; // Array of direct URLs to Excel files
  twin_id: string; // External agent ID (TWIN_ID)
}

export interface TrainKnowledgeBaseResponse {
  data: {
    status: number;
    message: string;
    data: {
      twin_name: string;
      twin_id: string;
    };
  };
}

/**
 * Train knowledge base with Excel files
 * @param files - Array of direct URLs to Excel files (must end with .xlsx)
 * @param twinId - External agent ID (TWIN_ID) from Loop-X
 * @returns Response from Loop-X API
 */
export async function trainKnowledgeBase(
  files: string[],
  twinId: string
): Promise<TrainKnowledgeBaseResponse> {
  const response = await fetch(`${LOOPX_API_BASE_URL}/create-db/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files,
      twin_id: twinId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to train knowledge base: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  // Check if the response indicates success
  if (data.data?.status !== 200) {
    throw new Error(
      data.data?.message || "Knowledge base training failed with unknown error"
    );
  }

  return data;
}

/**
 * Check if a URL is a valid direct file URL ending with .xlsx, .xls, or .md
 */
export function isValidTrainingFileUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.pathname.endsWith(".xlsx") ||
      urlObj.pathname.endsWith(".xls") ||
      urlObj.pathname.endsWith(".md") ||
      urlObj.pathname.endsWith(".txt")
    );
  } catch {
    return false;
  }
}

// Keep backward compatibility
export const isValidExcelUrl = isValidTrainingFileUrl;

/**
 * Validate training request before sending to Loop-X
 */
export function validateTrainingRequest(
  files: string[],
  twinId: string
): { valid: boolean; error?: string } {
  if (!files || files.length === 0) {
    return { valid: false, error: "At least one file is required" };
  }

  if (!twinId || twinId.trim() === "") {
    return {
      valid: false,
      error: "TWIN_ID (external_agent_id) is required for training",
    };
  }

  // Validate all files are direct URLs ending with .xlsx, .xls, or .md
  const invalidFiles = files.filter((url) => !isValidTrainingFileUrl(url));
  if (invalidFiles.length > 0) {
    return {
      valid: false,
      error: `Invalid file URLs (must end with .xlsx, .xls, .md, or .txt): ${invalidFiles.join(", ")}`,
    };
  }

  return { valid: true };
}
