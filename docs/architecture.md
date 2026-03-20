# Architecture

## Root stance

The repository is organized as a workspace root with a single maintained internal app in `apps/dashboard`.

This keeps the repo monorepo-friendly without forcing a premature multi-app split.

## Main boundaries

### `apps/dashboard`

Owns:

- Next.js App Router pages
- premium dark operator UI
- dashboard shell and navigation
- server actions
- route handlers

### `apps/dashboard/lib/studio`

Owns the studio read model:

- demo seed content
- repository mapping for dashboard pages
- routing logic
- prompt validation
- provider adapter implementations

### `apps/dashboard/lib/db`

Owns typed operational helpers:

- authenticated Supabase client access
- shot draft persistence
- prompt template access
- mocked shot generation writes

### `apps/dashboard/lib/providers`

Thin wrapper exports over the studio provider registry. UI and routes import from this boundary instead of reaching into provider implementations directly.

### `apps/dashboard/lib/supabase`

Owns server-safe Supabase utilities for SSR and browser auth contexts.

### `supabase`

Owns the persistence contract. The current studio schema supports:

- campaigns
- scenes
- shots
- prompt templates
- shot generations
- assets
- reviews
- tags
- asset tags
- activity log

## Why this shape

- It keeps the current working app stable.
- It makes the internal studio workflow the primary maintained product surface.
- It preserves provider isolation so credentials and raw payloads stay server-side.
- It uses real database tables and mocked provider jobs instead of fake production claims.
- It leaves room for later package extraction without blocking the operator workflow now.
