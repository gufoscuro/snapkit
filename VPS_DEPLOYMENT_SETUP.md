# VPS Deployment Setup

One-time checklist to migrate SnapKit from Forge-builds-on-VPS to GitHub Actions → GHCR → Kamal. Once this is done, day-to-day operations follow [`DEPLOY.md`](DEPLOY.md).

> **Read this end-to-end before starting.** The cutover (Phase 7) briefly puts the production site behind a freshly-deployed container — you want a rollback plan ready before you touch nginx.

---

## Prerequisites

- [ ] SSH access to the VPS as the deploy user (typically the Forge sites user, e.g. `forge`)
- [ ] Admin access to the Forge dashboard for this site (to edit nginx config, disable the daemon)
- [ ] Admin access to the GitHub repo (to add secrets and push tags)
- [ ] A trusted local machine with Docker installed and Ruby 3.x (for running Kamal locally during shadow deploy)
- [ ] The current public domain of the site — needed for smoke tests
- [ ] Sufficient disk on the VPS: at least 5GB free (for Docker images + container layers)

---

## Phase 0 — Inventory the current VPS

Don't change anything yet. Document what's there so you can revert cleanly if the cutover goes wrong.

```bash
ssh <deploy-user>@<vps>

# Note these values somewhere
which node          # current node binary
node -v             # current node version
ps aux | grep node  # is the SvelteKit process running? what port?
sudo systemctl list-units | grep -iE 'snapkit|moddo|forge' # any systemd units to be aware of
```

In the **Forge dashboard** for this site, screenshot or note:

- [ ] Current "Web Directory" path (something like `/home/forge/<site>/current/build`)
- [ ] Current daemon configuration (the command Forge uses to run `node build`, the working directory, the env vars)
- [ ] The full nginx config (Forge → Site → Nginx Configuration). **Save a copy locally** — this is the rollback artifact.

---

## Phase 1 — Install Docker engine on the VPS

```bash
ssh <deploy-user>@<vps>

# Install latest Docker engine
curl -fsSL https://get.docker.com | sh

# Add the deploy user to the docker group (no sudo required)
sudo usermod -aG docker $USER

# Apply group change in the current session
newgrp docker

# Verify
docker ps   # should print an empty table, no permission error
docker --version
```

If `docker ps` errors with permission denied, log out and back in (group membership doesn't apply mid-session in some shells).

---

## Phase 2 — Authenticate Docker to GHCR

The VPS needs a GitHub Personal Access Token to pull private images from GHCR.

1. On GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)** → Generate new token (classic).
2. Scope: **only `read:packages`**. No expiry, or set a calendar reminder to rotate.
3. Copy the token.

```bash
# On the VPS, as the deploy user
echo "<GHCR_PAT>" | docker login ghcr.io -u <github-username> --password-stdin
# Should print: Login Succeeded
```

This stores credentials in `~/.docker/config.json`. Kamal will reuse them automatically.

---

## Phase 3 — Firewall: lock port 3000 to localhost

The container will bind to `127.0.0.1:3000`, so it shouldn't be reachable externally — but defense in depth.

```bash
# If using ufw (Forge default)
sudo ufw status verbose          # check current rules
sudo ufw deny 3000/tcp           # explicit deny just in case
sudo ufw status

# If a different firewall (firewalld, iptables), apply the equivalent rule
```

Verify from outside the VPS:

```bash
# From your laptop
curl --max-time 5 http://<vps-public-ip>:3000/healthz
# Expected: connection timeout / refused
```

---

## Phase 4 — Generate the CI SSH key

