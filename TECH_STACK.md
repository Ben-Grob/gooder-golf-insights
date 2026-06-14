# Gooder Golf Insights — Current Tech Stack

## Core Platform

- **Language:** TypeScript
- **UI Framework:** React 19
- **Framework:** `@tanstack/react-start`
- **Bundler / Dev Server:** Vite
- **Package Manager / Runtime:** Bun (`bun.lock`, `bunfig.toml`)
- **Deployment Target:** Cloudflare Workers via `@cloudflare/vite-plugin` and `wrangler.jsonc`

## Routing and Data

- `@tanstack/react-router`
- `@tanstack/react-query`
- `@tanstack/router-plugin`

## Styling

- Tailwind CSS v4
- `@tailwindcss/vite`
- `tailwind-merge`
- `tw-animate-css`

## Forms and Validation

- `react-hook-form`
- `@hookform/resolvers`
- `zod`

## UI and Component Libraries

- Radix UI packages for primitives
- `lucide-react`
- `cmdk`
- `input-otp`
- `embla-carousel-react`
- `react-resizable-panels`
- `recharts`
- `sonner`

## Utilities

- `clsx`
- `class-variance-authority`
- `date-fns`
- `react-markdown`
- `vaul`
- `vite-tsconfig-paths`

## Linting and Formatting

- ESLint
- Prettier
- `eslint-config-prettier`
- `eslint-plugin-prettier`
- TypeScript ESLint integrations

## Tooling Notes

- `@lovable.dev/vite-tanstack-config` provides opinionated Vite configuration for the app.
- Cloudflare/Vite integration is handled by the existing build setup.
- The project already includes a dedicated `src/lib/golf-knowledge-base.ts` used for AI grounding.
