## 1) Current Stage Analysis
- Framework and design system: Project already uses shadcn/ui components under `src/components/ui/*` (button, input, checkbox, card, skeleton) and an app alias `@` mapped to `./src` (Vite/TS config confirms alias).
- Existing relevant UI and pages:
  - Auth-related: `src/components/auth/AuthPage.tsx` (composed login/verification flows), `EmailVerificationHelper.tsx`, `ProtectedRoute.tsx`.
  - Pipelines page: `src/pages/Pipelines.tsx` with rich UI (toolbar, list/card views, dialogs) and Supabase-derived data/functions (now being removed for staticization).
  - Shared layout: `src/components/layout/ModernLayout.tsx` (used by pages for consistent header/spacing).
- Static building blocks available: `button.tsx`, `input.tsx`, `checkbox.tsx`, `card.tsx`, `skeleton.tsx`, plus lucide icons. These cover the requested components/states for a static UI.

## 2) Login Page (Static)
- File: `src/pages/Login.tsx` (new, page component).
- Layout: Centered column within a max-width container, using `Card` for the form + descriptive header.
- Components (shadcn/ui):
  - Inputs: `Input` for email/username, `Input` for password.
  - Password visibility: trailing icon button (ghost) toggles between masked/unmasked; state only updates UI, no auth.
  - Validation UI: show inline helper/error text and input `aria-invalid` state; disabled state for submit.
  - Controls: `Checkbox` for “Remember me”.
  - Actions: `Button` for “Log in” (non-functional), secondary text link for “Forgot password?” (no navigation).
  - Social: Buttons for “Login with Google”, “Login with GitHub” (icons + neutral variants), no actions.
- Visual states: default, hover, focus, disabled, error.
- Responsive: full-width on mobile, compact card on desktop (sm→lg breakpoints). Skeleton placeholder while “loading”.
- Accessibility: labels for inputs, `aria-pressed` for visibility toggle, keyboard focus rings.
- Notes: Page-level TODO markers for future auth wiring; keep interactions purely UI state.

## 3) Pipelines Page (Static)
- Target: `src/pages/Pipelines.tsx` (refactor to strict static, keeping existing JSX, replacing data/actions).
- Top bar: filter & sort controls (Select/Combobox/Button group) — display-only; changes update local state only.
- Content:
  - Pipeline list: `Card` rows showing name, status chip, minimal metrics (placeholder numbers). Populate with local placeholder data (4–8 items).
  - Status indicators: e.g., success (green), failure (red), pending (amber) chips; respect hover/focus.
  - Actions per row: `Run`, `Edit`, `Delete` buttons (non-functional; show pressed/disabled states visually).
  - Empty state: `Card` with icon + guidance when list becomes empty.
- Loading skeletons: `Skeleton` components for rows, toolbar, and cards to mimic data fetch.
- Responsive: grid/list reflow for md/lg; ensure touch targets are large enough and accessible.
- Accessibility: `aria-label` on controls; keyboard navigation through actions.
- Notes: Keep current design language; annotate future functional points with TODO markers; preserve interactions as UI-only.

## 4) Quality Requirements (How we’ll meet them)
- ChadCN guidelines: Use existing shadcn/ui primitives (Button/Input/Checkbox/Card/Skeleton) and the project’s typography, spacing tokens.
- Responsive: Tailwind utility classes aligned to sm/md/lg/xl; container widths and flex/grid reflow.
- States: Implement disabled/active/error/hover/focus across inputs, buttons, and chips consistently.
- Skeletons: Provide per-section skeleton placeholders to avoid layout shift.
- Consistency: Shared spacing (`gap-*`, `px-*`, `py-*`), typography (`text-*`, semantic headings), and color tokens.

## 5) Delivery Process
- Page-by-page execution:
  1. Implement `Login.tsx` statically, verify visuals and interactive states (no navigation/actions).
  2. Refactor `Pipelines.tsx` for static list, filters, actions, skeletons, and empty state; ensure no backend usage.
- Documentation: Add a brief `docs/static-ui.md` outlining created components, props, UI states, and TODOs where functionality will be wired later.
- TODO markers: Insert concise TODO tags near non-functional controls (login submit, social auth, pipeline actions, filters).
- Verification: Manual interaction checks (hover/click/focus) and viewport tests to confirm responsive behavior; ensure no runtime calls are made.

If you approve, I will implement `Login.tsx` first and then refactor `Pipelines.tsx`, strictly using shadcn/ui and adding TODOs where eventual functionality will be attached.