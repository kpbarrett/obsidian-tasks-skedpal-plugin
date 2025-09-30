---
name: Agentic Development Workflow
---
# Workflow Guide

This guide explains how common development scenarios work under our **GitFlow + GitHub Issues** workflow. Each section summarizes:
- **Who acts** (Developer, Test Author, Tester, Engineer, General)
- **How to tell them what to do** (commands/prompts)
- **What to expect** (outputs, artifacts, results)

---

## 1. Feature Development (Requirements & Enhancements)

**Actors:**
- Developer implements.
- Test Author writes/updates tests.
- Tester validates.
- Engineer merges to `dev` and `main`.
- General rules enforce Issue traceability.

**How to trigger:**
- Open a new GitHub Issue (from `PROJECT_REQUIREMENTS.md` or as an `enhancement`).
- Label with `priority: high/medium/low` and assign to a Developer.

**Expected result:**
- Branch `dev/<issue#>[-shortlabel]` created from `dev`.
- Code changes implemented, tested, and PR created.
- PR merged into `dev` by Engineer.
- Issue progresses `status:inbox → status:in-progress → status:review → status:done`.
- Release notes on `main` reference the closed Issue.
- Engineers tag a release when merging `dev → main` (batch), or immediately for critical fixes.

---

## 2. Testing: Compliance, Performance, Regression

**Actors:**
- Test Author authors/updates tests.
- Tester runs tests, gathers results.
- Engineer uses failures to open corrective Issues if needed.
- Developers implement fixes.

**How to trigger:**
- Add/update a GitHub Issue with `Test Plan` details.
- For compliance/performance: Test Author commits new test suites.
- For regression: Tester runs full suite on `dev` or `main`.

**Expected result:**
- CI runs new or updated test sets.
- Failures documented in Issue comments with logs/screenshots.
- **Local failures** stay attached to the current Issue.
- **Systemic failures** → Engineer opens a new corrective Issue.
- Passing tests advance the Issue to `status:done`.

---

## 3. Issue Discovery, Triage, and Assignment

**Actors:**
- Anyone may open Issues.
- Engineer triages and sets priority.
- Developer implements.
- Test Author/Testers provide validation context.

**How to trigger:**
- Open a GitHub Issue with `status:inbox`.
- Include requirement reference, description, and acceptance criteria.

**Expected result:**
- Engineer reviews, adjusts labels/priority, and assigns.
- Developer moves Issue forward by creating a `dev/<issue#>[-shortlabel]` branch.
- Status updated automatically as work proceeds.

---

## 4. Bug Fixing

**Actors:**
- Developer implements fix.
- Test Author ensures regression tests exist.
- Tester validates fix on affected branch.
- Engineer merges once confirmed.

**How to trigger:**
- Tester or Engineer opens a GitHub Issue labeled `bug` + `status:inbox`.
- Developer branches `dev/<issue#>[-shortlabel]`.

**Expected result:**
- Fix implemented and passing CI.
- Regression test added or confirmed.
- Issue progresses to `status:review → status:done`.
- Engineer merges PR into `dev`. If critical, Engineer tags release after merge to `main`.

---

## 5. Release Management

**Actors:**
- Engineer leads and approves.
- Developers, Testers, and Test Authors support by ensuring CI is green and Issues are properly closed.

**When to cut a release:**
- **Planned cadence:** When a set of features/enhancements reaches `status:done` and CI is green, Engineer merges `dev → main` and tags a new release.
- **Critical bugfix:** Engineer may cut an emergency release directly after merging the fix into `main`, even if `dev` has not yet advanced.
- **Milestone alignment:** At the end of a phase, sprint, or agreed checkpoint, Engineer ensures all committed work is merged, tested, and released.

**How to cut a release:**
1. Ensure `dev` is green in CI (lint, unit, regression, e2e).
2. Engineer merges `dev → main` via PR.
3. Engineer creates a Git tag (semantic version or issue-driven scheme).
4. Draft release notes by linking all Issues closed since the last tag.
5. Artifacts (plugin, extension, test reports) are published to GitHub Releases or internal registry.

**Expected result:**
- A tagged `main` commit with traceable release notes.
- Reproducible artifacts available for testing and deployment.
- History clearly shows what changed and why, with references to Issue numbers.

---

## Key Expectations Across Scenarios

- **Traceability:** Every PR links to an Issue (`Closes #123`).
- **Labels:** Workflow states are tracked via labels: `status:inbox → status:in-progress → status:review → status:done`.
- **Branching:** Work happens only in `dev/<issue#>[-shortlabel]`.
- **Merges:** Developers create PRs; Engineers merge PRs into `dev` and `main`.
- **Testing & Evidence:** Every closed Issue must include evidence of validation (logs, CI run, screenshot) attached or referenced.
- **Releases:** Engineers batch `dev → main` merges and tag releases. Critical bugfixes may trigger immediate tagging.
- **Test posture:** Default to test-first for new behavior and bug fixes (acceptance test before implementation). Use short spikes only to discover approaches, then write tests and re-implement before review.
