---
name: Artifact build environment
description: Environment-specific build behavior for the monorepo's managed web artifacts.
---

Managed artifact workflows inject `PORT` and `BASE_PATH`, while a direct Vite build from the shell does not. A manual build must provide both values explicitly; otherwise the Vite config intentionally fails before compilation.

**Why:** The artifact routing depends on the workflow's assigned port and path prefix, so the app must not guess or silently fall back.

**How to apply:** Prefer the artifact workflow for runtime verification. When a direct build is needed, provide the workflow-equivalent variables for the target artifact.