#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-campaign-photo-studio}"
VISIBILITY="${VISIBILITY:-private}"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Authenticate first with: gh auth login" >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "An origin remote already exists: $(git remote get-url origin)"
  exit 0
fi

gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --push
