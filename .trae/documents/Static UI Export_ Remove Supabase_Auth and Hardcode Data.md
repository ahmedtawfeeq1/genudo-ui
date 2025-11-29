## Objective
- Convert the app to a purely static UI with zero references to `supabase`, `auth`, or backend logic.
- Use `src/lib/mock-db.ts` and `src/data/*` as the only sources of static placeholders.

## What I Found
- Supabase client alias: `src/integrations/supabase/client.ts` with broad usage across hooks/services/pages/components.
- Example stubborn page: `src/pages/Pipelines.tsx` uses `initializePage`, `checkConnectorAccounts`, and `fetchPipelines` tied to Supabase.
  - `src/pages/Pipelines.tsx:82` `useEffect` runs `initializePage()` when `user` changes.
  - `src/pages/Pipelines.tsx:88–91` `initializePage()` calls `checkConnectorAccounts()` then `fetchPipelines()`.
  - `src/pages/Pipelines.tsx:93–108` `checkConnectorAccounts()` queries `connector_accounts`.
  - `src/pages/Pipelines.tsx:110–270` `fetchPipelines()` loads/enriches pipelines.
- Broad `supabase` usage mapped in hooks and services (e.g., `src/hooks/useInboxData.ts`, `src/contexts/AuthContext.tsx`).
- Static fixtures present: `src/data/agentsData.ts`, `src/data/dashboardData.ts`, `src/data/pipelineData.ts`.

## Step 1: Folder Rename
- Rename `src/integrations` to `src/backend-clients`.
- Keep existing relative import paths updated during refactors.

## Step 2: Remove Supabase Client
- Delete `src/backend-clients/supabase/client.ts`.
- Rationale: direct imports should point to static mocks or be removed where not needed.

## Step 3: Refactor Imports
- Replace all imports of `@/integrations/supabase/client` with either:
  - `import { db } from '@/lib/mock-db'` when simple placeholders are still useful, or
  - Remove the import entirely when the component becomes fully static.
- Remove any usage of `window.supabase`/global `supabase`.

## Step 4: Remove Dynamic Fetch Logic in Pages/Components
- In every page under `src/pages/*` and component under `src/components/*`:
  - Delete functions and `useEffect` blocks that call `supabase`/`db` (queries, functions, storage, realtime).
  - Keep only JSX and minimal UI state (`useState` for dialogs, tabs, filters).
- Concrete example in `src/pages/Pipelines.tsx`:
  - Remove `useEffect` at `src/pages/Pipelines.tsx:82` and `initializePage` at `src/pages/Pipelines.tsx:88–91`.
  - Delete `checkConnectorAccounts` at `src/pages/Pipelines.tsx:93–108` and `fetchPipelines` at `src/pages/Pipelines.tsx:110–270`.
  - Retain UI state and JSX; populate lists with static arrays or empty placeholders.
- Repeat similar removals for `PipelineStages.tsx`, `PipelineKanban.tsx`, `Inboxes.tsx`, `Contacts.tsx`, `Agents.tsx`, WhatsApp components, Kanban components, and Opportunity components.

## Step 5: Replace Hooks with Static Returns
- Identify hooks using `useQuery`/`useMutation` with `supabase`/`db` calls (e.g., `src/hooks/useInboxData.ts`, `src/hooks/usePipelineData.ts`, `src/hooks/useKnowledgeTables.ts`).
- Refactor each hook to return static, hardcoded data:
  - Return empty arrays or objects shaped exactly like previous outputs.
  - Where helpful for UI, import fixtures from `src/data/*`.
  - Remove side-effects, network calls, and mutations entirely.
- Result: Hooks become pure UI helpers that expose stable shapes without fetching.

## Step 6: Remove Auth and Session Logic
- Eliminate all `supabase.auth.*` references and the `AuthContext` consumer logic.
- Files: `src/contexts/AuthContext.tsx`, `src/components/auth/*`, and any `ProtectedRoute`/session-gating in `src/App.tsx`.
- Convert protected flows to always-on static UI (or simple local boolean state) with no auth gates.
- Remove user/session props/derived state; replace with neutral placeholders where types require them.

## Step 7: Final Sanitization
- Project-wide scrub for tokens: `supabase`, `auth`, `session`, `@/integrations/supabase/client`.
- Ensure only static mock imports remain (`@/lib/mock-db` and `src/data/*`).
- Confirm `src/lib/mock-db.ts` itself contains no `auth` semantics and only static stubs.

## Step 8: Validation
- Build the project and run locally to confirm:
  - No runtime errors in pages/components.
  - All UI renders using static data; no network calls made.
  - Search confirms zero matches for `supabase` and `auth`.

## Deliverables
- Modified `src/` with:
  - `src/backend-clients/` folder (renamed from `integrations`).
  - `src/backend-clients/supabase/client.ts` removed.
  - Pages/components stripped of backend calls, keeping only UI.
  - Hooks returning static fixtures or empty arrays.
  - Global references updated to use `src/lib/mock-db.ts` or fully removed.

## Notes on Code Style
- I will preserve existing conventions, types, and naming.
- Per your preference, I will add concise class-level and function-level comments where code is generated/refactored.

Please confirm this plan, and I will proceed to implement the changes and verify the build on macOS. I will ask before applying edits, then carry out the full sanitization end-to-end.