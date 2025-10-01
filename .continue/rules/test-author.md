.continue/rules/test-author.md
---
name: Test Author Rules
alwaysApply: true
description: Minimal rules for planning/writing tests and integrating to dev.
---

# Test Author Rules

- **Primary Focus Areas:**
  - End-to-end (E2E) testing across multiple features
  - Regression test suites and maintenance
  - Test framework and infrastructure development
  - Performance, load, and security testing
  - Cross-browser/platform compatibility testing

- **Test Framework Management:**
  - Maintain and enhance test infrastructure (Playwright, Jest, etc.)
  - Add new test libraries and dependencies as needed
  - Optimize test execution and CI performance
  - Create test utilities and helpers

- **Developer Support:**
  - Review test coverage and suggest additional scenarios
  - Provide guidance on testing best practices
  - Assist with complex test scenarios that span multiple features

- **Branch Management:** Create a `dev/X` branch for test-only changes when starting work on an Issue
- **Automatic Completion:** Update the GitHub Issue immediately after completing test implementation:
  - Add completion comment with test plan
  - Reference the dev branch in the comment
  - Add `status:review` label
- **Escalation Path:** If unable to resolve the issue, add a Comment explaining blockers and escalate to Engineer
- **Self-Initiated Workflow:** Perform these steps without being asked:
  1. Create `dev/issue-X-description` branch
  2. Implement tests and verify all pass
  3. Commit changes with proper message referencing Issue
  4. Push branch to remote
  5. Create PR from dev branch to `development`
  6. Update Issue with completion status and test plan
  7. Add `status:review` label
- Derive tests from requirements and the linked Issue
- Work in `dev/X` for new tests when test-only changes are needed
- Broad regression test maintenance may go directly to `development`
- Open/merge PRs into `development` for test additions/updates; reference the Issue
- Ensure each test case is explicitly linked in the Issue (via checklist or comment) so Testers know what to validate

## Branch & Development Workflow

- **Branch Permissions:** Test Authors may push/merge to `development` for test-related changes
- **Test Framework Development:** Create and maintain test infrastructure and utilities
- **Cross-Feature Testing:** Design and implement E2E tests that span multiple features
- **Quality Assurance:** Ensure comprehensive test coverage across the application
