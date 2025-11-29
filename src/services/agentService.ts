import { db } from "@/lib/mock-db";
import { DEFAULT_CONFIG_METADATA } from "@/constants/aiModels";
import { uploadFileToLoopXConsole, validateFileForUpload } from "./loopxConsoleService";
import { seedDemoAgents, seedDemoKnowledge } from "@/lib/featureFlags";
import type {
  Agent,
  AgentWithRelations,
  AgentListItem,
  CreateAgentDTO,
  UpdateAgentDTO,
  AgentMetrics,
  KnowledgeFile,
  ConfigMetadata,
} from "@/types/agent";

/**
 * Class: AgentService
 * Purpose: Provide static, in-memory implementations for agent operations in UI-only mode.
 * TODO: Replace with backend API integrations for CRUD and training.
 */

// In-memory stores for static mode
const mockAgents: Agent[] = [];
const mockKnowledgeFilesByAgent: Record<string, KnowledgeFile[]> = {};
const mockMetricsByAgent: Record<string, AgentMetrics> = {};

/**
 * Sanitize filename for Storage
 * Removes special characters and spaces to create a URL-safe filename
 */
function sanitizeFilename(filename: string): string {
  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > -1 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > -1 ? filename.substring(lastDotIndex) : '';

  // Sanitize the name part:
  // 1. Replace spaces with underscores
  // 2. Remove brackets, parentheses, and other special chars
  // 3. Keep only alphanumeric, underscores, hyphens, and dots
  const sanitizedName = name
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/[[\](){}]/g, '')      // Remove brackets and parentheses
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove other special characters
    .replace(/_+/g, '_')            // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '');       // Trim underscores from start/end

  return `${sanitizedName}${extension.toLowerCase()}`;
}

// ============================================================================
// Agent CRUD Operations
// ============================================================================

/**
 * Fetch all agents for the current user
 */
export const fetchAgents = async (): Promise<AgentListItem[]> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  if (seedDemoAgents && mockAgents.length === 0) {
    const now = new Date().toISOString();
    const a1: Agent = {
      id: `ag-${Date.now()}` as any,
      name: "Sales Assistant",
      description: "Handles lead qualification and follow-ups",
      avatar: "",
      is_active: true as any,
      language: "English" as any,
      dialect: "" as any,
      created_at: now as any,
      updated_at: now as any,
      config_metadata: DEFAULT_CONFIG_METADATA as any,
      knowledge_instructions: "",
      user_id: user.id as any,
      external_agent_id: null as any,
    } as any;
    const a2: Agent = {
      id: `ag-${Date.now()+1}` as any,
      name: "Pipeline Manager",
      description: "Optimizes stage transitions and scheduling",
      avatar: "",
      is_active: true as any,
      language: "English" as any,
      dialect: "" as any,
      created_at: now as any,
      updated_at: now as any,
      config_metadata: DEFAULT_CONFIG_METADATA as any,
      knowledge_instructions: "",
      user_id: user.id as any,
      external_agent_id: null as any,
    } as any;
    mockAgents.push(a1, a2);
    mockMetricsByAgent[a1.id] = { id: `m-${Date.now()}`, agent_id: a1.id, conversations: 12, messages: 48, response_time: "0", cost: "0", created_at: now, updated_at: now } as any;
    mockMetricsByAgent[a2.id] = { id: `m-${Date.now()+1}`, agent_id: a2.id, conversations: 8, messages: 30, response_time: "0", cost: "0", created_at: now, updated_at: now } as any;
  }
  await new Promise(res => setTimeout(res, 120));
  return mockAgents.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    avatar: (a as any).avatar,
    is_active: a.is_active,
    language: (a as any).language,
    dialect: (a as any).dialect,
    created_at: a.created_at,
    updated_at: a.updated_at,
    metrics: mockMetricsByAgent[a.id] || { conversations: 0, messages: 0, cost: "0", id: "", agent_id: a.id, created_at: a.created_at, updated_at: a.updated_at, response_time: "0" },
  }));
};

/**
 * Fetch a single agent by ID with all relations
 */
