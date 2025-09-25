# Agent-Based Job Processing System

## Overview

The agent system implements a sophisticated workflow for processing jobs using specialized agents. Each agent has specific responsibilities and handles different types of jobs.

## Architecture

### Core Components

1. **Job Inbox** (`ops/jobs/inbox/`)
   - JSON files containing job definitions
   - Jobs are processed in lexicographical order

2. **Agent Orchestrator** (`scripts/agents/orchestrator.js`)
   - Routes jobs to appropriate agents
   - Supports both explicit and automatic agent assignment

3. **Specialized Agents**
   - Developer: Feature implementation and bug fixes
   - Tester: Test execution and result recording
   - Engineer: Test result analysis and job creation
   - General: Miscellaneous coordination jobs
   - Test Author: Creates test specifications

4. **Reporting System** (`ops/reports/`)
   - Dated directories for organized reporting
   - JSONL format for easy parsing and analysis

## Job Lifecycle

1. **Creation**: Job JSON files are placed in the inbox
2. **Routing**: Orchestrator determines appropriate agent
3. **Processing**: Agent executes job-specific logic
4. **Reporting**: Results are recorded with timestamps
5. **Completion**: Jobs are moved to done/working directories

## Job Format

