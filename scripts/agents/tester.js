#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function processTesterJob(job) {
    console.log('Tester processing job:', job.title);

    // Tester handles test execution jobs
    if (job.type === 'run-test') {
        console.log('Running test:', job.test);

        let exitCode = 0;
        let stdout = '';
        let stderr = '';

        try {
            const result = execSync('make test', {
                timeout: 60000,
                encoding: 'utf-8'
            });
            stdout = result;
        } catch (error) {
            exitCode = error.status || 1;
            stdout = error.stdout || '';
            stderr = error.stderr || error.message;
        }

        const testResult = {
            jobId: job.id,
            test: job.test,
            exitCode: exitCode,
            timestamp: new Date().toISOString(),
            success: exitCode === 0
        };

        // Save test result
        const resultsDir = path.join(process.cwd(), 'ops/reports/test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const resultFile = path.join(resultsDir, `${job.id}-${Date.now()}.json`);
        fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));

        return {
            success: true,
            message: `Test "${job.test}" executed with exit code ${exitCode}`,
            result: testResult
        };
    }

    return { success: false, message: 'Unknown job type for Tester' };
}

// Export for testing
if (require.main === module) {
    const job = JSON.parse(process.argv[2] || '{}');
    const result = processTesterJob(job);
    console.log(JSON.stringify(result));
}

module.exports = processTesterJob;