export const fetchAgentById = async (agentId: string): Promise<AgentWithRelations> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  await new Promise(res => setTimeout(res, 100));
  let agent = mockAgents.find(a => a.id === agentId);
  if (!agent) {
    if (seedDemoAgents && mockAgents.length === 0) {
      const now = new Date().toISOString();
      const a1: Agent = {
        id: agentId as any,
        name: "Sales Assistant",
        description: "Handles lead qualification and follow-ups",
        avatar: "",
        is_active: true as any,
        language: "English" as any,
        dialect: "" as any,
        created_at: now as any,
        updated_at: now as any,
        config_metadata: DEFAULT_CONFIG_METADATA as any,
        knowledge_instructions: "",
        user_id: user.id as any,
        external_agent_id: null as any,
      } as any;
      mockAgents.push(a1);
      mockMetricsByAgent[a1.id] = { id: `m-${Date.now()}`, agent_id: a1.id, conversations: 0, messages: 0, response_time: "0", cost: "0", created_at: now, updated_at: now } as any;
      agent = a1;
    } else {
      const now = new Date().toISOString();
      const a: Agent = {
        id: agentId as any,
        name: "Demo Agent",
        description: "Preview only",
        avatar: "",
        is_active: true as any,
        language: "English" as any,
        dialect: "" as any,
        created_at: now as any,
        updated_at: now as any,
        config_metadata: DEFAULT_CONFIG_METADATA as any,
        knowledge_instructions: "",
        user_id: user.id as any,
        external_agent_id: null as any,
      } as any;
      mockAgents.push(a);
      mockMetricsByAgent[a.id] = { id: `m-${Date.now()}`, agent_id: a.id, conversations: 0, messages: 0, response_time: "0", cost: "0", created_at: now, updated_at: now } as any;
      agent = a;
    }
  }
  return {
    ...(agent as any),
    metrics: mockMetricsByAgent[agentId] || { conversations: 0, messages: 0, response_time: "0", cost: "0", id: "", agent_id: agentId, created_at: agent.created_at, updated_at: agent.updated_at },
    knowledge_files: mockKnowledgeFilesByAgent[agentId] || [],
  } as unknown as AgentWithRelations;
};

/**
 * Create a new agent
 */
export const createAgent = async (agentData: CreateAgentDTO): Promise<Agent> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  await new Promise(res => setTimeout(res, 120));
  const now = new Date().toISOString();
  const agent: Agent = {
    id: `ag-${Date.now()}`,
    name: agentData.name,
    description: agentData.description || "",
    avatar: (agentData as any).avatar || "",
    is_active: agentData.is_active ?? true,
    language: agentData.language || "English",
    dialect: agentData.dialect || "",
    created_at: now,
    updated_at: now,
    config_metadata: { ...DEFAULT_CONFIG_METADATA, ...(agentData as any).config_metadata } as any,
    knowledge_instructions: (agentData as any).knowledge_instructions || "",
    user_id: user.id as any,
    external_agent_id: null as any,
  } as any;
  mockAgents.unshift(agent);
  mockMetricsByAgent[agent.id] = { id: `m-${Date.now()}`, agent_id: agent.id, conversations: 0, messages: 0, response_time: "0", cost: "0", created_at: now, updated_at: now } as any;
  return agent;
};

/**
 * Update an existing agent
 */
export const updateAgent = async (agentId: string, updates: UpdateAgentDTO): Promise<Agent> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  await new Promise(res => setTimeout(res, 100));
  const idx = mockAgents.findIndex(a => a.id === agentId);
  if (idx === -1) throw new Error("Agent not found");
  const current = mockAgents[idx];
  const mergedConfig = updates.config_metadata ? { ...(current as any).config_metadata, ...(updates.config_metadata as any) } : (current as any).config_metadata;
  const updated: Agent = { ...(current as any), ...updates, config_metadata: mergedConfig, updated_at: new Date().toISOString() } as any;
  mockAgents[idx] = updated;
  return updated;
};

/**
 * Delete an agent and all its related data
 */
export const deleteAgent = async (agentId: string): Promise<void> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  await new Promise(res => setTimeout(res, 100));
  const idx = mockAgents.findIndex(a => a.id === agentId);
  if (idx !== -1) mockAgents.splice(idx, 1);
  delete mockKnowledgeFilesByAgent[agentId];
  delete mockMetricsByAgent[agentId];
};

