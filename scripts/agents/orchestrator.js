#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const TaskGenerator = require('../requirements/task-generator');

// Import agent handlers
const processDeveloperTask = require('./developer');
const processTesterTask = require('./tester');
const processEngineerTask = require('./engineer');
const processGeneralTask = require('./general');

class EnhancedOrchestrator {
    constructor() {
        this.taskGenerator = new TaskGenerator();
    }

    async processRequirementsPipeline() {
        console.log('Starting requirements-driven task generation...');

        try {
            // Generate tasks from requirements
            const tasks = this.taskGenerator.generateTasksFromRequirements();
            console.log(`Generated ${tasks.length} tasks from requirements`);

            // Process each task
            const results = [];
            for (const task of tasks) {
                const result = await this.processTaskWithAgent(task);
                results.push({ task: task.id, result });
            }

            return results;
        } catch (error) {
            console.error('Error in requirements pipeline:', error);
            return { success: false, error: error.message };
        }
    }

    routeTaskToAgent(task) {
        console.log('Routing task to appropriate agent...');

        if (task.agent) {
            return task.agent;
        }

        // Auto-detect based on task type
        if (task.type === 'implement-feature' || task.type === 'fix-bug') {
            return 'developer';
        } else if (task.type === 'run-test') {
            return 'tester';
        } else if (task.type === 'analyze-test-results') {
            return 'engineer';
        } else if (task.type === 'coordinate-workflow' || task.type === 'monitor-progress') {
            return 'general';
        }

        return 'general';
    }

    async processTaskWithAgent(task) {
        const agent = this.routeTaskToAgent(task);
        console.log(`Task assigned to agent: ${agent}`);

        switch (agent) {
            case 'developer':
                return await processDeveloperTask(task);
            case 'tester':
                return await processTesterTask(task);
            case 'engineer':
                return await processEngineerTask(task);
            case 'general':
                return await processGeneralTask(task);
            default:
                return { success: false, message: `Unknown agent: ${agent}` };
        }
    }
}

// Keep original functionality for backward compatibility
function routeTaskToAgent(task) {
    const orchestrator = new EnhancedOrchestrator();
    return orchestrator.routeTaskToAgent(task);
}

function processTaskWithAgent(task) {
    const orchestrator = new EnhancedOrchestrator();
    return orchestrator.processTaskWithAgent(task);
}

// Export for use in main task processor
if (require.main === module) {
    const orchestrator = new EnhancedOrchestrator();

    if (process.argv[2] === '--requirements') {
        // Run requirements pipeline
        orchestrator.processRequirementsPipeline().then(results => {
            console.log(JSON.stringify(results, null, 2));
        });
    } else {
        // Original single-task processing
        const task = JSON.parse(process.argv[2] || '{}');
        const result = processTaskWithAgent(task);
        console.log(JSON.stringify(result));
    }
}

module.exports = {
    routeTaskToAgent,
    processTaskWithAgent,
    EnhancedOrchestrator
};