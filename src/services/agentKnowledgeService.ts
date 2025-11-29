import { db } from "@/lib/mock-db";
import type { KnowledgeFile } from "@/types/agent";

/**
 * Class: AgentKnowledgeService
 * Purpose: Static in-memory operations for knowledge files (URL and Q&A types).
 * TODO: Replace with backend API persistence.
 */

const knowledgeStore: Record<string, KnowledgeFile[]> = {};

/**
 * Create a URL-type knowledge file
 */
export const createUrlKnowledgeFile = async (
  agentId: string,
  url: string,
  name?: string
): Promise<KnowledgeFile> => {
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error("Invalid URL format");
  }

  const now = new Date().toISOString();
  const record: KnowledgeFile = {
    id: `kf-${Date.now()}` as any,
    agent_id: agentId as any,
    file_name: name || url,
    file_type: "website" as any,
    file_url: url as any,
    public_url: url as any,
    status: "pending" as any,
    metadata: { url, source_type: "web" } as any,
    created_at: now as any,
    updated_at: now as any,
  } as any;
  const list = knowledgeStore[agentId] || [];
  list.unshift(record);
  knowledgeStore[agentId] = list;
  return record;
};

/**
 * Create a Q&A-type knowledge file
 */
export const createQAKnowledgeFile = async (
  agentId: string,
  question: string,
  answer: string
): Promise<KnowledgeFile> => {
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!question.trim() || !answer.trim()) {
    throw new Error("Question and answer are required");
  }

  const now = new Date().toISOString();
  const record: KnowledgeFile = {
    id: `kf-${Date.now()}` as any,
    agent_id: agentId as any,
    file_name: `Q&A: ${question.substring(0, 50)}...`,
    file_type: "qa" as any,
    file_url: null as any,
    public_url: null as any,
    status: "completed" as any,
    metadata: { question, answer, source_type: "qa_pair" } as any,
    created_at: now as any,
    updated_at: now as any,
  } as any;
  const list = knowledgeStore[agentId] || [];
  list.unshift(record);
  knowledgeStore[agentId] = list;
  return record;
};

/**
 * Bulk create Q&A-type knowledge files
 */
export const createBulkQAKnowledgeFiles = async (
  agentId: string,
  qaPairs: Array<{ question: string; answer: string }>
): Promise<KnowledgeFile[]> => {
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const now = new Date().toISOString();
  const records: KnowledgeFile[] = qaPairs.map(({ question, answer }) => ({
    id: `kf-${Math.random().toString(36).slice(2)}` as any,
    agent_id: agentId as any,
    file_name: `Q&A: ${question.substring(0, 50)}...`,
    file_type: "qa" as any,
    file_url: null as any,
    public_url: null as any,
    status: "completed" as any,
    metadata: { question, answer, source_type: "qa_pair" } as any,
    created_at: now as any,
    updated_at: now as any,
  } as any));
  const list = knowledgeStore[agentId] || [];
  knowledgeStore[agentId] = [...records, ...list];
  return records;
};

/**
 * Update a knowledge file
 */
export const updateKnowledgeFile = async (
  fileId: string,
  updates: Partial<Pick<KnowledgeFile, "file_name" | "file_url" | "status" | "metadata">>
): Promise<KnowledgeFile> => {
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  for (const agentId of Object.keys(knowledgeStore)) {
    const idx = knowledgeStore[agentId].findIndex(f => f.id === fileId);
    if (idx !== -1) {
      const current = knowledgeStore[agentId][idx];
      const updated: KnowledgeFile = { ...(current as any), ...updates, updated_at: new Date().toISOString() } as any;
      knowledgeStore[agentId][idx] = updated;
      return updated;
    }
  }
  throw new Error("Knowledge file not found");
};
