.continue/rules/01-general.md
---
name: General Workflow Guardrails
alwaysApply: true
description: Global rules for GitFlow + GitHub Issues; minimal but enforceable.
---

# General Rules

- **Requirements:** `PROJECT_REQUIREMENTS.md` is the source of truth
- **Tracking:** Every change is tied to a **GitHub Issue** with priority and acceptance criteria
  - Do not act on changes unless they are documented in a GitHub Issue
- **State:** use labels `status: inbox → in progress → review → done`
- **Agentic Workflow:** This workflow is designed for AI agents without GitHub accounts. Role labels replace GitHub user assignments to indicate which agent role is responsible for the issue
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
  - `main`: releases only (tagged by Engineers)
  - `development`: integration branch for merged bugfixes/enhancements
  - `dev/X`: ephemeral branches for active work
- **Permissions:**
  - **Developers**: push only to `dev/X`; open PRs to `development`
  - **Test Authors & Engineers**: may push/merge to `development`
  - **Engineers**: only role that merges to `main` and creates tags
  - **Testers**: may test any branch
- **Traceability:** commits and PRs reference the Issue (`Closes #123`); releases reference closed Issues

## Agentic Workflow Principles

- **Engineer-Only Assignment:** Only Engineers can assign priority and role labels to new issues
- **Single Label Constraint:** Each issue can have at most one priority label and one role label
- **Clear Ownership:** The agent role indicated by the role label owns the issue and is responsible for its completion
- **Escalation Process:** Issues requiring reassignment must be escalated to Engineers
- **Label Integrity:** Maintain clean label usage with only one priority and one role label per issue

## Escalation Procedures

### Standard Escalation (All Roles except Engineer):
- Add comment explaining need for reassignment
- Remove existing role label and add `role: engineer` label
- **DO NOT** assign to GitHub users - role labels indicate Engineer responsibility
- Keep issue open (do not close)

### Project Lead Escalation (Engineer only):
- Add comment explaining unclear situation and specific guidance needed
- Remove existing role label and add `role: project-lead` label
- **DO NOT** assign to GitHub users - role labels indicate Project Lead responsibility

## Label Management

### Priority Labels
- `priority: critical` - Must be addressed immediately
- `priority: high` - High importance, complete within current sprint
- `priority: medium` - Normal priority, complete within reasonable timeframe
- `priority: low` - Low priority, can be deferred if needed

### Role Labels
- `role: developer` - Feature implementation, bug fixes, unit/integration tests
- `role: tester` - Test execution, result recording, validation
- `role: test-author` - E2E testing, test framework, regression suites
- `role: engineer` - Releases, branch management, workflow coordination
- `role: general` - Coordination, monitoring, defaults
- `role: project-lead` - Strategic guidance, conflict resolution, process exceptions

### Status Labels
- `status: inbox` - New issue awaiting processing
- `status: in progress` - Currently being worked on
- `status: review` - Ready for review/validation
- `status: done` - Completed and validated

# Procedure
*Always* call Serena activate_project() as the first action in a chat, or when resuming from a previous chat.