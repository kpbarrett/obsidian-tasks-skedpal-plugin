// Unit tests for SkedPal task extraction logic

import { test, expect } from '@playwright/test';
import { SkedPalTaskExtractor, TaskData } from '../ext-chrome/src/task-extractor';

// Mock DOM elements for testing
function createMockTaskElement(options: {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  project?: string;
  timeEstimate?: string;
  actualTime?: string;
} = {}): HTMLElement {
  const element = document.createElement('div');
  element.className = 'task-item';

  if (options.title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'task-title';
    titleEl.textContent = options.title;
    element.appendChild(titleEl);
  }

  if (options.description) {
    const descEl = document.createElement('div');
    descEl.className = 'task-description';
    descEl.textContent = options.description;
    element.appendChild(descEl);
  }

  if (options.dueDate) {
    const dateEl = document.createElement('div');
    dateEl.className = 'due-date';
    dateEl.textContent = options.dueDate;
    element.appendChild(dateEl);
  }

  if (options.priority) {
    const priorityEl = document.createElement('div');
    priorityEl.className = `priority ${options.priority}`;
    priorityEl.textContent = options.priority;
    element.appendChild(priorityEl);
  }

  if (options.status) {
    element.classList.add(options.status);
  }

  if (options.tags) {
    options.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      element.appendChild(tagEl);
    });
  }

  if (options.project) {
    const projectEl = document.createElement('div');
    projectEl.className = 'project';
    projectEl.textContent = options.project;
    element.appendChild(projectEl);
  }

  if (options.timeEstimate) {
    const estimateEl = document.createElement('div');
    estimateEl.className = 'time-estimate';
    estimateEl.textContent = options.timeEstimate;
    element.appendChild(estimateEl);
  }

  if (options.actualTime) {
    const actualEl = document.createElement('div');
    actualEl.className = 'actual-time';
    actualEl.textContent = options.actualTime;
    element.appendChild(actualEl);
  }

  return element;
}

