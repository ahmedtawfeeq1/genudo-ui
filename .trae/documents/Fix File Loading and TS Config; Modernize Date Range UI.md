## Findings
- Errors like “Cannot find module '@/components/ui/button'” stem from a narrowly-scoped `include` in `tsconfig.app.json` that excludes many existing files (e.g., `ui/select.tsx`, `ui/calendar.tsx`, `ui/popover.tsx`, pipeline settings components). With project references (`tsc -b`), the restricted `include` prevents TypeScript from loading imported modules.
- Path alias `@/*` is correctly defined in both root `tsconfig.json` and `tsconfig.app.json`, but the narrow `include` breaks resolution.
- Additional build/runtime issues observed previously:
  - `import.meta.env` typing errors suggest missing `vite/client` types.
  - Calendar header misalignment fixed in `src/components/ui/calendar.tsx` by switching to a 7‑column grid.
  - Date range picker UI requires separate From/To pickers and time selection via shadcn components.

## Plan
### 1) Resolve File Loading
- Update `tsconfig.app.json` to include the entire source tree:
  - Replace the current `include` array with `"src/**/*"` (or `"src/**/*.ts*"`).
  - Keep `extends: "./tsconfig.json"` and the `paths` alias.
- Add `types: ["vite/client"]` in `compilerOptions` of `tsconfig.app.json` to satisfy `import.meta.env` usages.
- Keep `moduleResolution: "Bundler"` for Vite + TS 5.x compatibility.
- Remove non-essential or confusing options if present (e.g., `allowImportingTsExtensions`) unless explicitly needed.

### 2) Verify and Debug
- Run `npm run dev` and confirm no more “Cannot find module” errors for:
  - `@/components/ui/{button,select,calendar,popover,badge,tabs}`
  - `@/components/layout/ModernLayout` and pipeline settings components
  - `@/lib/utils`
- Run `tsc -b` and review type-check results.
- Run `npm run build` to ensure production build passes.

### 3) Modernize Date Range UI (Visual Only)
- Keep the updated two-line design for From and To pickers using shadcn Popover + Calendar + Select.
- Ensure headers align by using the 7‑column grid in `src/components/ui/calendar.tsx`.
- Confirm time dropdowns show 15-minute increments via shadcn Select.

### 4) Cross-Env Validation
- macOS dev: `npm run dev` renders login/pipelines and date pickers correctly.
- Production build: `npm run build` succeeds with corrected tsconfig.
- Linux CI/Server: `tsc -b && vite build` passes.

### 5) Documentation
- Document in a brief note:
  - Why narrowing `include` caused missing modules.
  - What changed in `tsconfig.app.json` and why.
  - How the date picker UI composition follows shadcn best practices.

## Proposed tsconfig.app.json Changes
- compilerOptions:
  - `{ "extends": "./tsconfig.json", "compilerOptions": { "moduleResolution": "Bundler", "jsx": "react-jsx", "skipLibCheck": true, "strict": false, "baseUrl": ".", "paths": { "@/*": ["./src/*"] }, "types": ["vite/client"] } }`
- include: `"src/**/*"`

## Next Steps
- Apply the `tsconfig.app.json` changes.
- Rebuild; fix any residual type errors where `import.meta.env` is used.
- Confirm UI loads without module errors, and From/To date pickers function and display correctly.
- Provide a short change log in the repo for future reference.