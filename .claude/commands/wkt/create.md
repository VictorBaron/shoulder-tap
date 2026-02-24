# Create Worktree

## Purpose

Create a git worktree with a new branch for the given feature name, then start working on this worktree.

## Arguments

Feature name: "$ARGUMENTS"

## Process

1. **Validate input**
   If $ARGUMENTS is empty, tell the user: "Usage: /wkt <feature-name>" and stop.

2. **Derive names**
   - Branch name: convert "$ARGUMENTS" to lowercase kebab-case (spaces → hyphens, strip special chars)
   - Worktree path: `../drift-<branch-name>` (sibling directory next to the repo root)

3. **Check branch doesn't already exist**
   Run: `git branch --list <branch-name>`
   If it exists, warn the user and stop.

4. **Create branch and worktree**
   Run from the repo root:
   ```bash
   git worktree add ../drift-<branch-name> -b <branch-name>
   ```

5. **Confirm**
   Output:
   ```
   Worktree created:
     Branch: <branch-name>
     Path:   ../drift-<branch-name>
   ```

6. **Access new worktree**
 Run from the repo root:
   ```bash
   cd ../drift-<branch-name>
   ```