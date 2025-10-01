import { test, expect } from './setup';

// Test the Chrome extension foundation components
test('manifest.json has correct structure and permissions', () => {
  const manifest = require('../ext-chrome/manifest.json');
  
  // Verify manifest structure
  expect(manifest.manifest_version).toBe(3);
  expect(manifest.name).toBe('Obsidian Tasks - SkedPal Sync');
  expect(manifest.version).toBe('1.0.0');
  
  // Verify required permissions
  expect(manifest.permissions).toContain('activeTab');
  expect(manifest.permissions).toContain('scripting');
  expect(manifest.permissions).toContain('nativeMessaging');
  expect(manifest.permissions).toContain('storage');
  
  // Verify host permissions for SkedPal
  expect(manifest.host_permissions).toContain('https://*.skedpal.com/*');
  expect(manifest.host_permissions).toContain('https://skedpal.com/*');
  
  // Verify content scripts configuration
  expect(manifest.content_scripts).toBeDefined();
  expect(manifest.content_scripts[0].matches).toContain('https://*.skedpal.com/*');
  expect(manifest.content_scripts[0].matches).toContain('https://skedpal.com/*');
  
  // Verify background service worker
  expect(manifest.background.service_worker).toBe('dist/background.js');
});

test('TypeScript configuration is properly set up', () => {
  const tsconfig = require('../ext-chrome/tsconfig.json');
  
  // Verify TypeScript configuration
  expect(tsconfig.compilerOptions.target).toBe('ES2020');
  expect(tsconfig.compilerOptions.module).toBe('ESNext');
  expect(tsconfig.compilerOptions.moduleResolution).toBe('node');
  expect(tsconfig.compilerOptions.strict).toBe(true);
  
  // Verify output directory
  expect(tsconfig.compilerOptions.outDir).toBe('./dist');
});

test('build script exists and has correct structure', () => {
  const fs = require('fs');
  const path = require('path');
  
  const buildScriptPath = path.join(__dirname, '../ext-chrome/build.js');
  
  // Verify build script exists
  expect(fs.existsSync(buildScriptPath)).toBe(true);
  
  // Verify build script content
  const buildScript = fs.readFileSync(buildScriptPath, 'utf8');
  expect(buildScript).toContain('npx tsc');
  expect(buildScript).toContain('fs.copyFileSync');
});

test('background service worker file exists and has correct structure', () => {
  const fs = require('fs');
  const path = require('path');
  
  const backgroundPath = path.join(__dirname, '../ext-chrome/src/background.ts');
  
  // Verify background service worker exists
  expect(fs.existsSync(backgroundPath)).toBe(true);
  
  // Verify background service worker content
  const backgroundContent = fs.readFileSync(backgroundPath, 'utf8');
  expect(backgroundContent).toContain('class BackgroundService');
  expect(backgroundContent).toContain('setupMessageHandlers');
  expect(backgroundContent).toContain('setupNativeMessaging');
  expect(backgroundContent).toContain('handleContentScriptMessage');
  expect(backgroundContent).toContain('handleNativeMessage');
});

test('content script file exists and has correct structure', () => {
  const fs = require('fs');
  const path = require('path');
  
  const contentPath = path.join(__dirname, '../ext-chrome/src/content.ts');
  
  // Verify content script exists
  expect(fs.existsSync(contentPath)).toBe(true);
  
  // Verify content script content
  const contentContent = fs.readFileSync(contentPath, 'utf8');
  expect(contentContent).toContain('extractTasks');
  expect(contentContent).toContain('injectTasks');
  expect(contentContent).toContain('chrome.runtime.onMessage.addListener');
});

test('popup script file exists and has correct structure', () => {
  const fs = require('fs');
  const path = require('path');
  
  const popupPath = path.join(__dirname, '../ext-chrome/src/popup.ts');
  
  // Verify popup script exists
  expect(fs.existsSync(popupPath)).toBe(true);
  
  // Verify popup script content
  const popupContent = fs.readFileSync(popupPath, 'utf8');
  expect(popupContent).toContain('document.addEventListener');
  expect(popupContent).toContain('DOMContentLoaded');
  expect(popupContent).toContain('PopupController');
});

test('popup HTML file exists and has correct structure', () => {
  const fs = require('fs');
  const path = require('path');
  
  const popupHtmlPath = path.join(__dirname, '../ext-chrome/popup.html');
  
  // Verify popup HTML exists
  expect(fs.existsSync(popupHtmlPath)).toBe(true);
  
  // Verify popup HTML content
  const popupHtmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
  expect(popupHtmlContent).toContain('<!DOCTYPE html>');
  expect(popupHtmlContent).toContain('Obsidian Tasks Sync');
  expect(popupHtmlContent).toContain('status');
  expect(popupHtmlContent).toContain('syncToSkedPal');
});

test('package.json for Chrome extension exists and has correct structure', () => {
  const packageJson = require('../ext-chrome/package.json');
  
  // Verify package structure
  expect(packageJson.name).toBe('obsidian-tasks-skedpal-chrome-extension');
  expect(packageJson.version).toBe('1.0.0');
  
  // Verify build dependencies
  expect(packageJson.devDependencies).toHaveProperty('@types/chrome');
  
  // Verify build scripts
  expect(packageJson.scripts).toHaveProperty('build');
});

test('Chrome extension directory structure is correct', () => {
  const fs = require('fs');
  const path = require('path');
  
  const extChromeDir = path.join(__dirname, '../ext-chrome');
  const srcDir = path.join(extChromeDir, 'src');
  
  // Verify directory structure
  expect(fs.existsSync(extChromeDir)).toBe(true);
  expect(fs.existsSync(srcDir)).toBe(true);
  
  // Verify required files exist
  const requiredFiles = [
    'manifest.json',
    'package.json',
    'tsconfig.json',
    'build.js',
    'popup.html',
    'src/background.ts',
    'src/content.ts',
    'src/popup.ts'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(extChromeDir, file);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});