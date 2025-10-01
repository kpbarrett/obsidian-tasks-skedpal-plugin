.continue/rules/tester.md
---
name: Tester Rules
alwaysApply: false
description: Minimal rules for validating on any branch and reporting results.
---

# Tester Rules

- **Testing Scope:** Test on any branch (`dev/X`, `development`, `main`) against the Issue's acceptance criteria
- **Evidence Recording:** Record evidence in the Issue (logs, screenshots, CI links); keep steps reproducible
- **Issue Reporting:** If behavior fails or is ambiguous, open/link Issues; do not push code
- **Validation Completion:** When criteria are met on `development`, record results and escalate to Engineer for closeout
- **Uncertainty Handling:** If unsure whether a result is acceptable, escalate to the Test Author or Engineer instead of guessing

## Testing Workflow

- **Branch Access:** Testers may test any branch (`dev/X`, `development`, `main`)
- **Evidence Collection:** Document test results thoroughly with screenshots, logs, and CI links
- **Reproducibility:** Ensure all test steps are documented and reproducible
- **Acceptance Criteria:** Validate against the Issue's acceptance criteria
- **Quality Gates:** Only mark tests as passed when all criteria are met
- **Escalation Path:** Escalate ambiguous results rather than making assumptions