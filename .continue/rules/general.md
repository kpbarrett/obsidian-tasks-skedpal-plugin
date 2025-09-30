.continue/rules/01-general.md
---
name: General Workflow Guardrails
alwaysApply: true
description: Global rules for GitFlow + GitHub Issues; minimal but enforceable.
---

# General Rules

- **Requirements:** `PROJECT_REQUIREMENTS.md` is the source of truth.
- **Tracking:** Every change is tied to a **GitHub Issue** with priority and acceptance criteria.
  - Do not act on changes unless they are documented in a GitHub Issue.
- **State:** use labels `status: inbox → in progress → review → done`.
- **Role Assignment:** Use role labels instead of GitHub user assignments:
  - `role: developer` - Feature implementation, bug fixes, unit/integration tests
  - `role: tester` - Test execution, result recording, validation
  - `role: test-author` - E2E testing, test framework, regression suites
  - `role: engineer` - Releases, branch management, workflow coordination
  - `role: general` - Coordination, monitoring, defaults
  - `role: project-lead` - Strategic guidance, conflict resolution, process exceptions
- **Issue Assignment Workflow:**
  - Only Engineers can assign priority and role labels to new issues
  - Other roles must leave new issues unassigned and without labels
  - Each issue can have at most one priority and one role label
  - Escalation: assign to Engineer with `role: engineer` label for reassignment
- **GitFlow branches:**
  - `main`: releases only (tagged by Engineers).
  - `development`: integration branch for merged bugfixes/enhancements.
  - `dev/X`: ephemeral branches for active work.
- **Permissions:**
  - **Developers**: push only to `dev/X`; open PRs to `development`.
  - **Test Authors & Engineers**: may push/merge to `development`.
  - **Engineers**: only role that merges to `main` and creates tags.
  - **Testers**: may test any branch.
- **Traceability:** commits and PRs reference the Issue (`Closes #123`); releases reference closed Issues.

# Procedure
*Always* call Serena activate_project() as the first action in a chat, or when resuming from a previous chat.