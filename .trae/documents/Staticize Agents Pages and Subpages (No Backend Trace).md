## Scope
- Convert Agents list page and individual Agent pages (tabs: Overview, Knowledge Base, Settings, Automations, etc.) to a purely static UI.
- Remove all Supabase/auth/function/storage calls; no `useQuery`/`useMutation` data fetching. Keep only shadcn UI and local state.

## Targets to Clean
- Pages: `src/pages/Agents.tsx`, agent details route/page (e.g., `src/pages/AgentDetail.tsx` or equivalent).
- Components: `src/components/agents/*` (cards, tables, dialogs, knowledge tabs, file upload widgets, table grids).
- Services/hooks: `src/services/agentService.ts`, `src/services/agentKnowledgeService.ts`, `src/hooks/useAgents.ts`, `src/hooks/useAgentKnowledge.ts` (or equivalents), `src/components/agents/knowledge/*`.

## Step 1: Eliminate Supabase Traces
- Replace imports of `@/integrations/supabase/client` with static stubs or remove entirely.
- Remove `db.auth.*`, `db.from().*`, `supabase.functions.invoke`, `supabase.storage.*`, realtime channels.
- Remove all `useEffect` blocks tied to backend reads/writes; preserve UI state only.
- Scrub `supabase` and `auth` tokens project-wide in these agents-related files.

## Step 2: Static Data Handling
- Agents list page:
  - Use a local placeholder array of agents (id, name, description, avatar, is_active, language, metrics).
  - Keep filters, sorts, and toggles as visual-only; actions show toasts and mutate local state.
- Agent detail page:
  - Tabs: Overview (static metrics, recent activity placeholders), Knowledge Base (static table grid data and file list), Settings (non-functional form with local state), Automations (non-functional cards).
  - Replace uploads and training triggers with local-only toasts and client-side placeholders.
- Knowledge components:
  - Table grid shows a handful of static rows/columns.
  - Dialogs (Create table, Upload file, Create Q&A) return stub objects and append to local state.

## Step 3: UI Consistency (shadcn)
- Use shadcn primitives only (Card, Button, Input, Tabs, Table, Dialog, Popover, Select, Badge, Skeleton).
- Keep responsive layouts; ensure lists/tables use Skeletons while “loading” local state.
- Use DatePicker (no time) where needed for KB timestamps, with shadcn Calendar.

## Step 4: Types and Safety
- Update types in services/hooks to relaxed static-friendly shapes (e.g., optional fields, `any` for stub payloads where UI only displays them).
- Remove NodeJS types and replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` in agents components (if present) to avoid node typings.

## Step 5: Verification
- Run dev and navigate Agents list and detail pages; confirm no network calls and no runtime errors.
- Confirm tabs render and basic interactions (toggle active, upload stub, add KB entry) update local state and show toasts.
- Perform a quick grep for `supabase`, `auth`, `db.from`, `db.auth` in agents files to ensure full sanitization.

## Deliverables
- Updated Agents pages and components with static data only.
- Services/hooks replaced by local stubs or inlined static values.
- Zero references to Supabase/auth in the agents feature.
- Notes summarizing removed backend code paths and static data sources used.