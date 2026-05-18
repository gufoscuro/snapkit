#!/usr/bin/env bash
#
# consumer-sync.sh — Sync the @diaphora/chat package from the upstream
# `diaphora` repo into a consumer project's packages/chat/ directory.
#
# TEMPLATE: copy this script into your consumer project (e.g. as
# X/scripts/sync-chat.sh) and adjust the defaults at the top of the
# file. It does NOT run sensibly inside diaphora itself.
#
# USAGE
#   ./scripts/sync-chat.sh                       # sync from local SOURCE_PATH
#   ./scripts/sync-chat.sh --source ../diaphora  # override path one-off
#   ./scripts/sync-chat.sh --ref 7850dcf         # pin to specific commit/tag/branch
#   ./scripts/sync-chat.sh --remote              # clone fresh from GitHub instead
#
# PREREQUISITES IN THE CONSUMER PROJECT
#   1. Root package.json declares  "workspaces": ["packages/*"]
#   2. If on Vite/SvelteKit: vite.config adds packages/ to server.fs.allow
#      via `searchForWorkspaceRoot(process.cwd())`.
#   3. The peer deps from packages/chat/package.json are installed in the
#      consumer (bits-ui, tailwindcss v4, tailwind-variants, clsx,
#      tailwind-merge, @lucide/svelte, @tabler/icons-svelte).
#
# WORKFLOW
#   The synced files are committed to the consumer's repo. CI never
#   talks to diaphora — it just builds the committed files. That's the
#   whole point of this bridge: no cross-project auth needed.

set -euo pipefail

# ──── Defaults — adjust for your environment ──────────────────────────
SOURCE_PATH="${DIAPHORA_PATH:-/Users/lorenzofontana/Documents/js-apps/diaphora/webapp}"
SOURCE_REMOTE="git@github.com:diaphora-ai/diaphora.git"
SOURCE_REF=""

# ──── Arg parsing ─────────────────────────────────────────────────────
USE_REMOTE=false
FORCE=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)  SOURCE_PATH="$2"; shift 2 ;;
    --ref)     SOURCE_REF="$2"; shift 2 ;;
    --remote)  USE_REMOTE=true; shift ;;
    --force)   FORCE=true; shift ;;
    -h|--help) sed -n '2,/^set -e/p' "$0" | sed 's/^# \?//'; exit 0 ;;
    *)         echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

TARGET_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$TARGET_ROOT/packages/chat"

# ──── Resolve source ──────────────────────────────────────────────────
CLEANUP=""
if $USE_REMOTE; then
  TMPDIR="$(mktemp -d)"
  CLEANUP="$TMPDIR"
  echo "==> Cloning $SOURCE_REMOTE (shallow)"
  git clone --depth=10 --quiet "$SOURCE_REMOTE" "$TMPDIR"
  SOURCE_PATH="$TMPDIR"
fi

if [[ ! -d "$SOURCE_PATH/packages/chat" ]]; then
  echo "!! Source not found: $SOURCE_PATH/packages/chat" >&2
  echo "   Set DIAPHORA_PATH or pass --source <path>, or use --remote." >&2
  exit 1
fi

if [[ -n "$SOURCE_REF" ]]; then
  echo "==> Checking out $SOURCE_REF in source"
  (cd "$SOURCE_PATH" && git fetch --quiet && git checkout --quiet "$SOURCE_REF")
fi

SOURCE_SHA="$(cd "$SOURCE_PATH" && git rev-parse HEAD)"
SOURCE_BRANCH="$(cd "$SOURCE_PATH" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'detached')"

# ──── Safety: refuse to overwrite uncommitted local changes ───────────
if ! $FORCE && [[ -d "$TARGET" ]]; then
  PENDING="$(cd "$TARGET_ROOT" && git status --porcelain packages/chat 2>/dev/null || true)"
  if [[ -n "$PENDING" ]]; then
    echo "!! Uncommitted changes in packages/chat:" >&2
    echo "$PENDING" >&2
    echo "   Commit/stash first, or pass --force to overwrite." >&2
    exit 2
  fi
fi

# ──── Sync ────────────────────────────────────────────────────────────
echo "==> Syncing packages/chat from ${SOURCE_SHA:0:8} ($SOURCE_BRANCH)"
rm -rf "$TARGET"
mkdir -p "$TARGET"
rsync -a \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='scripts' \
  "$SOURCE_PATH/packages/chat/" "$TARGET/"

# Provenance manifest
cat > "$TARGET/.synced-from.json" <<EOF
{
  "sourceRemote": "$SOURCE_REMOTE",
  "sourcePath": "$SOURCE_PATH",
  "ref": "${SOURCE_REF:-$SOURCE_BRANCH}",
  "commit": "$SOURCE_SHA",
  "syncedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "syncedBy": "$(git config user.email 2>/dev/null || echo '?')"
}
EOF

# DO-NOT-EDIT readme (overwrites whatever was there)
cat > "$TARGET/README.md" <<'EOF'
# @diaphora/chat (synced from upstream)

> **DO NOT EDIT FILES IN THIS DIRECTORY.**
>
> This package is a one-way copy from the upstream `diaphora` repo,
> kept here as a bridge until the package is extracted into its own
> repo and consumed via `npm install`.

## Source of truth

`github.com/diaphora-ai/diaphora` → `packages/chat/`

All changes must be made upstream. Sync after upstream changes:

```bash
./scripts/sync-chat.sh                # latest from default source
./scripts/sync-chat.sh --ref v0.2.0   # pin to tag/branch/SHA
./scripts/sync-chat.sh --remote       # CI-friendly: clone fresh
```

See `.synced-from.json` for the current provenance.
EOF

if [[ -n "$CLEANUP" ]]; then
  rm -rf "$CLEANUP"
fi

echo "==> Done. ${SOURCE_SHA:0:8} ($SOURCE_BRANCH) → $TARGET"
echo "    Run \`npm install\` to (re)link the workspace symlink."
