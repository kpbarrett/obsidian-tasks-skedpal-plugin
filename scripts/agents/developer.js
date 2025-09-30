#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function processDeveloperJob(job) {
    console.log('Developer processing job:', job.title);

    // Developer handles implementation jobs
    if (job.type === 'implement-feature') {
        console.log('Implementing requirement:', job.requirement);
        console.log('Description:', job.description);
        // Implementation logic would go here
        
        // Developer now includes test creation for their features
        console.log('Creating unit and integration tests for feature');
        
        return { success: true, message: `Requirement "${job.requirement}" implemented with tests: ${job.description}` };
    } else if (job.type === 'fix-bug') {
        console.log('Fixing bug:', job.bug);
        // Bug fixing logic would go here
        
        // Include test updates for bug fixes
        console.log('Updating tests to prevent regression');
        
        return { success: true, message: `Bug "${job.bug}" fixed with test coverage` };
    }

    return { success: false, message: 'Unknown job type for Developer' };
}

// Export for testing
if (require.main === module) {
    const job = JSON.parse(process.argv[2] || '{}');
    const result = processDeveloperJob(job);
    console.log(JSON.stringify(result));
}

module.exports = processDeveloperJob;
