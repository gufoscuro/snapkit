# Deployment Runbook

Day-to-day guide for shipping SnapKit to production.

- **First-time VPS migration**: see [`VPS_DEPLOYMENT_SETUP.md`](VPS_DEPLOYMENT_SETUP.md)
- **Architectural overview** (build/runtime contract, why the pipeline is the way it is): see [`.blueprints/infrastructure/deployment.md`](.blueprints/infrastructure/deployment.md)

## TL;DR

```bash
# Ship a release
git tag v0.3.5
git push origin v0.3.5
# → ship.yml builds, pushes to GHCR, Kamal deploys with /healthz blue-green

# Rollback
kamal rollback   # local, requires .kamal/secrets populated
```

## How a deploy works

1. You push a tag matching `v*` (e.g. `v0.3.5`).
2. `.github/workflows/ship.yml` runs:
   - Builds the Docker image with GitHub Actions layer cache.
   - Pushes to `ghcr.io/moddopro/app:<tag>` (also tagged `sha-<short>` and `latest`).
   - Installs Kamal, SSHes into the VPS, runs `kamal deploy`.
3. Kamal performs a rolling deploy on the VPS:
   - Pulls the new image.
   - Starts a new container.
   - Polls `GET /healthz` until 2xx (max ~2 minutes).
   - Swaps host loopback traffic to the new container.
   - Stops the old container.

Total time: typically 3–5 minutes from `git push` to "new version live".

## Rollback

```bash
# From your local machine (requires .kamal/secrets populated — see .kamal/secrets.example)
kamal rollback                    # reverts to the previous tag
kamal rollback --version=v0.3.4   # explicit target
```

Rollback is a fast image-tag swap — back online in ~30s. Old images stay available in GHCR until you prune them.

## Local Kamal usage (for ad-hoc operations)

You don't normally need to run Kamal yourself; CI does it. But for inspection or manual rollback:

```bash
# One-time
gem install kamal -v "~> 2.0"
cp .kamal/secrets.example .kamal/secrets   # then populate

# Common commands
kamal app version           # what tag is currently deployed
kamal app logs --follow     # tail container logs
kamal app exec --interactive bash   # shell into the running container
kamal deploy --version=v0.3.5       # manual deploy (CI normally does this)
```

## Required GitHub Repo Secrets

Configured under **Settings → Secrets and variables → Actions** during the initial migration:

| Secret | Purpose |
|---|---|
| `SSH_PRIVATE_KEY` | Private key the runner uses to SSH into the VPS |
| `DEPLOY_HOST` | VPS hostname or IP |
| `PUBLIC_API_GATEWAY` | Backend API gateway base URL (runtime env var; read via `$env/dynamic/public`, no trailing `/api`) |

`GITHUB_TOKEN` is automatic. Setting up these secrets is covered in [`VPS_DEPLOYMENT_SETUP.md`](VPS_DEPLOYMENT_SETUP.md).

## Troubleshooting

**Deploy hangs on healthcheck**: the new container is starting but `/healthz` isn't responding. Check `kamal app logs --follow`. Common causes: missing env var, app crash on boot, regression in `/healthz` route.

**`docker pull` fails on VPS with 403**: GHCR auth expired. SSH into the VPS and re-run `docker login ghcr.io` with a fresh PAT (`read:packages` scope).

**Kamal complains about SSH known_hosts**: `ssh-keyscan -H <DEPLOY_HOST> >> ~/.ssh/known_hosts` from the box running Kamal.

**Image too large**: check `.dockerignore`. The runtime image should be ~150MB (just `build/` + `node:20-slim` runtime). If it ballooned, something leaked into the build context.

**Build OOM in CI**: shouldn't happen on 16GB runners. If it does, the build is regressing — first check for new barrel imports of icon libraries (ESLint enforces no-barrel for `@lucide/svelte` and `@tabler/icons-svelte`, but new heavy deps can sneak in). See [`memory/project_build_memory.md`](~/.claude/projects/-Users-lorenzofontana-Documents-js-apps-moddopro-snapkit/memory/project_build_memory.md) for history.

**The site is down and Kamal isn't responding**: SSH into the VPS, `docker ps -a` to see container state, `docker logs <container-id>` for the latest crash. As a last resort, restart the container manually: `docker restart <container-id>`. If the image itself is broken, re-deploy a known-good tag with `kamal deploy --version=<previous-tag>`.
