// AI Models and Providers Configuration

export const AI_MODELS = {
  openai: [
    { value: "gpt-5-2025-08-07", label: "GPT-5 (Aug 2025)" },
    { value: "gpt-5-mini-2025-08-07", label: "GPT-5 Mini (Aug 2025)" },
    { value: "gpt-5-nano-2025-08-07", label: "GPT-5 Nano (Aug 2025)" },
    { value: "gpt-4.1-2025-04-14", label: "GPT-4.1 (Apr 2025)" },
    { value: "o3-mini-2025-01-31", label: "O3 Mini (Jan 2025)" },
    { value: "o4-mini-2025-04-16", label: "O4 Mini (Apr 2025)" },
    { value: "o3-2025-04-16", label: "O3 (Apr 2025)" },
    { value: "gpt-4.1-mini-2025-04-14", label: "GPT-4.1 Mini (Apr 2025)" },
    { value: "gpt-4.1-nano-2025-04-14", label: "GPT-4.1 Nano (Apr 2025)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  cohere: [
    { value: "command-r-plus", label: "Command R Plus" },
    { value: "command-r", label: "Command R" },
    { value: "command-a-03-2025", label: "Command A (Mar 2025)" },
    { value: "command-r7b-12-2024", label: "Command R7B (Dec 2024)" },
  ],
  gemini: [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { value: "gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-flash-lite-001", label: "Gemini 2.0 Flash Lite" },
    { value: "gemini-1.5-pro-latest", label: "Gemini 1.5 Pro (Latest)" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet (Latest)" },
    { value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 Sonnet (Jun 2024)" },
    { value: "claude-3-7-sonnet-latest", label: "Claude 3.7 Sonnet (Latest)" },
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (May 2025)" },
  ],
  groq: [
    { value: "llama-3.3-70b-specdec", label: "Llama 3.3 70B SpecDec" },
  ],
  qwen: [
    { value: "qwen-plus", label: "Qwen Plus" },
    { value: "qwen-max", label: "Qwen Max" },
  ],
};

export const AI_PROVIDERS = [
  { value: "gemini", label: "Gemini" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "cohere", label: "Cohere" },
];

// For now, only OpenAI for routing and RAG agents (extensible later)
export const ROUTING_AGENT_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  // Future: { value: "anthropic", label: "Anthropic" },
];

export const RAG_AGENT_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  // Future: { value: "gemini", label: "Gemini" },
];

export const RAG_MODE_OPTIONS = [
  { value: "agentic", label: "Agentic" },
  { value: "norm", label: "Normal" },
];

export const CHAT_HISTORY_MODE_OPTIONS = [
  { value: "both", label: "Both (User & Assistant)" },
  { value: "user", label: "User Only" },
  { value: "assistant", label: "Assistant Only" },
];

// Languages available for agents
export const AGENT_LANGUAGES = [
  { value: "Multilingual", label: "Multilingual Adaptation - متعدد اللغات واللهجات" },
  { value: "Arabic", label: "Arabic" },
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
];

// Arabic dialects (shown when Arabic is selected)
export const ARABIC_DIALECTS = [
  { value: "multi", label: "Multi-Dialect (Let AI Decide!)" },
  { value: "egyptian", label: "🇪🇬 Egyptian Arabic (المصرية)" },
  { value: "saudi", label: "🇸🇦 Saudi / Gulf Arabic (الخليجية)" },
  { value: "lebanese", label: "🇱🇧 Lebanese Arabic (اللبنانية)" },
  { value: "syrian", label: "🇸🇾 Syrian Arabic (السورية)" },
  { value: "jordanian", label: "🇯🇴 Jordanian Arabic (الأردنية)" },
  { value: "palestinian", label: "🇵🇸 Palestinian Arabic (الفلسطينية)" },
  { value: "iraqi", label: "🇮🇶 Iraqi Arabic (العراقية)" },
  { value: "moroccan", label: "🇲🇦 Moroccan Arabic (الدارجة المغربية)" },
  { value: "algerian", label: "🇩🇿 Algerian Arabic (الدارجة الجزائرية)" },
  { value: "tunisian", label: "🇹🇳 Tunisian Arabic (الدارجة التونسية)" },
  { value: "libyan", label: "🇱🇾 Libyan Arabic (اللهجة الليبية)" },
  { value: "sudanese", label: "🇸🇩 Sudanese Arabic (السودانية)" },
  { value: "yemeni", label: "🇾🇪 Yemeni Arabic (اليمنية)" },
  { value: "mauritanian", label: "🇲🇷 Mauritanian Arabic (الحسانية)" },
];

// Default config metadata template with updated defaults
export const DEFAULT_CONFIG_METADATA = {
  twin_mode: "norm",
  twin_role: "master",
  twin_type: "twin_pro",
  rag_mode: "norm" as "agentic" | "norm", // Default: Normal (not Agentic)
  ai_provider: "gemini", // Default: Gemini
  model_temperature: 0.1,
  ra_ai_provider: "openai",
  rag_ai_provider: "openai",
  openai_model: "gpt-4o",
  cohere_model: "command-r-plus",
  gemini_model: "gemini-2.5-flash", // Default: Gemini 2.5 Flash
  anthropic_model: "claude-3-5-sonnet-latest",
  routing_agent_model: "gpt-4.1-2025-04-14", // GPT-4.1
  rag_agent_model: "gpt-4.1-2025-04-14", // GPT-4.1
  cohere_embedding_model: "embed-multilingual-v3.0",
  openai_embedding_model: "text-embedding-3-large",
  cohere_rerank_model: "rerank-multilingual-v2.0",
  history_days_back: 30,
  no_relevant_docs: 3,
  no_previous_concated_messages: 10,
  retrieved_columns: "question,answer", // Default columns
  rag_history_mode: "both" as "both" | "user" | "assistant", // Stored as rag_history_mode in backend, displayed as "Chat History Mode" in UI
  files_mode: "tabular_data", // Hidden field with default
};
