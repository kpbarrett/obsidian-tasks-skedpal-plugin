.continue/rules/04-tester.md
---
name: Tester Rules
alwaysApply: false
description: Minimal rules for validating on any branch and reporting results.
---

# Tester Rules

- **Testing Scope:** Test on any branch (`dev/X`, `development`, `main`) against the Issue's acceptance criteria
- **Label Management:** **DO NOT** add priority or role labels to new issues
- **Escalation Process:** **Escalate to Engineer** if issue requires reassignment or priority change
- **Escalation Label:** **Only add `role: engineer` label** when escalating issues for reassignment
- **Evidence Recording:** Record evidence in the Issue (logs, screenshots, CI links); keep steps reproducible
- **Issue Reporting:** If behavior fails or is ambiguous, open/link Issues; do not push code
- **Validation Completion:** When criteria are met on `development`, record results and escalate to Engineer for closeout
- **Uncertainty Handling:** If unsure whether a result is acceptable, escalate to the Test Author or Engineer instead of guessing

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

## Testing Workflow

- **Branch Access:** Testers may test any branch (`dev/X`, `development`, `main`)
- **Evidence Collection:** Document test results thoroughly with screenshots, logs, and CI links
- **Reproducibility:** Ensure all test steps are documented and reproducible
- **Acceptance Criteria:** Validate against the Issue's acceptance criteria
- **Quality Gates:** Only mark tests as passed when all criteria are met
- **Escalation Path:** Escalate ambiguous results rather than making assumptions