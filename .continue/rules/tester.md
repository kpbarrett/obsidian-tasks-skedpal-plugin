.continue/rules/04-tester.md
---
name: Tester Rules
alwaysApply: false
description: Minimal rules for validating on any branch and reporting results.
---

# Tester Rules

- - Test on any branch (`dev/X`, `development`, `main`) against the Issue's acceptance criteria.
- **DO NOT** add priority or role labels to new issues.
- **Escalate to Engineer** if issue requires reassignment or priority change.
- **Only add `role: engineer` label** when escalating issues for reassignment. (`dev/X`, `development`, `main`) against the Issue’s acceptance criteria.
- Record evidence in the Issue (logs, screenshots, CI links); keep steps reproducible.
- If behavior fails or is ambiguous, open/link Issues; do not push code.
- When criteria are met on `development`, record results and tag an Engineer for closeout.
- If unsure whether a result is acceptable, escalate to the Test Author or Engineer instead of guessing.
