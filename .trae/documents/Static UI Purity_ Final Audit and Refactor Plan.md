## Research Summary: Shadcn ("Chad CN Studio") Export Readiness

1) Backend Integration Capabilities
- UI components in `src/components/ui/*` are framework-agnostic (Radix + Shadcn patterns). They are immediately reusable with any backend.
- Data-facing code sits outside UI primitives in pages/hooks/services, which currently reference mock clients and function invocations.

2) Architecture & Interfaces
- Modern patterns: React, Shadcn UI, Radix primitives, `react-hook-form` (see `src/components/ui/form.tsx`), `sonner` toasts.
- Types are defined (e.g., `src/types/agent.ts`) and used broadly in services and hooks.
- State management hooks exist but several are coupled to `react-query` and a mock `db` client.
- Auth scaffold exists but is stubbed (`src/contexts/AuthContext.tsx`), and components like `AuthPage.tsx` are static by design.

3) Compatibility & Required Modifications
- Components are compatible with Express/Go/Python APIs, but you must:
  - Replace service-layer mock calls with REST/GraphQL adapters
  - Remove `db.functions` and `db.auth` usage from application code
  - Implement `AuthContext` against your auth provider (JWT/OAuth) and pass user/session via context

4) Refactoring Effort Estimate
- REST/GraphQL: Moderate. Hooks already follow `react-query` patterns, so swapping `queryFn/mutationFn` to call your backend is straightforward once services are rewritten.
- Data fetching logic: Moderate. Convert hooks to static now (see plan below) and later rewire to your backend endpoints.
- Auth flows: Moderate. `AuthPage.tsx` and `PasswordResetForm.tsx` require replacing `db.auth.*` with your API (`/login`, `/signup`, `/password-reset`).
- State management: Low–Moderate. Most components use local state; backend integration adds fetch/error/loading but UI is already designed to show loading/empty states.

5) Recommendation
- The Shadcn UI layer is production-ready for backend integration.
- The application-level hooks and services need a cleanup to become pure-static, then a later rewire to REST/GraphQL.
- Proceed with static-purity refactor now (below), then swap service adapters per backend.

6) Additional Information Needed (for backend integration planning)
- API contract: endpoints, payloads, pagination, error formats
- Auth scheme: JWT/OAuth, token lifetimes, refresh strategy
- File storage: upload endpoints, signed URL policy, media proxy paths
- Realtime: whether you require WebSocket/SSE; channel naming and event schema
- Rate limits and batching constraints

## Current Audit Findings (Codebase)
- `supabase`: 0 hits
- `db.auth`: 8 hits in application code (must be removed)
  - `src/components/profile/PasswordResetForm.tsx:42` (updateUser)
  - `src/components/auth/EmailVerificationHelper.tsx:33` (resend)
  - `src/hooks/useKnowledgeTables.ts:48` (getUser)
  - `src/services/agentService.ts` multiple (getUser)
  - `src/services/knowledgeTableService.ts:226` (getUser)
  - `src/services/agentKnowledgeService.ts` multiple (getUser)
  - `src/pages/WhatsAppSuccess.tsx` multiple (getSession/onAuthStateChange)
  - `src/lib/mock-db.ts` (allowed – mock only)
- `db.functions.invoke`: 9 files (must be removed from UI code)
  - e.g., `src/pages/WhatsAppSuccess.tsx`, `src/services/tableDataService.ts`, `src/hooks/useBulkOutreach.ts`, `src/components/inbox/MessageInput.tsx`
- `useMutation`: 8 files (convert to instant-success mocks or static helpers)
- `ws://` or `wss://`: 0 hits
- Image assets: Local logo path already used (e.g., `src/components/auth/AuthPage.tsx:318`, `src/components/layout/ModernSidebar.tsx:57`)

## Refactor Plan: Make UI 100% Static & Decoupled

### 1) File Structure Sanitization
- Confirm `src/backend-clients` exists (done)
- Remove any `src/backend-clients/supabase/client.ts` remnants (none present)
- Review `src/services/*`; keep only static helpers; remove anything unused by UI

### 2) Remove Backend Coupling
A) Eliminate `db.auth` in application code
- `PasswordResetForm.tsx` → local success toast only
- `EmailVerificationHelper.tsx` → local resend counter only
- `agentService.ts`, `agentKnowledgeService.ts`, `knowledgeTableService.ts` → remove `getUser` checks; use in-memory stores
- `WhatsAppSuccess.tsx` → remove `getSession/onAuthStateChange`; purely local page-state

B) Remove `db.functions.invoke`
- `tableDataService.ts` → return static rows and paging, no remote
- `useBulkOutreach.ts` → local result: `{ success: true, processed: n }`
- `MessageInput.tsx` → call `onSendMessage` only; simulate success/toasts
- All WhatsApp connector components → local-only transitions

C) Convert hooks to pure static
- Replace `useQuery/useMutation` with simple returns and local handlers
- Hooks to address: `useAgents.ts`, `useKnowledgeFiles.ts`, `useKnowledgeTables.ts`, `useInboxData.ts`, `usePipelineData.ts`, `useOpportunityFollowUps.ts`, `useRealtimeMessages.ts`, `useEnumValues.ts`, `useSignedMediaUrl.ts`, `useBulkOutreach.ts`

D) Pages: remove fetching side-effects
- `pages/*` with `useEffect` that calls services should be simplified to local state
- Notable: `pages/WhatsAppSuccess.tsx`, `pages/OpportunityDetail.tsx` (uses `db.from`)

### 3) UI Consistency
- Ensure all images use `/genudo-main-logo.png`
- Maintain Shadcn components as-is (no API coupling inside UI primitives)

### 4) Final Verification
- Grep must pass:
  - `supabase`: 0
  - `db.auth`: only inside `src/lib/mock-db.ts` (mock definitions)
  - `useMutation`: 0 (or mocked helpers with no network)
  - `db.functions.invoke`: 0
  - `ws://` or `wss://`: 0

## Backend Integration Guide (Post-Static Purity)
- Reintroduce `react-query` around typed service adapters:
  - Example: `agentService.fetchAgents()` → `GET /api/agents` (Express/Go/Python)
- Implement `AuthContext` against your backend auth (JWT or OAuth); pass `{ user, token }` to components
- Replace `tableDataService` calls with your REST/GraphQL models; align types in `src/types/*`
- Adopt a single HTTP client (e.g., `fetch` wrapper) and error normalization; add global toasts for UX

## Request
Please approve this refined plan to proceed with code edits. If you prefer, share your backend API contracts (endpoints and payloads) so I can generate service adapters alongside the static-purity refactor. 