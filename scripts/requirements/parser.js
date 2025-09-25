#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class RequirementsParser {
    constructor(requirementsFile = 'PROJECT_REQUIREMENTS.md') {
        this.requirementsFile = requirementsFile;
        this.requirements = null;
    }

    parseRequirements() {
        if (!fs.existsSync(this.requirementsFile)) {
            throw new Error(`Requirements file not found: ${this.requirementsFile}`);
        }

        const content = fs.readFileSync(this.requirementsFile, 'utf8');
        this.requirements = this.extractRequirements(content);
        return this.requirements;
    }

    extractRequirements(content) {
        const requirements = {
            core: [],
            technical: [],
            development: [],
            all: []
        };

        const lines = content.split('\n');
        let currentSection = '';

        for (const line of lines) {
            // Detect section headers
            if (line.startsWith('## ')) {
                if (line.includes('Core Requirements')) {
                    currentSection = 'core';
                } else if (line.includes('Technical Requirements')) {
                    currentSection = 'technical';
                } else if (line.includes('Development Requirements')) {
                    currentSection = 'development';
                }
            }

            // Parse requirement lines
            if (line.startsWith('- **') && currentSection) {
                const requirement = this.parseRequirementLine(line);
                if (requirement) {
                    requirements[currentSection].push(requirement);
                    requirements.all.push(requirement);
                }
            }
        }

        return requirements;
    }

    parseRequirementLine(line) {
        // Extract requirement ID and description
        const match = line.match(/\*\*([A-Z]+-\d+)\*\*: (.+)/);
        if (match) {
            return {
                id: match[1],
                description: match[2].trim(),
                status: 'planned', // Default status
                priority: 'medium' // Default priority
            };
        }
        return null;
    }

    getRequirementsByStatus(status) {
        if (!this.requirements) {
            this.parseRequirements();
        }
        return this.requirements.all.filter(req => req.status === status);
    }

    getRequirementsByPriority(priority) {
        if (!this.requirements) {
            this.parseRequirements();
        }
        return this.requirements.all.filter(req => req.priority === priority);
    }

    updateRequirementStatus(requirementId, status) {
        if (!this.requirements) {
            this.parseRequirements();
        }

        const requirement = this.requirements.all.find(req => req.id === requirementId);
        if (requirement) {
            requirement.status = status;
            this.updateRequirementsFile();
        }
    }

    updateRequirementsFile() {
        if (!this.requirements) return;

        let content = fs.readFileSync(this.requirementsFile, 'utf8');

        // Update status in the priority matrix
        const lines = content.split('\n');
        const matrixStart = lines.findIndex(line => line.includes('| Priority Matrix'));

        if (matrixStart !== -1) {
            for (let i = matrixStart + 3; i < lines.length; i++) {
                if (lines[i].includes('|') && !lines[i].includes('---')) {
                    const cells = lines[i].split('|').map(cell => cell.trim());
                    if (cells.length >= 4 && cells[1]) {
                        const reqId = cells[1];
                        const requirement = this.requirements.all.find(req => req.id === reqId);
                        if (requirement) {
                            cells[3] = requirement.status;
                            lines[i] = '| ' + cells.slice(1).join(' | ') + ' |';
                        }
                    }
                }
            }
        }

        fs.writeFileSync(this.requirementsFile, lines.join('\n'));
    }

    generateJobsFromRequirements() {
        if (!this.requirements) {
            this.parseRequirements();
        }

        const jobs = [];
        const plannedRequirements = this.getRequirementsByStatus('planned');

        for (const req of plannedRequirements) {
            const job = this.requirementToJob(req);
            if (job) {
                jobs.push(job);
            }
        }

        return jobs;
    }

    requirementToJob(requirement) {
        // Map requirement types to job types and agents
        let jobType, agent;

        if (requirement.id.startsWith('REQ-0')) {
            // Core requirements (REQ-001 to REQ-013)
            jobType = 'implement-feature';
            agent = 'developer';
        } else if (requirement.id.startsWith('REQ-01')) {
            // Technical requirements (REQ-014 to REQ-019)
            jobType = 'implement-feature';
            agent = 'developer';
        } else if (requirement.id.startsWith('REQ-02')) {
            // Development requirements (REQ-020 to REQ-025)
            if (requirement.id.includes('REQ-020') || requirement.id.includes('REQ-021') || requirement.id.includes('REQ-022')) {
                jobType = 'run-test';
                agent = 'tester';
            } else {
                jobType = 'coordinate-workflow';
                agent = 'general';
            }
        }

        return {
            id: `job-${Date.now()}-${requirement.id}`,
            type: jobType,
            title: `Implement requirement: ${requirement.id}`,
            requirement: requirement.id,
            description: requirement.description,
            priority: requirement.priority,
            agent: agent,
            status: 'planned'
        };
    }
}

// Export for use in other modules
if (require.main === module) {
    const parser = new RequirementsParser();
    const requirements = parser.parseRequirements();
    console.log('Parsed requirements:', JSON.stringify(requirements, null, 2));

    const jobs = parser.generateJobsFromRequirements();
    console.log('Generated jobs:', JSON.stringify(jobs, null, 2));
}

module.exports = RequirementsParser;