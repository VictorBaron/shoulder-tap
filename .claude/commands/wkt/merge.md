# Merge Worktree into Main

## Purpose

Rebase the current worktree branch onto main, merge it, then clean up the worktree and branch.

## Process

1. **Detect current context**
   Run: `git branch --show-current`
   - If this is `main`, tell the user: "Already on main — run this from inside a worktree." and stop.
   - Capture the branch name as `<branch>`.

2. **Detect repo root of main worktree**
   Run: `git worktree list`
   - Find the path of the worktree checked out on `main` — that is `<main-path>`.
   - Find the path of the current worktree — that is `<wkt-path>`.

3. **Ensure working tree is clean**
   Run: `git status --porcelain`
   If there are uncommitted changes, tell the user to commit or stash them first, then stop.

4. **Fetch latest main**
   Run: `git fetch origin main`

5. **Rebase onto main**
   Run: `git rebase origin/main`
   If the rebase fails (conflicts), tell the user to resolve conflicts and re-run `/wkt:merge`. Stop here without cleaning up.

6. **Force push if branch exists on remote**
   Run: `git ls-remote --heads origin <branch>`
   If the branch exists on remote, force push the rebased branch:
   ```bash
   git push --force-with-lease origin <branch>
   ```

7. **Fast-forward main**
   Switch to the main worktree and fast-forward (no merge commit):
   ```bash
   cd <main-path>
   git merge --ff-only <branch>
   ```
   If `--ff-only` fails (it shouldn't after a successful rebase), tell the user and stop without cleaning up.

8. **Clean up**
   Run from `<main-path>`:
   ```bash
   git worktree remove <wkt-path>
   git branch -d <branch>
   ```

9. **Confirm**
   Output:
   ```
   Merged and cleaned up:
     Branch: <branch>  →  main
     Worktree removed: <wkt-path>
   ```
