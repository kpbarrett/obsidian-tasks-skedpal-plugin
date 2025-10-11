// Task extraction logic for SkedPal

interface TaskData {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'in-progress' | 'completed';
  tags?: string[];
  project?: string;
  timeEstimate?: string;
  actualTime?: string;
}

interface TaskExtractionResult {
  tasks: TaskData[];
  errors: string[];
  timestamp: number;
}

class SkedPalTaskExtractor {
  private taskElements: Element[] = [];
  private observers: MutationObserver[] = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.detectTaskElements();
    this.setupObservers();
  }

  /**
   * Extract tasks from SkedPal interface
   */
  public extractTasks(): TaskExtractionResult {
    const tasks: TaskData[] = [];
    const errors: string[] = [];

    console.log(`Extracting tasks from ${this.taskElements.length} elements`);

    for (const element of this.taskElements) {
      try {
        const task = this.extractTaskFromElement(element);
        if (task) {
          tasks.push(task);
        }
      } catch (error) {
        errors.push(`Failed to extract task from element: ${error}`);
        console.warn('Task extraction error:', error);
      }
    }

    return {
      tasks,
      errors,
      timestamp: Date.now()
    };
  }

  /**
   * Detect task elements in SkedPal interface
   */
  private detectTaskElements(): void {
    // SkedPal-specific selectors for task elements
    const taskSelectors = [
      // List view tasks
      '.task-item',
      '.todo-item',
      '[data-testid="task-item"]',
      
      // Calendar view events
      '.calendar-event',
      '.fc-event',
      
      // Board view cards
      '.board-card',
      '.kanban-card',
      
      // Schedule items
      '.schedule-item',
      '.time-block',
      
      // Generic task indicators
      '[class*="task"]',
      '[class*="todo"]',
      '[class*="event"]'
    ];

    this.taskElements = [];
    
    taskSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (this.isValidTaskElement(element)) {
            this.taskElements.push(element);
          }
        });
      } catch (error) {
        console.warn(`Failed to query selector ${selector}:`, error);
      }
    });

    console.log(`Found ${this.taskElements.length} valid task elements`);
  }

  /**
   * Check if element is a valid task element
   */
  private isValidTaskElement(element: Element): boolean {
    // Skip hidden elements
    if (this.isElementHidden(element)) {
      return false;
    }

    // Check for task-like content
    const textContent = element.textContent?.trim() || '';
    if (!textContent) {
      return false;
    }

    // Check for task indicators in class names
    const className = element.className.toLowerCase();
    const taskIndicators = ['task', 'todo', 'event', 'card', 'item'];
    
    return taskIndicators.some(indicator => 
      className.includes(indicator) ||
      element.getAttribute('data-testid')?.includes(indicator) ||
      textContent.length > 3 // Reasonable minimum task title length
    );
  }

  /**
   * Check if element is hidden
   */
  private isElementHidden(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || 
           style.visibility === 'hidden' || 
           style.opacity === '0' ||
           element.getAttribute('aria-hidden') === 'true';
  }

  /**
   * Extract task data from a single DOM element
   */
  private extractTaskFromElement(element: Element): TaskData | null {
    const title = this.extractTitle(element);
    if (!title) {
      return null; // Skip elements without titles
    }

    const task: TaskData = {
      id: this.generateTaskId(element),
      title,
      description: this.extractDescription(element),
      dueDate: this.extractDueDate(element),
      priority: this.extractPriority(element),
      status: this.extractStatus(element),
      tags: this.extractTags(element),
      project: this.extractProject(element),
      timeEstimate: this.extractTimeEstimate(element),
      actualTime: this.extractActualTime(element)
    };

    return task;
  }

  /**
   * Extract task title
   */
  private extractTitle(element: Element): string | null {
    // Try various selectors for title
    const titleSelectors = [
      '.task-title',
      '.event-title',
      '.card-title',
      '[data-testid="task-title"]',
      '.title',
      'h1, h2, h3, h4',
      '.name',
      '.label'
    ];

    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement?.textContent?.trim()) {
        return titleElement.textContent.trim();
      }
    }

    // Fallback: use first text node or element text content
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 3) {
      return textContent.split('\n')[0].trim(); // Use first line
    }

    return null;
  }

  /**
   * Extract task description
   */
  private extractDescription(element: Element): string | undefined {
    const descriptionSelectors = [
      '.task-description',
      '.event-description',
      '.card-description',
      '[data-testid="task-description"]',
      '.description',
      '.notes'
    ];

    for (const selector of descriptionSelectors) {
      const descElement = element.querySelector(selector);
      if (descElement?.textContent?.trim()) {
        return descElement.textContent.trim();
      }
    }

    return undefined;
  }

  /**
   * Extract due date
   */
  private extractDueDate(element: Element): string | undefined {
    const dateSelectors = [
      '.due-date',
      '.event-date',
      '.card-date',
      '[data-testid="due-date"]',
      '.date',
      '.deadline',
      'time',
      '[datetime]'
    ];

    for (const selector of dateSelectors) {
      const dateElement = element.querySelector(selector);
      if (dateElement) {
        // Try to get datetime attribute first
        const datetime = dateElement.getAttribute('datetime');
        if (datetime) {
          return this.normalizeDate(datetime);
        }

        // Fallback to text content
        const dateText = dateElement.textContent?.trim();
        if (dateText) {
          return this.normalizeDate(dateText);
        }
      }
    }

    return undefined;
  }

  /**
   * Extract priority
   */
  private extractPriority(element: Element): 'high' | 'medium' | 'low' | undefined {
    const prioritySelectors = [
      '.priority',
      '.task-priority',
      '[data-testid="priority"]',
      '.importance'
    ];

    for (const selector of prioritySelectors) {
      const priorityElement = element.querySelector(selector);
      if (priorityElement?.textContent) {
        const priorityText = priorityElement.textContent.toLowerCase();
        if (priorityText.includes('high') || priorityText.includes('urgent')) return 'high';
        if (priorityText.includes('medium') || priorityText.includes('normal')) return 'medium';
        if (priorityText.includes('low')) return 'low';
      }
    }

    // Check for visual indicators
    const priorityClasses = ['priority-high', 'priority-medium', 'priority-low'];
    for (const pClass of priorityClasses) {
      if (element.classList.contains(pClass) || element.querySelector(`.${pClass}`)) {
        return pClass.split('-')[1] as 'high' | 'medium' | 'low';
      }
    }

    return undefined;
  }

  /**
   * Extract status
   */
  private extractStatus(element: Element): 'todo' | 'in-progress' | 'completed' {
    // Check for completion indicators
    const completedSelectors = ['.completed', '.done', '.checked', '.finished'];
    const inProgressSelectors = ['.in-progress', '.working', '.started'];

    for (const selector of completedSelectors) {
      if (element.classList.contains(selector) || element.querySelector(selector)) {
        return 'completed';
      }
    }

    for (const selector of inProgressSelectors) {
      if (element.classList.contains(selector) || element.querySelector(selector)) {
        return 'in-progress';
      }
    }

    return 'todo';
  }

  /**
   * Extract tags
   */
  private extractTags(element: Element): string[] {
    const tags: string[] = [];
    
    const tagSelectors = [
      '.tag',
      '.label',
      '.category',
      '[data-testid="tag"]'
    ];

    tagSelectors.forEach(selector => {
      const tagElements = element.querySelectorAll(selector);
      tagElements.forEach(tagElement => {
        const tagText = tagElement.textContent?.trim();
        if (tagText && !tags.includes(tagText)) {
          tags.push(tagText);
        }
      });
    });

    return tags;
  }

  /**
   * Extract project
   */
  private extractProject(element: Element): string | undefined {
    const projectSelectors = [
      '.project',
      '.category',
      '.folder',
      '[data-testid="project"]'
    ];

    for (const selector of projectSelectors) {
      const projectElement = element.querySelector(selector);
      if (projectElement?.textContent?.trim()) {
        return projectElement.textContent.trim();
      }
    }

    return undefined;
  }

  /**
   * Extract time estimate
   */
  private extractTimeEstimate(element: Element): string | undefined {
    const estimateSelectors = [
      '.time-estimate',
      '.estimate',
      '.duration',
      '[data-testid="time-estimate"]'
    ];

    for (const selector of estimateSelectors) {
      const estimateElement = element.querySelector(selector);
      if (estimateElement?.textContent?.trim()) {
        return estimateElement.textContent.trim();
      }
    }

    return undefined;
  }

  /**
   * Extract actual time spent
   */
  private extractActualTime(element: Element): string | undefined {
    const actualTimeSelectors = [
      '.actual-time',
      '.time-spent',
      '.duration-actual',
      '[data-testid="actual-time"]'
    ];

    for (const selector of actualTimeSelectors) {
      const timeElement = element.querySelector(selector);
      if (timeElement?.textContent?.trim()) {
        return timeElement.textContent.trim();
      }
    }

    return undefined;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(element: Element): string {
    // Try to use existing ID or data attributes
    const existingId = element.id || 
                      element.getAttribute('data-task-id') ||
                      element.getAttribute('data-id');
    
    if (existingId) {
      return `skedpal_${existingId}`;
    }

    // Generate based on content and position
    const title = this.extractTitle(element);
    const position = Array.from(element.parentNode?.children || []).indexOf(element);
    
    return `skedpal_${btoa(title || 'task').slice(0, 8)}_${position}_${Date.now()}`;
  }

  /**
   * Normalize date string
   */
  private normalizeDate(dateString: string): string {
    // Basic date normalization
    // This should be enhanced based on SkedPal's date format
    return dateString.trim();
  }

  /**
   * Setup observers for dynamic content
   */
  private setupObservers(): void {
    // Watch for new task elements
    const taskObserver = new MutationObserver((mutations) => {
      let newTasks = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && this.isValidTaskElement(node as Element)) {
            this.taskElements.push(node as Element);
            newTasks = true;
          }
        });
      });

      if (newTasks) {
        console.log('New tasks detected, updating task list');
      }
    });

    taskObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(taskObserver);
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export for use in content script
export { SkedPalTaskExtractor, TaskData, TaskExtractionResult };