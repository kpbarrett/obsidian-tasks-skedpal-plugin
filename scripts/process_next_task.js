#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the orchestrator for agent-based task processing
const { processTaskWithAgent } = require('./agents/orchestrator');

function processNextTask() {
    const rootDir = process.cwd();
    const inboxDir = path.join(rootDir, 'ops/tasks/inbox');
    const doneDir = path.join(rootDir, 'ops/tasks/done');
    const workingDir = path.join(rootDir, 'ops/tasks/working');
    const reportsBaseDir = path.join(rootDir, 'ops/reports');

    // Ensure directories exist
    [doneDir, workingDir, reportsBaseDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Get lexicographically highest .json file
    let taskFiles = [];
    try {
        taskFiles = fs.readdirSync(inboxDir)
            .filter(file => file.endsWith('.json'))
            .sort()
            .reverse();
    } catch (error) {
        console.error('Error reading inbox directory:', error.message);
        return;
    }

    if (taskFiles.length === 0) {
        console.log('No tasks found in inbox');
        return;
    }

    const taskFile = taskFiles[0];
    const taskFilePath = path.join(inboxDir, taskFile);

    console.log(`Processing task: ${taskFile}`);

    try {
        // Read task file
        const taskContent = fs.readFileSync(taskFilePath, 'utf-8');
        const task = JSON.parse(taskContent);

        // Handle required files
        const createdFiles = [];
        if (task.requires && Array.isArray(task.requires)) {
            for (const requiredFile of task.requires) {
                const fullPath = path.join(rootDir, requiredFile);
                if (!fs.existsSync(fullPath)) {
                    console.log(`Creating stub for: ${requiredFile}`);
                    const dir = path.dirname(fullPath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    // Create minimal stub based on file extension
                    let stubContent = '';
                    if (requiredFile.endsWith('.js') || requiredFile.endsWith('.ts')) {
                        stubContent = '// Stub file - replace with actual implementation\nmodule.exports = {};\n';
                    } else if (requiredFile.endsWith('.json')) {
                        stubContent = '{}\n';
                    } else {
                        stubContent = '# Stub file - replace with actual implementation\n';
                    }

                    fs.writeFileSync(fullPath, stubContent);
                    createdFiles.push(requiredFile);
                }
            }
        }

        // Process task with appropriate agent
        let agentResult = {};
        let exitCode = 0;

        try {
            agentResult = processTaskWithAgent(task);
            console.log('Agent result:', agentResult);

            if (!agentResult.success) {
                exitCode = 1;
            }
        } catch (error) {
            console.error('Error processing task with agent:', error.message);
            exitCode = 1;
            agentResult = {
                success: false,
                message: `Agent processing error: ${error.message}`
            };
        }

        // Create report directory and file
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const reportDir = path.join(reportsBaseDir, dateStr);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportEntry = {
            task: taskFile,
            taskType: task.type,
            agent: task.agent || 'auto-detected',
            created: createdFiles,
            exitCode: exitCode,
            agentResult: agentResult,
            ts: now.toISOString()
        };

        const reportFile = path.join(reportDir, 'summary.jsonl');
        fs.appendFileSync(reportFile, JSON.stringify(reportEntry) + '\n');

        // Move task file based on exit code
        const targetDir = exitCode === 0 ? doneDir : workingDir;
        const targetPath = path.join(targetDir, taskFile);
        fs.renameSync(taskFilePath, targetPath);

        console.log(`Task ${taskFile} processed successfully`);
        console.log(`Exit code: ${exitCode}`);
        console.log(`Moved to: ${targetDir}`);

    } catch (error) {
        console.error('Error processing task:', error.message);
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    processNextTask();
}

module.exports = processNextTask;