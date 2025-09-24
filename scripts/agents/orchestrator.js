#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import agent handlers
const processDeveloperTask = require('./developer');
const processTesterTask = require('./tester');
const processEngineerTask = require('./engineer');
const processGeneralTask = require('./general');

function routeTaskToAgent(task) {
    console.log('Routing task to appropriate agent...');

    // Determine which agent should handle this task
    if (task.agent) {
        // Task explicitly specifies an agent
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

    // Default to general for unknown task types
    return 'general';
}

function processTaskWithAgent(task) {
    const agent = routeTaskToAgent(task);
    console.log(`Task assigned to agent: ${agent}`);

    switch (agent) {
        case 'developer':
            return processDeveloperTask(task);
        case 'tester':
            return processTesterTask(task);
        case 'engineer':
            return processEngineerTask(task);
        case 'general':
            return processGeneralTask(task);
        default:
            return { success: false, message: `Unknown agent: ${agent}` };
    }
}

// Export for use in main task processor
if (require.main === module) {
    const task = JSON.parse(process.argv[2] || '{}');
    const result = processTaskWithAgent(task);
    console.log(JSON.stringify(result));
}

module.exports = {
    routeTaskToAgent,
    processTaskWithAgent
};