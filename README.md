# API Data Normaliser

A browser-based developer tool that takes raw JSON from one or more API responses and spits out normalised JSON, TypeScript interfaces, and a React Query hook — all at once, all client-side.

---

**Live demo:** [Api Normaliser](https://www.apinormaliser.com/) — no login required

---

## What this is

Working with real APIs — especially when you're integrating two or three at once — means a lot of tedious reshaping before you can write any UI. `snake_case` keys from one service, `PascalCase` from another, nested objects that don't match your state shape, duplicate fields across responses. The normalisation step is pure boilerplate every time.

This tool makes that step instant. Paste your raw JSON responses into labelled inputs, and the right panel updates live with the merged, camelCase-normalised output, a generated TypeScript `interface`, and a typed React Query hook that wraps it. You can also load from a `.json` file directly if copy-pasting is annoying.

The non-obvious part: the TypeScript generation is structural, not just `Record<string, unknown>`. It walks the normalised object recursively and inlines nested types inline rather than flattening them to primitive buckets. The generated React Query hook has real types injected into it — the `injectTypesIntoHook` function in `app/page.tsx` regex-replaces the placeholder interface in the generated hook template with the actual derived types. The output is copy-pasteable into a real project without any manual editing.

## What makes this different

**Stateless, zero-latency transformation.** Every normalisation runs in a `useMemo` keyed on the input array. There's no debounce, no API call, no loading state — the output panel updates on every keystroke. This was a deliberate choice: the tool should feel instantaneous, and there's no reason to defer pure computation to a server.

**Per-key transformation tracking.** `convertKeysToCamelCase` doesn't just rename keys — it records every transformation with its full dot-notation path (`user.profile.first_name → user.profile.firstName`). The `TransformationSummary` component surfaces these as expandable badges. You can see exactly what changed and where, which matters when you're working with large payloads and need to audit the normalisation.

**Duplicate resolution is explicit.** When multiple inputs share a key, the merge keeps the last value and the stats counter shows how many were resolved. This is intentional — the UI doesn't silently hide collisions, it counts them and you can use the Compare tab to inspect the before/after.

**Hook injection, not concatenation.** The React Query hook generator starts with a fixed template that has a typed placeholder interface. Rather than appending the types above the hook (which results in two disconnected blocks to copy), `injectTypesIntoHook` replaces the placeholder in-place. The output is a single coherent file.

**No server, no backend, no credentials.** Everything runs in the browser. Vercel Analytics and Speed Insights are included for deployment monitoring, but neither sends payload data anywhere.

## Features

**Input**
- Add, remove, and rename multiple JSON input panels
- Inline JSON validation with per-field error messages on every keystroke
- Load from a `.json` file via file picker (resets input value after load so the same file can be re-selected)

**Normalisation**
- Converts all keys recursively to camelCase (`snake_case`, `kebab-case`, `PascalCase` → camelCase)
- Merges multiple API responses into a single object
- Counts and reports duplicate keys resolved, nested objects preserved, and arrays preserved

**Output tabs**
- **Normalised** — prettified, syntax-highlighted JSON with line numbers
- **Types** — a generated `export interface ApiResponse` with structural inline types for nested objects and arrays
- **Hook** — a typed `useApiData` React Query hook with the real types injected (not a stub)
- **Compare** — toggle between original and normalised to see what changed
- **Info** — human-readable list of every transformation applied, with rationale

**UI**
- Copy-to-clipboard on every code block with a 2-second confirmation state
- Transformation summary bar: APIs merged / keys transformed / duplicates removed
- Expandable key-transformation detail showing each rename with original → new path
- Responsive layout: split-panel on desktop, stacked on mobile

## Tech stack

| Layer | What | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Single-page tool with no routing needs, but App Router gives layout-level metadata and font loading out of the box |
| Language | TypeScript 5.7 | The tool generates TypeScript — dogfooding the language made the type generation logic easier to reason about |
| Styling | Tailwind CSS v4 | Utility classes for a tight, single-file component model without a separate CSS layer |
| Components | Radix UI primitives + shadcn/ui | Accessible, unstyled primitives for tabs, tooltips, and dialogs without reimplementing keyboard nav |
| Syntax highlighting | react-syntax-highlighter (Prism) | Custom One Dark theme tuned to `#0d1117` to match the GitHub-dark aesthetic of the code panels |
| Icons | Lucide React | Consistent stroke-weight icon set with tree-shakeable imports |
| Analytics | Vercel Analytics + Speed Insights | Zero-config Core Web Vitals monitoring on the Vercel deployment |
| Fonts | Geist + Geist Mono (Google Fonts via next/font) | Same font family as the Next.js default, mono variant used in code surfaces |

## Architecture

```
api-normaliser/
├── app/
│   ├── layout.tsx          # Root layout — sets page metadata, OG tags, fonts, analytics providers
│   ├── page.tsx            # Single page component — owns all state, drives both panels
│   └── globals.css         # CSS variables for the design system (background, border, primary colours)
│
├── components/
│   ├── InputPanel.tsx      # Left panel — manages the list of JSON input textareas and file upload
│   ├── JsonInput.tsx       # Individual editable JSON input with inline error display
│   ├── OutputPanel.tsx     # Right panel — tabbed view of all generated outputs
│   ├── CodeBlock.tsx       # Syntax-highlighted code viewer with copy-to-clipboard
│   ├── TransformationSummary.tsx  # Stats bar + expandable key-rename detail
│   ├── ThemeProvider.tsx   # next-themes wrapper (scaffolded but dark mode not fully wired in)
│   └── ui/                 # shadcn/ui primitive wrappers (Button, Tabs, etc.)
│
├── lib/
│   ├── normalizer.ts       # All transformation logic — camelCase conversion, merging, type generation, hook generation
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
│
└── hooks/
    ├── useMobile.ts        # Breakpoint hook for responsive layout decisions
    └── useToast.ts         # Toast notification state (imported from shadcn/ui)
```

**Data flow:**

```
User types JSON
      │
      ▼
handleInputChange (page.tsx)
  → validateJson() per keystroke
  → sets error on input if invalid
      │
      ▼
useMemo [inputs] (page.tsx)
  → filters to valid, non-empty inputs
  → normalizeJson(validInputs)
      ├── convertKeysToCamelCase() — recursive key rename + track transformations
      ├── mergeObjects()            — spread merge, count duplicates
      ├── countNestedObjects()      — structural stat
      └── countArrays()            — structural stat
  → generateFullTypeScript(normalized)   — recursive type inference
  → generateReactQueryHook("ApiResponse")
  → injectTypesIntoHook()               — regex replace placeholder with real types
      │
      ▼
OutputPanel receives derived values as props
  → renders into tab: Normalised / Types / Hook / Compare / Info
```

## Running locally

1. Clone the repository:
   ```bash
   git clone https://github.com/HelloKol/api-normaliser.git
   cd api-normaliser
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

There are no environment variables required to run the app. The `NEXT_PUBLIC_FRONTEND_MODEL_TITLE` variable in `next.config.mjs` is a label string included at build time — it's not sensitive and has a default value.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts Next.js dev server with Turbopack at `localhost:3000` |
| `npm run build` | Compiles production bundle (`ignoreBuildErrors: true` is set — see notes below) |
| `npm run start` | Serves the production build locally |
| `npm run lint` | Runs ESLint across the project |

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FRONTEND_MODEL_TITLE` | No | Display label string for the generated data model. Defaults to `"Frontend-ready data model"`. Set at build time via `next.config.mjs`, not `.env`. |

No secrets, no API keys, no database connections. The tool is entirely client-side.

## Technical decisions worth mentioning

**`useMemo` over a state machine for output.**
The entire output — normalised JSON, TypeScript, React Query hook — is derived from the inputs array inside a single `useMemo`. I considered a separate "run" action (a button that triggers normalisation) but rejected it. The inputs are validated on every keystroke anyway, so deferring the output step adds latency with no benefit. Invalid inputs are filtered before entering the pipeline, so the memo is safe to run continuously. The tradeoff is that very large JSON payloads (tens of thousands of keys) could block the main thread — a worker-based approach would be the right fix at scale.

**Recursive type inference without a schema.**
`generateTypeScript` infers types purely from the runtime values in the normalised object. It doesn't know what the API "should" look like — it infers from what it sees. Arrays use the first element's type to infer the item type (`T[]`), which means heterogeneous arrays produce inaccurate types. A real implementation would union all element types. The current approach covers 90% of real-world API responses where arrays are homogeneous, and it keeps the logic simple enough to read in one sitting.

**`injectTypesIntoHook` regex replacement.**
The hook generator produces a template with a placeholder `export interface ApiResponse`. Rather than generating the types separately and leaving the developer to compose them, `injectTypesIntoHook` uses a regex to find and replace that placeholder with the real interface derived from the normalised data. If the match fails, it prepends the types. This makes the output a self-contained file you can drop into a `src/hooks/` directory without editing. The risk is that if the template changes and the regex no longer matches, it silently falls back to prepending — which is semantically correct but visually inconsistent.

**Per-input validation vs. global parse.**
Each JSON input validates itself independently on every change, with its own error state. The normalization pipeline (`useMemo`) does a second parse pass on all inputs, filtering out any that are empty or invalid before merging. This double-parse is intentional: the first validates for display, the second guards the pipeline. The alternative — sharing parsed state between the validation layer and the pipeline — would require lifting the parsed value up and complicating the input model. The redundant parse is cheap; keeping the concerns separate is worth it.

**`ignoreBuildErrors: true` in `next.config.mjs`.**
This was set during development to unblock iteration and has not been removed. The project has type errors that would fail a strict `tsc` check (primarily in the shadcn/ui component wrappers). For a deployed tool with no auth or data persistence, this is a low-risk shortcut. For any project with a backend or real user data, this setting should be removed and the errors fixed.

## Accessibility

The output tabs use Radix UI's `Tabs` primitive, which implements the ARIA tabs pattern (roving tabindex, `role="tablist"`, `aria-selected`). Code blocks are rendered in `div` containers rather than `pre`/`code` elements — this is a limitation of `react-syntax-highlighter`'s default output, and keyboard-only users cannot select text in the code panels without a mouse. Copy-to-clipboard via button is keyboard accessible and has a visible focus ring via Tailwind's `ring` utilities.

No formal WCAG audit has been run. Colour contrast in the dark theme was eyeballed against VS Code's One Dark theme, not tested against WCAG 2.1 AA ratios.

## Things I'd do differently at scale

**Type inference from multiple array elements.** The current implementation infers array item types from `array[0]` only. For a real tool, you'd want to union all element types in the sample data: `string | number | null` instead of just `string`. This requires a merge step for inferred types, which adds meaningful complexity but is the correct behaviour.

**Web Worker for the transformation pipeline.** `normalizeJson`, `generateFullTypeScript`, and `injectTypesIntoHook` all run synchronously on the main thread inside a `useMemo`. For large payloads (1,000+ keys, deeply nested), this will block rendering. Moving the pipeline to a `Worker` with `postMessage` would keep the UI responsive at the cost of async complexity — worth it once input payloads grow past a few hundred keys.

**Schema-aware conflict resolution.** When two API responses have the same key with different value types (e.g., `id: 42` vs `id: "uuid-abc"`), the current merge silently keeps the last value. A proper implementation would detect type conflicts and either surface a warning or generate a union type (`number | string`). This is the single most common failure case for the tool in real-world use.

**Persistent state between sessions.** The inputs are ephemeral — refreshing the page clears everything. `localStorage` serialization of the inputs array would be a two-line addition to `page.tsx` but would make the tool significantly more useful for iterative workflows where you're refining a transformation over multiple sessions.

**E2E tests for the generation pipeline.** The `normalizer.ts` functions are pure and have no side effects — they're ideal candidates for unit tests. A test suite covering camelCase edge cases (`_leading_underscore`, `SCREAMING_SNAKE`, mixed delimiters), the type inference for nested objects and arrays, and the hook injection regex would catch regressions quickly. The current project has zero tests.

## Licence

MIT
