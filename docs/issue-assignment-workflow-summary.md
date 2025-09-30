# Issue Assignment Workflow - Summary of Changes

## Overview

This document summarizes the key changes made to the issue assignment workflow to implement Engineer-controlled prioritization and assignment.

## Key Changes Implemented

### 1. Engineer-Only Label Assignment
- **Before**: Any role could add priority and role labels
- **After**: Only Engineers can assign priority and role labels to new issues
- **Rationale**: Centralized control ensures consistent prioritization and proper role assignment

### 2. Single Label Constraint
- **Before**: Multiple priority or role labels could exist on an issue
- **After**: Each issue can have at most one priority label and one role label
- **Rationale**: Clean, unambiguous assignment and prioritization

### 3. Escalation Process
- **Before**: No formal escalation process for reassignment
- **After**: Structured escalation to Engineer with `role: engineer` label
- **Rationale**: Clear path for issues that need different priority or role assignment

### 4. Ownership Model
- **Before**: Unclear ownership of unassigned issues
- **After**: Engineer owns unassigned issues; assignee owns assigned issues
- **Rationale**: Clear responsibility for issue progression

## Workflow Rules

### For Non-Engineer Roles (Developer, Tester, Test Author, General):
- Create issues with detailed descriptions
- **DO NOT** add priority or role labels
- Leave issues unassigned
- Work on assigned issues according to priority
- Escalate to Engineer if reassignment needed
- **Only allowed label action**: Add `role: engineer` when escalating

### For Engineer Role:
- Monitor unassigned issues
- Assign appropriate priority and role labels
- Assign issues to appropriate roles
- Handle escalations and reassignments
- Maintain label integrity (single priority/role per issue)

## Label Usage

### Priority Labels (Engineer Only)
- `priority: critical` - Immediate action required
- `priority: high` - Complete within current sprint
- `priority: medium` - Normal priority
- `priority: low` - Can be deferred

### Role Labels (Engineer Only)
- `role: developer` - Feature implementation, bug fixes
- `role: tester` - Test execution, result recording
- `role: test-author` - Test creation, test design
- `role: engineer` - Analysis, job generation, releases
- `role: general` - Coordination, monitoring, defaults

### Escalation Label (All Roles)
- `role: engineer` - Only label non-Engineers can add, used for escalation

## Escalation Procedure

1. **Current Owner**: Add comment explaining need for reassignment
2. **Current Owner**: Assign issue to Engineer
3. **Current Owner**: Remove existing role label, add `role: engineer` label
4. **Current Owner**: Keep issue open
5. **Engineer**: Re-evaluate priority and role assignment
6. **Engineer**: Update labels and reassign if needed

## Updated Documentation

1. **`./docs/issue-assignment-workflow.md`** - Detailed workflow rules
2. **`./docs/role-assignment-procedure.md`** - Updated with new workflow
3. **`./.continue/rules/general.md`** - Added workflow rules
4. **`./.continue/rules/engineer.md`** - Added Engineer responsibilities
5. **`./.continue/rules/developer.md`** - Added workflow constraints
6. **`./.continue/rules/tester.md`** - Added workflow constraints
7. **`./.continue/rules/test-author.md`** - Added workflow constraints

## Benefits

1. **Consistent Prioritization**: Engineers ensure consistent priority assignment across all issues
2. **Clear Ownership**: Every issue has a clear owner (Engineer for unassigned, assignee for assigned)
3. **Controlled Workflow**: Structured process prevents label chaos
4. **Proper Escalation**: Clear path for issues needing reassignment
5. **Label Integrity**: Clean, meaningful label usage throughout the system

## Compliance

- All agents must follow these workflow rules
- Orchestrator will validate label usage
- Engineers are responsible for workflow enforcement
- Regular audits of label usage and assignment patterns

## Next Steps

1. **Team Training**: Ensure all team members understand new responsibilities
2. **Process Monitoring**: Track escalation requests and resolution times
3. **Continuous Improvement**: Review process effectiveness quarterly
4. **Tool Enhancement**: Consider GitHub Actions for automated validation