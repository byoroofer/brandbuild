# AI Video Studio Architecture

This document is kept for continuity with the earlier single-app scaffold. The current canonical workspace architecture is described in [architecture.md](./architecture.md).

Key update:

- the working Next.js app now lives in `apps/dashboard`
- shared workspace packages now exist under `packages/*`
- the root repo acts as the workspace orchestrator, not the app runtime root
