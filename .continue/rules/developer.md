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
- **Test Implementation Responsibility:**
  - Write unit tests for all new functionality
  - Write integration tests for feature interactions
  - Use test-driven development (TDD) when practical
  - Ensure test coverage is comprehensive for your changes
- **Escalation to Test Author:**
  - If you discover the need for new test framework libraries or dependencies
  - If you need E2E tests that span multiple features
  - If you identify gaps in regression test coverage
  - Create a GitHub Issue with label `test-framework` and assign to Test Author
- Open a PR targeting `development` and link the Issue (`Closes #<issue>`).
- Update Issue label to `status: in progress`; do not self-merge.
  - Note: Self-merging is forbidden, even if permissions allow it.
