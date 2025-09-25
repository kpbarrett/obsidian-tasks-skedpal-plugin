#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the orchestrator for agent-based job processing
const { processJobWithAgent } = require('./agents/orchestrator');

function processNextJob() {
    const rootDir = process.cwd();
    const inboxDir = path.join(rootDir, 'ops/jobs/inbox');
    const doneDir = path.join(rootDir, 'ops/jobs/done');
    const workingDir = path.join(rootDir, 'ops/jobs/working');
    const reportsBaseDir = path.join(rootDir, 'ops/reports');

    // Ensure directories exist
    [doneDir, workingDir, reportsBaseDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Get lexicographically highest .json file
    let jobFiles = [];
    try {
        jobFiles = fs.readdirSync(inboxDir)
            .filter(file => file.endsWith('.json'))
            .sort()
            .reverse();
    } catch (error) {
        console.error('Error reading inbox directory:', error.message);
        return;
    }

    if (jobFiles.length === 0) {
        console.log('No jobs found in inbox');
        return;
    }

    const jobFile = jobFiles[0];
    const jobFilePath = path.join(inboxDir, jobFile);

    console.log(`Processing job: ${jobFile}`);

    try {
        // Read job file
        const jobContent = fs.readFileSync(jobFilePath, 'utf-8');
        const job = JSON.parse(jobContent);

        // Handle required files
        const createdFiles = [];
        if (job.requires && Array.isArray(job.requires)) {
            for (const requiredFile of job.requires) {
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

        // Process job with appropriate agent
        let agentResult = {};
        let exitCode = 0;

        try {
            agentResult = processJobWithAgent(job);
            console.log('Agent result:', agentResult);

            if (!agentResult.success) {
                exitCode = 1;
            }
        } catch (error) {
            console.error('Error processing job with agent:', error.message);
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
            job: jobFile,
            jobType: job.type,
            agent: job.agent || 'auto-detected',
            created: createdFiles,
            exitCode: exitCode,
            agentResult: agentResult,
            ts: now.toISOString()
        };

        const reportFile = path.join(reportDir, 'summary.jsonl');
        fs.appendFileSync(reportFile, JSON.stringify(reportEntry) + '\n');

        // Move job file based on exit code
        const targetDir = exitCode === 0 ? doneDir : workingDir;
        const targetPath = path.join(targetDir, jobFile);
        fs.renameSync(jobFilePath, targetPath);

        console.log(`Job ${jobFile} processed successfully`);
        console.log(`Exit code: ${exitCode}`);
        console.log(`Moved to: ${targetDir}`);

    } catch (error) {
        console.error('Error processing job:', error.message);
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    processNextJob();
}

module.exports = processNextJob;
