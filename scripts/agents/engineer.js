#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function processEngineerTask(task) {
    console.log('Engineer processing task:', task.title);
    
    // Engineer handles test results and creates new tasks
    if (task.type === 'analyze-test-results') {
        console.log('Analyzing test results:', task.results);
        
        // Read test results
        const resultsDir = path.join(process.cwd(), 'ops/reports/test-results');
        const taskDir = path.join(process.cwd(), 'ops/tasks/inbox');
        
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
        
        const newTasks = [];
        
        // Analyze each test result
        for (const resultFile of resultFiles.slice(0, 5)) { // Limit to recent 5 results
            const resultPath = path.join(resultsDir, resultFile);
            const result = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
            
            if (!result.success) {
                // Create bug fix task for failed tests
                const bugTask = {
                    id: `bug-${Date.now()}`,
                    type: 'fix-bug',
                    title: `Fix failed test: ${result.test}`,
                    bug: result.test,
                    priority: 'high',
                    timestamp: new Date().toISOString(),
                    agent: 'developer'
                };
                
                const bugTaskFile = path.join(taskDir, `${bugTask.id}.json`);
                fs.writeFileSync(bugTaskFile, JSON.stringify(bugTask, null, 2));
                newTasks.push(bugTask.id);
            }
        }
        
        // Create follow-up test task
        const testTask = {
            id: `test-${Date.now()}`,
            type: 'run-test',
            title: 'Run comprehensive test suite',
            test: 'all',
            priority: 'normal',
            timestamp: new Date().toISOString(),
            agent: 'tester'
        };
        
        const testTaskFile = path.join(taskDir, `${testTask.id}.json`);
        fs.writeFileSync(testTaskFile, JSON.stringify(testTask, null, 2));
        newTasks.push(testTask.id);
        
        return { 
            success: true, 
            message: `Analyzed ${resultFiles.length} test results, created ${newTasks.length} new tasks`,
            newTasks: newTasks
        };
    }
    
    return { success: false, message: 'Unknown task type for Engineer' };
}

// Export for testing
if (require.main === module) {
    const task = JSON.parse(process.argv[2] || '{}');
    const result = processEngineerTask(task);
    console.log(JSON.stringify(result));
}

module.exports = processEngineerTask;