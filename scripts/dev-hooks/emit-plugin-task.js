const fs = require('fs');
fs.writeFileSync('ops/logs/plugin.log', JSON.stringify({
    id: 'task-123',
    title: 'Stub Task',
    notes: 'Stage 1',
    priority: 'normal',
    due: null
}, null, 2));
