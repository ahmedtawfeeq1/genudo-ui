## Scope
- Do not create new files.
- Edit only existing pages to remove all backend/db calls and leave clean shadcn/ui-style static components.
- Start with Login (AuthPage) and Pipelines.

## Targets & Changes
### A) Login Page (AuthPage)
- File: `src/components/auth/AuthPage.tsx` (current login UI container).
- Remove:
  - Any `useAuth`/`supabase`/`db.auth` logic, session effects, and submit handlers.
- Keep/Refactor:
  - Inputs for email/username and password using existing `Input`.
  - Password visibility toggle with local `useState` only.
  - `Checkbox` for Remember me.
  - `Button` for Login (disabled state handled locally; no submit).
  - “Forgot password” link placeholder.
  - Social buttons (GitHub/Google) as non-functional placeholders using `Button` (icon + variant).
  - Validation/error states: set `aria-invalid` and show helper text via local state.
  - Skeleton placeholder shown briefly on mount (local state), then form.
- Result: visually complete login experience (hover/focus/disabled) with zero backend calls.

### B) Pipelines Page
- File: `src/pages/Pipelines.tsx`.
- Remove:
  - All `supabase`/`db` queries, mutations, effects, and business logic (`initializePage`, `fetchPipelines`, etc.).
- Keep/Refactor:
  - Existing toolbar and layout (`ModernLayout`, filters, view mode toggle, refresh).
  - Populate pipelines with local placeholder array (id, name, status, metrics, channel display).
  - Actions (Run/Edit/Delete) become visual only; no navigation, no data changes except local state for pressed/disabled feedback.
  - Filters/sort controls update local state only; skeletons display while “refreshing”.
  - Empty state card renders when local list is cleared.
  - Ensure event handlers have explicit types to resolve TS lint (e.g., React.MouseEvent, boolean).
- Result: static dashboard consistent with shadcn/ui, responsive, with loading skeletons and hover/focus/disabled states.

## Quality & Consistency (shadcn/ui)
- Use existing primitives: `Button`, `Input`, `Checkbox`, `Card`, `Skeleton`.
- Responsive containers (sm/md/lg) with consistent `gap`, `px`, `py`, and semantic headings.
- Implement visual states (active, disabled, error) purely via local state.
- No backend calls; no new imports of auth/client libs.

## Delivery Order
1) Edit `AuthPage.tsx` → strip backend, wire local UI state for all controls and skeleton.
2) Edit `Pipelines.tsx` → remove backend and effects, add placeholder data, skeletons, and static actions.
3) Verify TS passes for these pages; interactions render without runtime calls.

If approved, I will update those two files directly (no new files) and keep the UI as a fresh shadcn look with static interactivity only.