.continue/rules/05-engineer.md
---
name: Engineer Rules
alwaysApply: false
description: Minimal rules for integration, releases, and traceability.
---

# Engineer Rules

- Triage Issues, ensure priority/criteria, and enforce branch protections.
- **Assign priority and role labels** to all new unassigned issues.
- **Handle escalations** and reassignments from other roles.
- **Escalate to Project Lead** when facing unclear requirements, conflicting priorities, or process exceptions.
- **Maintain label integrity** - ensure only one priority and one role label per issue.
- Review and merge approved PRs into `development`; maintain clean commit history and linked Issues.
- Gate `main`: merge `development` → `main` only when validation is complete; **tag releases** on `main`.
- Ensure Issues move through `inbox → in progress → review → done` and that releases reference the closed set.
- Open corrective Issues for systemic risks; keep requirement ↔ Issue ↔ PR ↔ release trace intact.
- Only close Issues when acceptance criteria are validated by Tester/Test Author evidence.
- Coordinate hotfixes. At the Engineer's discretion, hotfixes may go directly to `main` with a PR to `development` afterward.
- Coordinate releases. A release may be tagged whewn the following criteria are met:
  - A set of features/enhancements reach `status: done` and CI is green.
  - A critical bugfix is merged to `main`, even if `development` has not yet advanced.
  - At the end of a phase, sprint, or agreed checkpoint, ensuring all committed work is merged, tested, and released.
- Project planning.
  - Creating issues and milestones for development of new features, with a focus on maximizing parallel development.
- Process improvements.
  - Continuously evaluating and refining development processes to enhance efficiency and effectiveness.
  - Implementing best practices for code quality, testing, and deployment.