/**
 * Toggle agent active status
 */
export const toggleAgentStatus = async (agentId: string, isActive: boolean): Promise<void> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  await new Promise(res => setTimeout(res, 80));
  const a = mockAgents.find(x => x.id === agentId);
  if (a) a.is_active = isActive as any;
};

// ============================================================================
// Knowledge Files Operations
// ============================================================================

/**
 * Upload a knowledge file to Loop-X console
 */
export const uploadKnowledgeFile = async (
  agentId: string,
  file: File,
  fileType: "excel" | "markdown" | "text"
): Promise<KnowledgeFile> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const validation = validateFileForUpload(file);
  if (!validation.valid) throw new Error(validation.error);
  const now = new Date().toISOString();
  const uploadResponse = await uploadFileToLoopXConsole(file, `twin-${agentId}`, '');
  const record: KnowledgeFile = {
    id: `kf-${Date.now()}`,
    agent_id: agentId as any,
    file_name: file.name,
    file_type: fileType,
    file_size: file.size as any,
    upload_date: now as any,
    status: "pending" as any,
    file_url: uploadResponse.path as any,
    public_url: uploadResponse.path as any,
    metadata: {
      console_id: uploadResponse.id,
      short_path: uploadResponse.short_path,
      extension: uploadResponse.extension,
      size: uploadResponse.size,
      twin_id: uploadResponse.twin_id,
      console_created_at: uploadResponse.created_at,
      console_updated_at: uploadResponse.updated_at,
    } as any,
    created_at: now as any,
    updated_at: now as any,
  } as any;
  const list = mockKnowledgeFilesByAgent[agentId] || [];
  list.unshift(record);
  mockKnowledgeFilesByAgent[agentId] = list;
  return record;
};

/**
 * Delete a knowledge file
 * Note: Files are stored in Loop-X console, so we only delete the database record
 */
export const deleteKnowledgeFile = async (fileId: string): Promise<void> => {
  const { data: { user } } = await db.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  for (const agentId of Object.keys(mockKnowledgeFilesByAgent)) {
    const list = mockKnowledgeFilesByAgent[agentId];
    const idx = list.findIndex(f => f.id === fileId);
    if (idx !== -1) {
      list.splice(idx, 1);
      mockKnowledgeFilesByAgent[agentId] = list;
      return;
    }
  }
};

/**
 * Update table instructions for a knowledge file
 * Function-level comment: persists free-text instructions in knowledge_files.table_instructions
 */
export const updateTableInstructions = async (fileId: string, instructions: string): Promise<KnowledgeFile> => {
  for (const agentId of Object.keys(mockKnowledgeFilesByAgent)) {
    const idx = mockKnowledgeFilesByAgent[agentId].findIndex(f => f.id === fileId);
    if (idx !== -1) {
      const f = mockKnowledgeFilesByAgent[agentId][idx];
      const updated = { ...(f as any), table_instructions: instructions, updated_at: new Date().toISOString() } as any;
      mockKnowledgeFilesByAgent[agentId][idx] = updated;
      return updated;
    }
  }
  throw new Error("File not found");
};

/**
 * Fetch knowledge files for an agent
 */
export const fetchKnowledgeFiles = async (agentId: string): Promise<KnowledgeFile[]> => {
  await new Promise(res => setTimeout(res, 80));
  const list = mockKnowledgeFilesByAgent[agentId] || [];
  if (seedDemoKnowledge && list.length === 0) {
    const now = new Date().toISOString();
    const demoStructured: KnowledgeFile = {
      id: `kf-${Date.now()}` as any,
      agent_id: agentId as any,
      file_name: "Customers.xlsx" as any,
      file_type: "structured_table" as any,
      file_size: 512000 as any,
      file_url: "https://example.com/console/customers.xlsx" as any,
      public_url: "https://example.com/console/customers.xlsx" as any,
      upload_date: now as any,
      status: "pending" as any,
      metadata: {
        source_name_display: "Customers",
        source_name_db: "customers",
        source_use: "customer records and deals",
        total_columns: 6,
        total_rows: 25,
        columns: [
          { name: "Name", db_name: "name", type: "string", column_use: "the Name" },
          { name: "Email", db_name: "email", type: "string", column_use: "the Email" },
          { name: "Company", db_name: "company", type: "string", column_use: "the Company" },
          { name: "Stage", db_name: "stage", type: "string", column_use: "the Stage" },
          { name: "Owner", db_name: "owner", type: "string", column_use: "the Owner" },
          { name: "Value", db_name: "value", type: "integer", column_use: "the Value" },
        ],
        indexed_column_names: ["name", "email"],
        retrieved_column_names: ["company", "stage"],
        filterable_column_names: ["stage"],
      } as any,
      created_at: now as any,
      updated_at: now as any,
    } as any;
    mockKnowledgeFilesByAgent[agentId] = [demoStructured];
    return [demoStructured];
  }
  return list;
};

