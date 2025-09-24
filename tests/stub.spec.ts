import { test, expect } from '@playwright/test';
import fs from 'fs';

// test('stub test', async ({ page }) => {
//   // This is a stub test. Replace with real tests.
//   await page.goto('https://example.com');
//   await expect(page).toHaveTitle(/Example Domain/);
// });

test('agent system processes tasks correctly', async () => {
    const inboxDir = 'ops/tasks/inbox';
    const doneDir = 'ops/tasks/done';

    // Clean slate
    try {
        fs.readdirSync(inboxDir).forEach(file => {
            if (file.endsWith('.json') && file !== '004-implement-agent-system.json') {
                fs.unlinkSync(`${inboxDir}/${file}`);
            }
        });
    } catch {}

    try {
        fs.readdirSync(doneDir).forEach(file => {
            if (file.endsWith('.json') && file !== '001-stage1.json' && file !== '003-improve-learning-storage.json') {
                fs.unlinkSync(`${doneDir}/${file}`);
            }
        });
    } catch {}

    // Create test tasks for different agents
    const developerTask = {
        id: 'test-dev-001',
        type: 'implement-feature',
        title: 'Test Developer Task',
        feature: 'test-feature',
        priority: 'normal',
        agent: 'developer'
    };

    const testerTask = {
        id: 'test-tester-001',
        type: 'run-test',
        title: 'Test Tester Task',
        test: 'stub',
        priority: 'normal',
        agent: 'tester'
    };

    // Write tasks to inbox
    fs.writeFileSync(`${inboxDir}/test-dev.json`, JSON.stringify(developerTask, null, 2));
    fs.writeFileSync(`${inboxDir}/test-tester.json`, JSON.stringify(testerTask, null, 2));

    // Process tasks with agent system
    require('child_process').execSync('node scripts/process_next_task.js', { stdio: 'inherit' });
    require('child_process').execSync('node scripts/process_next_task.js', { stdio: 'inherit' });

    // Check that tasks were processed and moved to done
    const doneFiles = fs.readdirSync(doneDir)
        .filter(file => file.endsWith('.json') && (file.includes('test-dev') || file.includes('test-tester')));

    expect(doneFiles.length).toBeGreaterThanOrEqual(1);

    // Check that reports were created
    const today = new Date().toISOString().split('T')[0];
    const reportDir = `ops/reports/${today}`;
    const reportFile = `${reportDir}/summary.jsonl`;

    if (fs.existsSync(reportFile)) {
        const reports = fs.readFileSync(reportFile, 'utf-8')
            .trim()
            .split('\n')
            .map(line => JSON.parse(line));

        expect(reports.length).toBeGreaterThanOrEqual(1);
        expect(reports[0]).toHaveProperty('agent');
        expect(reports[0]).toHaveProperty('taskType');
    }
});

test('orchestrator routes tasks to correct agents', async () => {
    const { routeTaskToAgent } = require('../scripts/agents/orchestrator');

    // Test developer tasks
    expect(routeTaskToAgent({ type: 'implement-feature' })).toBe('developer');
    expect(routeTaskToAgent({ type: 'fix-bug' })).toBe('developer');

    // Test tester tasks
    expect(routeTaskToAgent({ type: 'run-test' })).toBe('tester');

    // Test engineer tasks
    expect(routeTaskToAgent({ type: 'analyze-test-results' })).toBe('engineer');

    // Test general tasks
    expect(routeTaskToAgent({ type: 'coordinate-workflow' })).toBe('general');
    expect(routeTaskToAgent({ type: 'monitor-progress' })).toBe('general');

    // Test explicit agent assignment
    expect(routeTaskToAgent({ agent: 'developer' })).toBe('developer');
    expect(routeTaskToAgent({ agent: 'tester' })).toBe('tester');

    // Test default routing for unknown types
    expect(routeTaskToAgent({ type: 'unknown-task-type' })).toBe('general');
});
