#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function processTesterTask(task) {
    console.log('Tester processing task:', task.title);
    
    // Tester handles test execution tasks
    if (task.type === 'run-test') {
        console.log('Running test:', task.test);
        
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
            taskId: task.id,
            test: task.test,
            exitCode: exitCode,
            timestamp: new Date().toISOString(),
            success: exitCode === 0
        };
        
        // Save test result
        const resultsDir = path.join(process.cwd(), 'ops/reports/test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        const resultFile = path.join(resultsDir, `${task.id}-${Date.now()}.json`);
        fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));
        
        return { 
            success: true, 
            message: `Test "${task.test}" executed with exit code ${exitCode}`,
            result: testResult
        };
    }
    
    return { success: false, message: 'Unknown task type for Tester' };
}

// Export for testing
if (require.main === module) {
    const task = JSON.parse(process.argv[2] || '{}');
    const result = processTesterTask(task);
    console.log(JSON.stringify(result));
}

module.exports = processTesterTask;