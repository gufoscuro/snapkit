# Deployment Architecture

This document describes how SnapKit reaches production. It is intended as a reference when making code changes that could affect the build/runtime contract — **NOT** as an operational runbook. For step-by-step deploy/rollback procedures, see `DEPLOY.md` at the repo root.

## Pipeline Overview

```
git tag v* → GitHub Actions (.github/workflows/ship.yml)
           → docker build (single-stage Dockerfile, GHA layer cache)
           → docker push ghcr.io/moddopro/app:<tag>
           → kamal deploy (SSH → VPS)
                → docker pull
                → start new container, wait for /healthz 2xx
                → swap host loopback traffic
                → stop old container
           ↑
Forge nginx (:443, SSL, firewall) → upstream 127.0.0.1:3000
```

**Key fact**: the build never runs on the VPS. The VPS only pulls a pre-built image and runs it.

## Build Contract

Code in this repo MUST satisfy these constraints to keep the pipeline working:

1. **Self-contained build**: `npm ci && npm run build` must succeed inside `node:20-slim` with no host-specific files. No symlinks to outside the repo, no assumptions about ambient tools beyond what `Dockerfile` provides.
2. **No build-time inlining of runtime config**: any value that differs between environments (API URL, feature flags, secrets) must be read at runtime via `$env/dynamic/private` or `process.env`. Never hardcode in source or read at build time. The same image runs in every environment; only env vars change.
3. **adapter-node output**: `svelte.config.js` uses `@sveltejs/adapter-node`, which emits `build/` with `node build` as the entry. Don't switch adapters without updating `Dockerfile` and `config/deploy.yml`.
4. **Build memory**: Vite build peak is ~3GB. We have an ESLint rule (`no-restricted-imports`) banning barrel imports of `@lucide/svelte` and `@tabler/icons-svelte` — these can balloon build memory. Always use `@lucide/svelte/icons/<name>` and `@tabler/icons-svelte/icons/<name>` patterns. See `eslint.config.js`.

## Runtime Contract

The container runs as a non-root user (`moddo:moddo`, UID 1500) with `node build` on port `3000`. Constraints:

1. **Port binding**: container always exposes 3000. Host-side port is configured in `config/deploy.yml` under `servers.web.options.publish`. Forge nginx upstream points to `127.0.0.1:3000` (or whichever host port is mapped).
2. **Health endpoint**: `GET /healthz` must return 2xx with no auth, no external API calls, no side effects. Kamal polls it for blue/green rollout. See [src/routes/healthz/+server.ts](src/routes/healthz/+server.ts). Don't add latency or dependencies to this route.
3. **Body size**: `BODY_SIZE_LIMIT=15M` is set in the Dockerfile and re-asserted in `config/deploy.yml`. If you need larger uploads, update both.
4. **Stateless**: the app is fully stateless. No local disk writes (the container's filesystem is ephemeral on each rolling deploy). Persistent state lives in the backend API.

## Where Things Live

- **Dockerfile**: `Dockerfile` at repo root. Multi-stage (build + runtime). The build stage runs `npm ci && npm run build`; the runtime stage copies only `build/` and `package.json`.
- **`.dockerignore`**: at repo root. Keeps the build context lean.
- **CI workflow**: `.github/workflows/ship.yml`. Triggered on `v*` tags or manual dispatch.
- **Kamal config**: `config/deploy.yml`. Defines servers, registry, healthcheck, env vars.
- **Kamal secrets**: `.kamal/secrets` (gitignored). Use `.kamal/secrets.example` as template for local runs. CI pulls equivalent values from GitHub repo secrets.
- **Health route**: `src/routes/healthz/+server.ts`.

## What NOT To Do

- ❌ **Don't add a `prebuild` step that requires network access** beyond `npm ci`. The build runs in a Docker layer with deterministic deps; calling external APIs during build breaks reproducibility and can fail in CI.
- ❌ **Don't read `process.env.X` at module top-level** for runtime-varying values (use it inside request handlers / hooks). SvelteKit pre-renders/dead-code-eliminates based on top-level env reads in some cases.
- ❌ **Don't write to the local filesystem at runtime**. Containers are ephemeral; writes are lost on every deploy. Use the backend API.
- ❌ **Don't bypass `apiRequest`** for backend calls (see `api/integration-guidelines.md`). Direct `fetch` calls won't pick up the language header / error normalization the codebase relies on.
- ❌ **Don't introduce barrel imports** of icon libraries (`@lucide/svelte` or `@tabler/icons-svelte`). ESLint enforces this; bypassing it inflates build memory and risks the VPS-side OOM regression we already fought twice.

## Forge's Role (Reduced)

Laravel Forge is intentionally limited to:

- nginx reverse proxy + Let's Encrypt SSL renewal
- ufw firewall rules
- (potentially) DB management if SnapKit ever needs one

Forge **does NOT** build or supervise the SnapKit Node process. Anything Forge-side that touched `npm`, `node`, or process supervision should be considered legacy and removed during the migration cutover.
