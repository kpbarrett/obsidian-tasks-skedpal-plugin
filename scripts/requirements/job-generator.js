const RequirementsParser = require('./parser');

class JobGenerator {
    constructor() {
        this.parser = new RequirementsParser();
    }

    generateJobsFromRequirements() {
        const requirements = this.parser.parseRequirements();
        const jobs = [];

        // Generate jobs for planned requirements
        const plannedReqs = requirements.all.filter(req => req.status === 'planned');

        for (const req of plannedReqs) {
            const job = this.createJobFromRequirement(req);
            if (job) {
                jobs.push(job);
            }
        }

        return this.prioritizeJobs(jobs);
    }

    createJobFromRequirement(requirement) {
        const jobType = this.determineJobType(requirement);
        const agent = this.determineAgent(requirement, jobType);

        return {
            id: `job-${Date.now()}-${requirement.id}`,
            type: jobType,
            title: `Implement: ${requirement.id} - ${requirement.description}`,
            requirement: requirement.id,
            description: requirement.description,
            priority: requirement.priority || 'medium',
            agent: agent,
            status: 'planned',
            createdAt: new Date().toISOString()
        };
    }

    determineJobType(requirement) {
        if (requirement.id.startsWith('REQ-0')) {
            return 'implement-feature';
        } else if (requirement.id.startsWith('REQ-02') &&
                   (requirement.id.includes('REQ-020') ||
                    requirement.id.includes('REQ-021') ||
                    requirement.id.includes('REQ-022'))) {
            return 'run-test';
        } else if (requirement.id.startsWith('REQ-02')) {
            return 'coordinate-workflow';
        }
        return 'implement-feature';
    }

    determineAgent(requirement, jobType) {
        switch (jobType) {
            case 'implement-feature':
                return 'developer';
            case 'run-test':
                return 'tester';
            case 'analyze-test-results':
                return 'engineer';
            case 'coordinate-workflow':
            case 'monitor-progress':
                return 'general';
            default:
                return 'general';
        }
    }

    prioritizeJobs(jobs) {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return jobs.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
}

module.exports = JobGenerator;
