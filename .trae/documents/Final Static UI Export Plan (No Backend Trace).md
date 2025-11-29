## Objective
Convert the entire `src/` directory into a purely static UI template with zero references to Supabase, auth, or backend logic. All features render with mock data and local-only interactions, matching a clean Shadcn Studio export.

## Structural Renaming
- Rename `src/integrations` → `src/backend-clients` (one-time filesystem refactor)
- Remove any imports to `src/backend-clients/supabase/client.ts` and delete that file entirely

## Global Backend Removal
- In `src/lib/mock-db.ts` ensure no `window.supabase = ...` assignment exists (already removed)
- Confirm no global Supabase fallback remains anywhere

## Hooks: Convert To Static Data (No `db`, No Fetch)
Replace implementations with hardcoded returns. Do not import `db`; return plain arrays/objects.
- Pipeline/Settings: `usePipelinesData`, `usePipelineSettingsData` → return `[ { id: 'pipe-1', pipeline_name: 'Sales' } ]` and minimal metrics/stages arrays
- Inbox: `useInboxData` → return `{ conversations: [...], messages: [...], notes: [...] }` with helpers as no-ops
- Kanban: `useKanbanData`, `useKanbanDragDrop` → return `stages`, `opportunities`; drag handlers modify local arrays only
- Follow-ups: `useOpportunityFollowUps` → static upcoming/active lists; mutations are no-ops
- Auth/Profile: `useProfile` → static user object; no token/session
- Messaging/Realtime: `useRealtimeMessages`, `useModernChat`, `useSessionManager` → local-only lists; remove channels/subscriptions
- Enum/Media: `useEnumValues`, `useSignedMediaUrl` → static enums and deterministic URLs
- Generated/Magic Pipeline: `useGeneratedPipelines` → static pipeline card; remove realtime
- Knowledge Tables: `useKnowledgeTables` → static tables and in-memory edit/delete
- Bulk Outreach: `useBulkOutreach` → return a success structure

### Hook Output Pattern
Use simple factory returns:
- Example `useAgents`: `export const useAgents = () => ({ data: [{ id: 'agent-001', name: 'Static Agent' }], isLoading: false, error: null });`
- Example `useInboxData`: return `{ conversations, getMessages: (id)=>[...], addNote: async ()=>true }`

## Pages & Components: Decouple From Backend
Remove all `useEffect` data-fetch logic & service imports; render with mock data.

### Pipelines & Settings
- `pages/Pipelines.tsx`, `pages/PipelineStages.tsx`, `pages/PipelineSettings.tsx` → no fetching; use static pipeline/stage arrays; save/delete show toasts
- Pipeline settings components (already partly static): verify `StageRoutingRulesSection.tsx`, `SettingsTab.tsx`, `RoutingInstructionsSection.tsx`, `PipelineSettingsHeader.tsx`, `OutreachConfigurationTab.tsx`, `ChannelReconnectDialog.tsx`, `AIConfigurationTab.tsx` have no backend imports and only local state

### Kanban
- `pages/PipelineKanban.tsx` → consume static `stages`/`opportunities`; filters and drag-drop act on local state
- `components/kanban/*`:
  - `useStageModalForm.ts` → local-only stage create/edit with autosave; seed agents statically
  - `useStageActions.ts` → list/toggle/delete purely local
  - `KanbanCard.tsx` → remove auth/lookup; navigate with toasts; static cost
  - `DeleteStageDialog.tsx` → local-only success toast; call parent refresh

### Agents & Knowledge
- `pages/Agents.tsx`, `AgentDetail.tsx` → remove all fetches; static agent list/detail
- `components/agents/knowledge/*` → static table cards/grid and actions; manage fields in local arrays

### Inbox
- `pages/Inboxes.tsx` → no session gate or realtime; render static conversations/messages; filters act on local arrays
- `components/inbox/*` → `ContactDetailsPanel.tsx`, `OpportunityTagsSection.tsx`, `MessageInput.tsx` use local state and toasts

### Opportunities
- `components/opportunities/*` → `UnifiedOpportunityModal.tsx`, `OpportunityForm.tsx`, and `hooks/useOpportunityForm.tsx` become local-only forms using static pipelines/stages/contacts; submit → success toast
- Import wizard (`import-wizard/*`) → replace function/rpc calls with static progress simulation and in-memory results

### Magic Pipeline / Chat
- `components/magic-pipeline/MagicBuildButton.tsx`, `chat/ChatMessages.tsx`, `EnhancedChatPanel.tsx` → static chat transcript and pipeline mock; remove channels; local append only

### WhatsApp/Messenger Connectors
- `components/messenger/MessengerConnectDialog.tsx` → static page list and connect
- `components/whatsapp/*` → `WhatsAppConnectionDialog.tsx`, `WhatsAppConnectionFlow.tsx`, `DeleteChannelDialog.tsx`, `SwitchChannelDialog.tsx`, `ConnectionStatusListener.tsx` simulate connection/reconnect with local state and toasts; no function invocations
- `pages/WhatsAppSuccess.tsx` → preserve UI, remove backend imports; if needed, use minimal internal stubs or local mock transitions

### Contacts
- `pages/Contacts.tsx`, `components/contacts/CreateContactDialog.tsx` → static list and create form; filters run locally

## Services & Utils: Neutralize
- Replace all methods in `src/services/*` and `src/utils/*` with static returns and no-ops; delete any exports not used by UI
  - `tableDataService.ts`, `loopxConsoleService.ts`, `agentService.ts`, `agentKnowledgeService.ts`, `knowledgeTableService.ts`
  - `outreachCleanup.ts`, `opportunityWebhook.ts`, `conversationLookup.ts`, `webhookConfig.ts`

## Removal & Scrub Passes
1) Remove all imports referencing `src/services/*` from pages/components
2) Remove all references to `useAuth` and `supabase` (now `db`) across UI code
3) Delete unused files in `src/backend-clients/supabase/*` if present
4) Grep checks:
   - `supabase`, `db.auth`, `useAuth`, `functions.invoke`, `.rpc(`, `channel(`, `removeChannel(`

## Verification
- Grep `src/**` to confirm no occurrences of `supabase`
- `npm run dev` must start with zero console errors; pages render with static placeholders and Shadcn components
- Navigate primary flows (Pipelines, Kanban, Agents, Inbox, Contacts) and confirm actions are local-only and show toasts

## Deliverables
- Fully sanitized `src/` with:
  - Static hooks (no `db` usage)
  - Pages/components that render static UI without effects/resolvers
  - Services/utils replaced with stubs
  - No references to Supabase/Auth/Realtime

## Notes
- Keep UI composition entirely intact; only replace data/providers and side-effects
- Prefer small helper constants (e.g., `const demoPipelines = [...]`) close to components for clarity
- Document static seeds in code with clear names (no comments added unless required by your rules)