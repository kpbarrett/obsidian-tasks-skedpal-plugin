const RequirementsParser = require('./parser');

class TaskGenerator {
    constructor() {
        this.parser = new RequirementsParser();
    }

    generateTasksFromRequirements() {
        const requirements = this.parser.parseRequirements();
        const tasks = [];
        
        // Generate tasks for planned requirements
        const plannedReqs = requirements.all.filter(req => req.status === 'planned');
        
        for (const req of plannedReqs) {
            const task = this.createTaskFromRequirement(req);
            if (task) {
                tasks.push(task);
            }
        }
        
        return this.prioritizeTasks(tasks);
    }

    createTaskFromRequirement(requirement) {
        const taskType = this.determineTaskType(requirement);
        const agent = this.determineAgent(requirement, taskType);
        
        return {
            id: `task-${Date.now()}-${requirement.id}`,
            type: taskType,
            title: `Implement: ${requirement.id} - ${requirement.description}`,
            requirement: requirement.id,
            description: requirement.description,
            priority: requirement.priority || 'medium',
            agent: agent,
            status: 'planned',
            createdAt: new Date().toISOString()
        };
    }

    determineTaskType(requirement) {
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

    determineAgent(requirement, taskType) {
        switch (taskType) {
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

    prioritizeTasks(tasks) {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
}

module.exports = TaskGenerator;