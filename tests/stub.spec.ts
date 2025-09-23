import { test, expect } from '@playwright/test';
import fs from 'fs';



// test('stub test', async ({ page }) => {
//   // This is a stub test. Replace with real tests.
//   await page.goto('https://example.com');
//   await expect(page).toHaveTitle(/Example Domain/);
// });

test('plugin emits task, extension receives it', async () => {
    const pluginLog = 'ops/logs/plugin.log';
    const extLog = 'ops/logs/extension.log';

    // Clean slate
    try { fs.unlinkSync(pluginLog); } catch {}
    try { fs.unlinkSync(extLog); } catch {}

    // In Stage 1, we *simulate* a run by calling scripts that will soon be real.
    // For now they can just "touch" logs to prove the wiring.
    require('child_process').execSync('node scripts/dev-hooks/emit-plugin-task.js', { stdio: 'inherit' });
    require('child_process').execSync('node scripts/dev-hooks/receive-extension-task.js', { stdio: 'inherit' });

    const plugin = JSON.parse(fs.readFileSync(pluginLog, 'utf-8'));
    expect(plugin).toHaveProperty('id');
    expect(plugin).toHaveProperty('title');

    const ext = JSON.parse(fs.readFileSync(extLog, 'utf-8'));
    expect(ext).toMatchObject({ received: true, id: plugin.id });
});
