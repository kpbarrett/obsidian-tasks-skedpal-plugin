const fs = require('fs');
const { execSync } = require('child_process');

// Build the Chrome extension
console.log('Building Chrome extension...');

try {
  // Run TypeScript compiler
  execSync('npx tsc', { stdio: 'inherit' });
  
  // Copy popup.html to dist directory
  fs.copyFileSync('popup.html', 'dist/popup.html');
  
  console.log('Chrome extension build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}