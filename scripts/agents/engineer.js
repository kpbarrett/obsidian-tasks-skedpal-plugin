#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function processEngineerJob(job) {
    console.log('Engineer processing job:', job.title);

    // Engineer handles test results and creates new jobs
    if (job.type === 'analyze-test-results') {
        console.log('Analyzing test results:', job.results);

        // Read test results
        const resultsDir = path.join(process.cwd(), 'ops/reports/test-results');
        const jobDir = path.join(process.cwd(), 'ops/jobs/inbox');

        if (!fs.existsSync(resultsDir)) {
            return { success: false, message: 'No test results directory found' };
        }

        const resultFiles = fs.readdirSync(resultsDir)
            .filter(file => file.endsWith('.json'))
            .sort()
            .reverse();

        if (resultFiles.length === 0) {
            return { success: false, message: 'No test results found' };
        }

        const newJobs = [];

        // Analyze each test result
        for (const resultFile of resultFiles.slice(0, 5)) { // Limit to recent 5 results
            const resultPath = path.join(resultsDir, resultFile);
            const result = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));

            if (!result.success) {
                // Create bug fix job for failed tests
                const bugJob = {
                    id: `bug-${Date.now()}`,
                    type: 'fix-bug',
                    title: `Fix failed test: ${result.test}`,
                    bug: result.test,
                    priority: 'high',
                    timestamp: new Date().toISOString(),
                    agent: 'developer'
                };

                const bugJobFile = path.join(jobDir, `${bugJob.id}.json`);
                fs.writeFileSync(bugJobFile, JSON.stringify(bugJob, null, 2));
                newJobs.push(bugJob.id);
            }
        }

        // Create follow-up test job
        const testJob = {
            id: `test-${Date.now()}`,
            type: 'run-test',
            title: 'Run comprehensive test suite',
            test: 'all',
            priority: 'normal',
            timestamp: new Date().toISOString(),
            agent: 'tester'
        };

        const testJobFile = path.join(jobDir, `${testJob.id}.json`);
        fs.writeFileSync(testJobFile, JSON.stringify(testJob, null, 2));
        newJobs.push(testJob.id);

        return {
            success: true,
            message: `Analyzed ${resultFiles.length} test results, created ${newJobs.length} new jobs`,
            newJobs: newJobs
        };
    }

    return { success: false, message: 'Unknown job type for Engineer' };
}

// Export for testing
if (require.main === module) {
    const job = JSON.parse(process.argv[2] || '{}');
    const result = processEngineerJob(job);
    console.log(JSON.stringify(result));
}

module.exports = processEngineerJob;
