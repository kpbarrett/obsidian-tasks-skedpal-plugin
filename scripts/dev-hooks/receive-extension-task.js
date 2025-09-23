const fs = require('fs');
const task = JSON.parse(fs.readFileSync('ops/logs/plugin.log', 'utf-8'));
fs.writeFileSync('ops/logs/extension.log', JSON.stringify({ received: true, id: task.id }, null, 2));
