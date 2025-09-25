#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const JobGenerator = require('../requirements/job-generator');

// Import agent handlers
const processDeveloperJob = require('./developer');
const processTesterJob = require('./tester');
const processEngineerJob = require('./engineer');
const processGeneralJob = require('./general');
const processTestAuthorJob = require('./test-author'); // Add Test Author

class EnhancedOrchestrator {
    constructor() {
        this.jobGenerator = new JobGenerator();
    }

    async processRequirementsPipeline() {
        console.log('Starting requirements-driven job generation...');

        try {
            // Generate jobs from requirements
            const jobs = this.jobGenerator.generateJobsFromRequirements();
            console.log(`Generated ${jobs.length} jobs from requirements`);

            // Create job files in ops/jobs/inbox instead of direct processing
            const createdJobs = [];
            for (const job of jobs) {
                const jobFile = await this.createJobFile(job);
                createdJobs.push({ job: job.id, file: jobFile });
            }

            console.log(`Created ${createdJobs.length} job files in ops/jobs/inbox`);
            return createdJobs;
        } catch (error) {
            console.error('Error in requirements pipeline:', error);
            return { success: false, error: error.message };
        }
    }

    async createJobFile(job) {
        const inboxDir = path.join(process.cwd(), 'ops/jobs/inbox');

        // Ensure inbox directory exists
        if (!fs.existsSync(inboxDir)) {
            fs.mkdirSync(inboxDir, { recursive: true });
        }

        // Create job file with proper structure
        const jobId = job.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const jobFileName = `${jobId}.json`;
        const jobFilePath = path.join(inboxDir, jobFileName);

        // Format job according to expected structure
        const jobData = {
            id: jobId,
            type: job.type,
            title: job.title,
            feature: job.description, // Use description as feature
            requirement: job.requirement,
            priority: job.priority,
            agent: job.agent,
            status: 'planned',
            createdAt: new Date().toISOString()
        };

        fs.writeFileSync(jobFilePath, JSON.stringify(jobData, null, 2));
        console.log(`Created job file: ${jobFileName}`);

        return jobFileName;
    }

    routeJobToAgent(job) {
        console.log('Routing job to appropriate agent...');

        if (job.agent) {
            return job.agent;
        }

        // Auto-detect based on job type
        if (job.type === 'implement-feature' || job.type === 'fix-bug') {
            return 'developer';
        } else if (job.type === 'run-test') {
            return 'tester';
        } else if (job.type === 'analyze-test-results') {
            return 'engineer';
        } else if (job.type === 'create-tests') { // Add Test Author routing
            return 'test-author';
        } else if (job.type === 'coordinate-workflow' || job.type === 'monitor-progress') {
            return 'general';
        }

        return 'general';
    }

    async processJobWithAgent(job) {
        const agent = this.routeJobToAgent(job);
        console.log(`Job assigned to agent: ${agent}`);

        switch (agent) {
            case 'developer':
                return await processDeveloperJob(job);
            case 'tester':
                return await processTesterJob(job);
            case 'engineer':
                return await processEngineerJob(job);
            case 'test-author': // Add Test Author case
                return await processTestAuthorJob(job);
            case 'general':
                return await processGeneralJob(job);
            default:
                return { success: false, message: `Unknown agent: ${agent}` };
        }
    }

    // New method to create test requirement jobs
    async createTestRequirementJob(requirement, description, priority = 'normal') {
        const job = {
            id: `test-req-${Date.now()}`,
            type: 'create-tests',
            title: `Create tests for requirement: ${requirement}`,
            requirement: requirement,
            description: description,
            priority: priority,
            agent: 'test-author',
            timestamp: new Date().toISOString()
        };

        return await this.createJobFile(job);
    }

    // New method to create implementation requirement jobs
    async createImplementationRequirementJob(requirement, description, priority = 'normal') {
        const job = {
            id: `impl-req-${Date.now()}`,
            type: 'implement-feature',
            title: `Implement requirement: ${requirement}`,
            requirement: requirement,
            description: description,
            priority: priority,
            agent: 'developer',
            timestamp: new Date().toISOString()
        };

        return await this.createJobFile(job);
    }

    // Enhanced method to handle requirement processing with both test and implementation jobs
    async processRequirementWithTesting(requirement, description, priority = 'normal') {
        console.log(`Processing requirement with testing: ${requirement}`);

        // Create test job first
        const testJobFile = await this.createTestRequirementJob(requirement, description, priority);

        // Create implementation job
        const implJobFile = await this.createImplementationRequirementJob(requirement, description, priority);

        return {
            success: true,
            message: `Created both test and implementation jobs for requirement: ${requirement}`,
            testJob: testJobFile,
            implementationJob: implJobFile
        };
    }
}

// Keep original functionality for backward compatibility
function routeJobToAgent(job) {
    const orchestrator = new EnhancedOrchestrator();
    return orchestrator.routeJobToAgent(job);
}

function processJobWithAgent(job) {
    const orchestrator = new EnhancedOrchestrator();
    return orchestrator.processJobWithAgent(job);
}

// Export new functionality
async function createTestRequirementJob(requirement, description, priority) {
    const orchestrator = new EnhancedOrchestrator();
    return await orchestrator.createTestRequirementJob(requirement, description, priority);
}

async function createImplementationRequirementJob(requirement, description, priority) {
    const orchestrator = new EnhancedOrchestrator();
    return await orchestrator.createImplementationRequirementJob(requirement, description, priority);
}

async function processRequirementWithTesting(requirement, description, priority) {
    const orchestrator = new EnhancedOrchestrator();
    return await orchestrator.processRequirementWithTesting(requirement, description, priority);
}

// Export for use in main job processor
if (require.main === module) {
    const orchestrator = new EnhancedOrchestrator();

    if (process.argv[2] === '--requirements') {
        // Run requirements pipeline
        orchestrator.processRequirementsPipeline().then(results => {
            console.log(JSON.stringify(results, null, 2));
        });
    } else if (process.argv[2] === '--create-test-job') {
        // Create test requirement job
        const requirement = process.argv[3];
        const description = process.argv[4];
        const priority = process.argv[5] || 'normal';
        createTestRequirementJob(requirement, description, priority).then(result => {
            console.log(`Created test job: ${result}`);
        });
    } else if (process.argv[2] === '--create-impl-job') {
        // Create implementation requirement job
        const requirement = process.argv[3];
        const description = process.argv[4];
        const priority = process.argv[5] || 'normal';
        createImplementationRequirementJob(requirement, description, priority).then(result => {
            console.log(`Created implementation job: ${result}`);
        });
    } else if (process.argv[2] === '--process-with-testing') {
        // Process requirement with both test and implementation jobs
        const requirement = process.argv[3];
        const description = process.argv[4];
        const priority = process.argv[5] || 'normal';
        processRequirementWithTesting(requirement, description, priority).then(result => {
            console.log(JSON.stringify(result, null, 2));
        });
    } else {
        // Original single-job processing
        const job = JSON.parse(process.argv[2] || '{}');
        const result = processJobWithAgent(job);
        console.log(JSON.stringify(result));
    }
}

module.exports = {
    routeJobToAgent,
    processJobWithAgent,
    createTestRequirementJob,
    createImplementationRequirementJob,
    processRequirementWithTesting,
    EnhancedOrchestrator
};