test.describe('SkedPal Task Extractor', () => {
  let extractor: SkedPalTaskExtractor;

  test.beforeEach(() => {
    extractor = new SkedPalTaskExtractor();
  });

  test.afterEach(() => {
    extractor.cleanup();
  });

  test('should extract basic task with title', () => {
    const mockElement = createMockTaskElement({
      title: 'Test Task',
      description: 'This is a test task',
      dueDate: '2024-01-01',
      priority: 'high',
      status: 'todo'
    });

    document.body.appendChild(mockElement);

    const result = extractor.extractTasks();
    
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe('Test Task');
    expect(result.tasks[0].description).toBe('This is a test task');
    expect(result.tasks[0].dueDate).toBe('2024-01-01');
    expect(result.tasks[0].priority).toBe('high');
    expect(result.tasks[0].status).toBe('todo');
    expect(result.errors).toHaveLength(0);

    document.body.removeChild(mockElement);
  });

  test('should skip elements without title', () => {
    const mockElement = createMockTaskElement({
      description: 'No title task',
      dueDate: '2024-01-01'
    });
    
    // Remove title element
    const titleEl = mockElement.querySelector('.task-title');
    if (titleEl) {
      mockElement.removeChild(titleEl);
    }

    document.body.appendChild(mockElement);

    const result = extractor.extractTasks();
    
    expect(result.tasks).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    document.body.removeChild(mockElement);
  });

  test('should extract task with tags', () => {
    const mockElement = createMockTaskElement({
      title: 'Tagged Task',
      tags: ['urgent', 'work', 'important']
    });

    document.body.appendChild(mockElement);

    const result = extractor.extractTasks();
    
    expect(result.tasks[0].tags).toEqual(['urgent', 'work', 'important']);

    document.body.removeChild(mockElement);
  });

  test('should extract task with project', () => {
    const mockElement = createMockTaskElement({
      title: 'Project Task',
      project: 'Website Redesign'
    });

    document.body.appendChild(mockElement);

    const result = extractor.extractTasks();
    
    expect(result.tasks[0].project).toBe('Website Redesign');

    document.body.removeChild(mockElement);
  });

  test('should extract task with time estimates', () => {
    const mockElement = createMockTaskElement({
      title: 'Time Task',
      timeEstimate: '2 hours',
      actualTime: '1.5 hours'
    });

    document.body.appendChild(mockElement);

    const result = extractor.extractTasks();
    
    expect(result.tasks[0].timeEstimate).toBe('2 hours');
    expect(result.tasks[0].actualTime).toBe('1.5 hours');

    document.body.removeChild(mockElement);
  });

  test('should handle multiple task elements', () => {
    const tasks = [
      createMockTaskElement({ title: 'Task 1' }),
      createMockTaskElement({ title: 'Task 2' }),
      createMockTaskElement({ title: 'Task 3' })
    ];

    tasks.forEach(task => document.body.appendChild(task));

    const result = extractor.extractTasks();
    
    expect(result.tasks).toHaveLength(3);
    expect(result.tasks.map(t => t.title)).toEqual(['Task 1', 'Task 2', 'Task 3']);

    tasks.forEach(task => document.body.removeChild(task));
  });

  test('should handle priority extraction from classes', () => {
    const mockElement = createMockTaskElement({
      title: 'Priority Task'
    });
    
    // Add priority class directly to element
    mockElement.classList.add('priority-high');

    document.body.appendChild(mockElement);

    const result = extractor.extractTasks();
    
    expect(result.tasks[0].priority).toBe('high');

    document.body.removeChild(mockElement);
  });

  test('should handle status extraction from classes', () => {
    const testCases = [
      { statusClass: 'completed', expectedStatus: 'completed' },
      { statusClass: 'in-progress', expectedStatus: 'in-progress' },
      { statusClass: 'todo', expectedStatus: 'todo' }
    ];

    testCases.forEach(({ statusClass, expectedStatus }) => {
      const mockElement = createMockTaskElement({
        title: `${expectedStatus} Task`
      });
      
      mockElement.classList.add(statusClass);

      document.body.appendChild(mockElement);

      const result = extractor.extractTasks();
      
      expect(result.tasks[0].status).toBe(expectedStatus);

      document.body.removeChild(mockElement);
    });
  });

  test('should handle malformed task elements gracefully', () => {
    // Create an element that looks like a task but has issues
    const problematicElement = document.createElement('div');
    problematicElement.className = 'task-item';
    problematicElement.innerHTML = '<div class="task-title"></div>'; // Empty title

    document.body.appendChild(problematicElement);

    const result = extractor.extractTasks();
    
    // Should skip empty title elements
    expect(result.tasks).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    document.body.removeChild(problematicElement);
  });

  test('should generate unique task IDs', () => {
    const mockElement1 = createMockTaskElement({ title: 'Task A' });
    const mockElement2 = createMockTaskElement({ title: 'Task B' });

    document.body.appendChild(mockElement1);
    document.body.appendChild(mockElement2);

    const result = extractor.extractTasks();
    
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0].id).not.toBe(result.tasks[1].id);
    expect(result.tasks[0].id).toMatch(/^skedpal_/);
    expect(result.tasks[1].id).toMatch(/^skedpal_/);

    document.body.removeChild(mockElement1);
    document.body.removeChild(mockElement2);
  });

  test('should handle hidden elements correctly', () => {
    const visibleElement = createMockTaskElement({ title: 'Visible Task' });
    const hiddenElement = createMockTaskElement({ title: 'Hidden Task' });
    
    // Hide the second element
    hiddenElement.style.display = 'none';

    document.body.appendChild(visibleElement);
    document.body.appendChild(hiddenElement);

    const result = extractor.extractTasks();
    
    // Should only extract visible elements
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe('Visible Task');

    document.body.removeChild(visibleElement);
    document.body.removeChild(hiddenElement);
  });
});