The GitHub Actions runner will SSH into the VPS using a dedicated key (don't use your personal key).

On a trusted local machine:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/snapkit-ci -C "ci-deploy@snapkit" -N ""
# Two files produced: ~/.ssh/snapkit-ci (private) and ~/.ssh/snapkit-ci.pub (public)
```

Install the public key on the VPS:

```bash
# From your local machine
ssh-copy-id -i ~/.ssh/snapkit-ci.pub <deploy-user>@<vps>

# Or manually:
ssh <deploy-user>@<vps>
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "<contents-of-snapkit-ci.pub>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Test:

```bash
ssh -i ~/.ssh/snapkit-ci <deploy-user>@<vps> 'docker ps'
# Should work without a password prompt
```

**Optional but recommended — restrict the key**: prepend a `command="..."` directive in `authorized_keys` so this key can only run docker/kamal commands. Skip on the first pass; revisit during Phase 9 hardening.

---

## Phase 5 — Configure GitHub repo secrets

In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret name | Value |
|---|---|
| `SSH_PRIVATE_KEY` | Full contents of `~/.ssh/snapkit-ci` (the **private** key, including the `-----BEGIN/END-----` lines) |
| `DEPLOY_HOST` | VPS hostname or public IP |
| `API_GATEWAY_URL` | The runtime backend API URL |

`GITHUB_TOKEN` is provisioned automatically by Actions — no manual setup.

---

## Phase 6 — Fill in `config/deploy.yml` placeholders

Edit [`config/deploy.yml`](config/deploy.yml) and replace:

- `<DEPLOY_HOST>` — VPS hostname/IP (same as the GitHub secret)
- `<DEPLOY_USER>` — VPS deploy user (the one whose `authorized_keys` you populated in Phase 4)
- `<GH_USERNAME>` — GitHub user/org that owns the package (likely `moddopro`)

**For the shadow phase only**, also change:

```yaml
servers:
  web:
    options:
      publish:
        - "127.0.0.1:3001:3000"   # ← shadow port; will revert to 3000 after cutover
```

Commit these changes to a deploy branch (don't push to master yet — you don't want CI to fire on tags before the shadow run is verified).

---

## Phase 7 — First shadow deploy (manual, from your laptop)

Goal: get a Kamal-managed container running on the VPS on port 3001 **without disturbing** the live Forge daemon on its current port.

```bash
# On your local machine, in the repo root
gem install kamal -v "~> 2.0"

# Create the local secrets file (gitignored)
cp .kamal/secrets.example .kamal/secrets
# Edit .kamal/secrets — populate KAMAL_REGISTRY_PASSWORD (a GHCR PAT with read+write packages)
# and API_GATEWAY_URL

# Build and push the image (Kamal can do this, but easier to use the workflow)
# Trigger workflow_dispatch on .github/workflows/ship.yml from the GitHub UI,
# OR build locally:
docker build -t ghcr.io/moddopro/app:shadow .
docker push ghcr.io/moddopro/app:shadow

# First-time Kamal setup (idempotent)
kamal setup --version=shadow

# If setup succeeds, verify on the VPS
ssh <deploy-user>@<vps> 'curl -s http://localhost:3001/healthz'
# Expected: {"status":"OK"}

# Inspect logs
kamal app logs --follow
```

If anything fails, the **legacy Forge daemon is still running and serving traffic**. Nothing to roll back yet.

---

## Phase 8 — Cutover: switch nginx upstream

Now the live traffic switch. Have these two commands ready in separate terminals before starting:

```bash
# Terminal A — health monitor
while true; do curl -fs -o /dev/null -w "%{http_code} %{time_total}s\n" https://<your-domain>/healthz; sleep 1; done

# Terminal B — nginx rollback (paste-ready)
# (you'll have the original nginx config saved from Phase 0)
```

Steps:

1. **In Forge dashboard → Site → Nginx Configuration**: change the `upstream` block (or `proxy_pass` directive) to point at `127.0.0.1:3001` instead of the current Node port.
2. **Save**. Forge runs `nginx -t` and reloads automatically.
3. **Watch Terminal A**: `200` codes should continue uninterrupted. If you see 502/504, immediately revert the nginx config.
4. **Smoke test the site manually**: log in, navigate a list page, open a detail, do one mutation. Confirm everything works.
5. **Disable the legacy Forge daemon** (Forge dashboard → Daemons → find the SnapKit `node build` daemon → Stop). **Do NOT delete it yet** — leave it as escape hatch for ~1 week.

---

## Phase 9 — Activate CI deploys

```bash
# On master
git tag v0.3.5
git push origin v0.3.5

# Watch GitHub Actions → ship workflow
# Should complete in ~3-5 minutes:
#   1. Build image (cached, ~1-2 min)
#   2. Push to GHCR (~30s)
#   3. Kamal deploy (rolling, ~30-60s)

# After the run finishes, verify
ssh <deploy-user>@<vps> 'docker ps'
# Should show 1 container running ghcr.io/moddopro/app:v0.3.5

kamal app version  # from local
# Should report v0.3.5
```

During the deploy, Terminal A's healthcheck loop should show **zero failed requests**.

---

## Phase 10 — Cleanup (after ~1 week of stable CI deploys)

- [ ] Delete the legacy Forge daemon entry (no longer needed as escape hatch)
- [ ] Revert the shadow port: edit `config/deploy.yml` to publish on `127.0.0.1:3000:3000` again, commit, deploy. Then update Forge nginx upstream back to `:3000`. Cosmetic only — doesn't change behavior.
- [ ] Restrict the CI SSH key in `authorized_keys` with a `command="..."` directive limiting it to `docker` operations
- [ ] Set a calendar reminder to rotate the GHCR PAT used by the VPS (every 6-12 months)
- [ ] Update [`project_build_memory.md`](~/.claude/projects/-Users-lorenzofontana-Documents-js-apps-moddopro-snapkit/memory/project_build_memory.md) to mark the migration as complete

---

## Rollback playbook (during cutover)

If the cutover (Phase 8) fails:

1. **Restore nginx**: paste the original nginx config (saved in Phase 0) back into Forge's Nginx Configuration → Save.
2. **Confirm the legacy daemon is still running**: Forge dashboard → Daemons → SnapKit daemon should show "Running". If it was stopped, restart it.
3. **Verify with the health monitor**: 200s should resume.
4. **Stop the Kamal container** (it stays around but unused): `ssh <vps> 'docker stop $(docker ps -q --filter ancestor=ghcr.io/moddopro/app)'`.
5. **Investigate**: check `kamal app logs`, container env vars, `/healthz` response. Most common cause: missing `API_GATEWAY_URL` env var.
6. **Retry Phase 7-8** once the issue is fixed.

---

## Quick reference

| What | Where |
|---|---|
| Container logs | `kamal app logs --follow` |
| List containers on VPS | `ssh <vps> 'docker ps'` |
| Force-pull and restart | `kamal deploy --version=<tag>` |
| Rollback to previous tag | `kamal rollback` |
| Open shell in running container | `kamal app exec --interactive bash` |
| Run a one-off command | `kamal app exec 'node -v'` |
| See current deployed tag | `kamal app version` |
