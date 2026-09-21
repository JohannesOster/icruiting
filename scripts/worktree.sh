#!/usr/bin/env bash
# Create a git worktree for a ticket and link the untracked local files (.env.*, node_modules) into it,
# so the new folder is immediately runnable. Usage: scripts/worktree.sh jo-46-relative-submit
set -euo pipefail
branch="${1:?usage: scripts/worktree.sh <branch-name> [base-ref]}"
base="${2:-main}"
root="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
dest="$root/.worktrees/$branch"

git -C "$root" worktree add -b "$branch" "$dest" "$base"

for pkg in server web; do
  for f in "$root/$pkg"/.env.* ; do
    [ -e "$f" ] || continue
    rel="$pkg/$(basename "$f")"
    # tracked files (.env.example) are already in the worktree; only link the git-ignored local ones
    git -C "$root" ls-files --error-unmatch "$rel" >/dev/null 2>&1 && continue
    ln -sfn "$f" "$dest/$rel"
  done
  [ -d "$root/$pkg/node_modules" ] && ln -sfn "$root/$pkg/node_modules" "$dest/$pkg/node_modules"
done

echo "worktree ready: $dest"
echo "open it as a folder; remove with: git worktree remove $dest"
