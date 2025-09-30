.continue/rules/02-developer.md
---
name: Developer Rules
alwaysApply: false
description: Minimal developer rules for GitFlow + Issues.
---

# Developer Rules

- **Issue-Based Work:** Start from a GitHub Issue; branch from `development` as `dev/<issue#>-short-slug`
- **Label Management:** **DO NOT** add priority or role labels to new issues
- **Escalation Process:** **Escalate to Engineer** if issue requires reassignment or priority change
- **Escalation Label:** **Only add `role: engineer` label** when escalating issues for reassignment
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
- **Status Updates:** Update Issue label to `status: in progress`; do not self-merge
  - Note: Self-merging is forbidden, even if permissions allow it

## Agentic Workflow Responsibilities

- **Issue Creation:** When creating new issues:
  - Include detailed description and requirements
  - **DO NOT** add any priority labels
  - **DO NOT** add any role labels
  - Leave the issue unassigned (no GitHub user assignment)
- **Issue Ownership:** Work on assigned issues according to priority indicated by the role label
- **Label Integrity:** Do not change priority or role labels on any issues
- **Escalation Procedure:** When escalating issues:
  - Add comment explaining need for reassignment
  - Remove existing role label and add `role: engineer` label
  - **DO NOT** assign to GitHub users - role labels indicate Engineer responsibility
  - Keep issue open (do not close)

## Branch & Development Workflow

- **Branch Strategy:** Create feature branches from `development` for all active work
- **Permissions:** Developers may push only to `dev/X` and open PRs to `development`
- **Code Quality:** Ensure all tests pass and documentation is updated before opening PRs
- **Traceability:** Reference the Issue in all commits and PR descriptions