/**
 * Train knowledge base with uploaded Excel files
 * This sends the files to Loop-X API for processing
 */
export const trainAgentWithFiles = async (agentId: string, fileIds: string[]): Promise<{ success: boolean; message: string }> => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  await new Promise(res => setTimeout(res, 150));
  const list = mockKnowledgeFilesByAgent[agentId] || [];
  let count = 0;
  for (const id of fileIds) {
    const idx = list.findIndex(f => f.id === id);
    if (idx !== -1) {
      list[idx] = { ...(list[idx] as any), status: "trained", metadata: { ...(list[idx] as any).metadata, trained_at: new Date().toISOString() } } as any;
      count++;
    }
  }
  mockKnowledgeFilesByAgent[agentId] = list;
  return { success: true, message: `Successfully trained ${count} file(s)` };
};

/**
 * Update knowledge file status
 */
export const updateKnowledgeFileStatus = async (fileId: string, status: KnowledgeFile["status"], errorMessage?: string): Promise<void> => {
  for (const agentId of Object.keys(mockKnowledgeFilesByAgent)) {
    const idx = mockKnowledgeFilesByAgent[agentId].findIndex(f => f.id === fileId);
    if (idx !== -1) {
      const f = mockKnowledgeFilesByAgent[agentId][idx];
      mockKnowledgeFilesByAgent[agentId][idx] = { ...(f as any), status, error_message: errorMessage } as any;
      return;
    }
  }
};

// ============================================================================
// Agent Metrics Operations
// ============================================================================

/**
 * Fetch agent metrics
 */
export const fetchAgentMetrics = async (agentId: string): Promise<AgentMetrics | null> => {
  await new Promise(res => setTimeout(res, 60));
  return mockMetricsByAgent[agentId] || null;
};

/**
 * Update agent metrics
 */
export const updateAgentMetrics = async (
  agentId: string,
  metrics: Partial<Omit<AgentMetrics, "id" | "agent_id" | "created_at" | "updated_at">>
): Promise<AgentMetrics> => {
  await new Promise(res => setTimeout(res, 80));
  const current = mockMetricsByAgent[agentId] || ({ id: `m-${Date.now()}`, agent_id: agentId, conversations: 0, messages: 0, response_time: "0", cost: "0", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any);
  const updated: AgentMetrics = { ...(current as any), ...metrics, updated_at: new Date().toISOString() } as any;
  // Normalize string fields
  updated.response_time = String(updated.response_time ?? 0);
  updated.cost = String(updated.cost ?? 0);
  mockMetricsByAgent[agentId] = updated;
  return updated;
};

// ============================================================================
// Structured Knowledge Tables Training
// ============================================================================

/**
 * Train agent with structured knowledge tables
 * Sends formatted Excel URLs to Loop-X
 */
export async function trainStructuredTables(agentId: string, tableIds: string[]): Promise<void> {
  await new Promise(res => setTimeout(res, 150));
  const list = mockKnowledgeFilesByAgent[agentId] || [];
  for (const tableId of tableIds) {
    const idx = list.findIndex(f => f.id === tableId);
    if (idx !== -1) {
      list[idx] = { ...(list[idx] as any), status: 'trained', result_message: 'Static training completed' } as any;
    }
  }
  mockKnowledgeFilesByAgent[agentId] = list;
}
