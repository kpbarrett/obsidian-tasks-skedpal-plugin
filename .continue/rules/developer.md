.continue/rules/developer.md
---
name: Developer Rules
alwaysApply: true
description: Minimal developer rules for GitFlow + Issues.
---

# Developer Rules

- **Issue-Based Work:** Start from a GitHub Issue; branch from `development` as `dev/<issue#>-short-slug`
- **Branch Restrictions:** Work only on `dev/X`. Do not push to `development` or `main`
- **Development Practices:** Keep changes small; reference the Issue in commits
- **Build Verification:** Verify build passes:
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
  - Create a GitHub Issue with label `test-framework` and escalate to Test Author via Engineer
- **Pull Request Process:** Open a PR targeting `development` and link the Issue (`Closes #<issue>`)
- **Status Updates:** Update Issue label to `status:inprogress`; do not self-merge
  - Note: Self-merging is forbidden, even if permissions allow it

## Branch & Development Workflow

- **Branch Strategy:** Create feature branches from `development` for all active work
- **Permissions:** Developers may push only to `dev/X` and open PRs to `development`
- **Code Quality:** Ensure all tests pass and documentation is updated before opening PRs
- **Traceability:** Reference the Issue in all commits and PR descriptions
