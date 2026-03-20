# Implementation Plan

## Phase 1

- inspect the inherited repo
- isolate AI Video Studio as the maintained internal workflow inside `apps/dashboard`
- keep the deployable app stable instead of forcing a repo-wide rewrite

## Phase 2

- align the studio domain model across TypeScript, SQL, and demo seed content
- keep the schema centered on campaigns, scenes, shots, prompt templates, generations, assets, reviews, tags, and activity log
- preserve provider isolation under `lib/providers`

## Phase 3

- build the operator dashboard flow:
  - dashboard home
  - campaigns
  - campaign detail
  - shot detail
  - assets
  - reviews
- make the shot detail page the main production workspace for metadata, prompt structure, routing, and generation history

## Phase 4

- wire a mocked generation workflow through the provider router
- persist `shot_generations` rows with placeholder provider responses
- keep the UI honest about mocked status while making the operator loop testable end to end

## Phase 5

- add real provider execution only after API access, job semantics, retries, and failure handling are approved
- add uploads and media post-processing as separate vertical slices
- extract stable shared UI into `packages/ui` once the dashboard surface settles
