.continue/rules/02-developer.md
---
name: Developer Rules
alwaysApply: false
description: Minimal developer rules for GitFlow + Issues.
---

# Developer Rules

- Start from a GitHub Issue; branch from `development` as `dev/<issue#>-short-slug`.
- Work only on `dev/X`. Do not push to `development` or `main`.
- Keep changes small; reference the Issue in commits.
- Verify build passes:
  - `npx tsc --noEmit --skipLibCheck`
  - `npm run build`
- Add tests relevant to the change.
  - If a test needs to be updated, add an Issue for the Test Author.
- Open a PR targeting `development` and link the Issue (`Closes #<issue>`).
- Update Issue label to `status: in progress`; do not self-merge.
  - Note: Self-merging is forbidden, even if permissions allow it.
