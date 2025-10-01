// Content script for SkedPal integration

interface TaskData {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'in-progress' | 'completed';
  tags?: string[];
}

interface SyncMessage {
  type: 'extract_tasks' | 'inject_tasks' | 'status_update' | 'auth_required';
  data?: any;
  timestamp: number;
}

class SkedPalIntegration {
  private isReady: boolean = false;
  private taskElements: Element[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Wait for SkedPal page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupIntegration();
      });
    } else {
      this.setupIntegration();
    }

    // Setup message listeners
    this.setupMessageHandlers();
  }

  private setupIntegration(): void {
    console.log('Setting up SkedPal integration');
    
    // Detect SkedPal interface elements
    this.detectTaskElements();
    
    // Setup observers for dynamic content
    this.setupObservers();
    
    this.isReady = true;
    
    // Notify background script that we're ready
    this.sendStatusUpdate('ready');
  }

  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener((message: SyncMessage, sender, sendResponse) => {
      this.handleBackgroundMessage(message, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  private handleBackgroundMessage(message: SyncMessage, sendResponse: (response?: any) => void): void {
    console.log('Content script received message:', message);

    switch (message.type) {
      case 'extract_tasks':
        this.extractTasks().then(tasks => {
          sendResponse({ tasks, success: true });
        }).catch(error => {
          sendResponse({ error: error.message, success: false });
        });
        break;

      case 'inject_tasks':
        this.injectTasks(message.data).then(result => {
          sendResponse({ success: true, injectedCount: result.injectedCount });
        }).catch(error => {
          sendResponse({ error: error.message, success: false });
        });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  private detectTaskElements(): void {
    // Look for task elements in SkedPal interface
    // This will need to be updated based on SkedPal's actual DOM structure
    
    // Common selectors for task elements
    const taskSelectors = [
      '.task-item',
      '[data-testid="task-item"]',
      '.calendar-event',
      '.schedule-item',
      '.todo-item'
    ];

    this.taskElements = [];
    
    taskSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      this.taskElements.push(...Array.from(elements));
    });

    console.log(`Found ${this.taskElements.length} task elements`);
  }

  private setupObservers(): void {
    // Watch for new task elements being added
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (this.isTaskElement(element)) {
              this.taskElements.push(element);
              shouldUpdate = true;
            }
          }
        });
      });

      if (shouldUpdate) {
        this.sendStatusUpdate('tasks_updated');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private isTaskElement(element: Element): boolean {
    // Check if element looks like a task element
    const taskIndicators = [
      'task', 'todo', 'event', 'schedule', 'calendar'
    ];

    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    const textContent = element.textContent?.toLowerCase() || '';

    return taskIndicators.some(indicator => 
      className.includes(indicator) || 
      id.includes(indicator) ||
      textContent.includes(indicator)
    );
  }

  private async extractTasks(): Promise<TaskData[]> {
    if (!this.isReady) {
      throw new Error('SkedPal integration not ready');
    }

    const tasks: TaskData[] = [];

    for (const element of this.taskElements) {
      try {
        const task = await this.extractTaskFromElement(element);
        if (task) {
          tasks.push(task);
        }
      } catch (error) {
        console.warn('Failed to extract task from element:', error);
      }
    }

    console.log(`Extracted ${tasks.length} tasks from SkedPal`);
    return tasks;
  }

  private async extractTaskFromElement(element: Element): Promise<TaskData | null> {
    // Extract task data from DOM element
    // This will need to be customized based on SkedPal's actual DOM structure

    const titleElement = element.querySelector('.task-title, .event-title, [data-testid="task-title"]');
    const descriptionElement = element.querySelector('.task-description, .event-description');
    const dateElement = element.querySelector('.due-date, .event-date, [data-testid="due-date"]');
    const priorityElement = element.querySelector('.priority, .task-priority');

    if (!titleElement?.textContent?.trim()) {
      return null; // Skip elements without titles
    }

    const task: TaskData = {
      id: this.generateTaskId(),
      title: titleElement.textContent.trim(),
      description: descriptionElement?.textContent?.trim(),
      dueDate: this.extractDate(dateElement),
      priority: this.extractPriority(priorityElement),
      status: this.extractStatus(element)
    };

    return task;
  }

  private async injectTasks(tasks: TaskData[]): Promise<{ injectedCount: number }> {
    if (!this.isReady) {
      throw new Error('SkedPal integration not ready');
    }

    let injectedCount = 0;

    for (const task of tasks) {
      try {
        const success = await this.injectTask(task);
        if (success) {
          injectedCount++;
        }
      } catch (error) {
        console.warn('Failed to inject task:', task.title, error);
      }
    }

    console.log(`Injected ${injectedCount} tasks into SkedPal`);
    return { injectedCount };
  }

  private async injectTask(task: TaskData): Promise<boolean> {
    // Find the task creation interface in SkedPal
    // This will need to be customized based on SkedPal's actual DOM structure

    const addButton = document.querySelector('[data-testid="add-task"], .add-task, .new-task');
    
    if (!addButton) {
      console.warn('Could not find task creation interface');
      return false;
    }

    // Simulate clicking the add button
    (addButton as HTMLElement).click();

    // Wait for task creation form to appear
    await this.delay(500);

    // Fill in task details
    const titleInput = document.querySelector('[data-testid="task-title-input"], .task-title-input, input[placeholder*="task"]');
    if (titleInput) {
      (titleInput as HTMLInputElement).value = task.title;
    }

    // TODO: Fill other fields based on SkedPal's interface
    // This will require detailed analysis of SkedPal's DOM structure

    // Submit the form
    const submitButton = document.querySelector('[data-testid="save-task"], .save-task, .submit-task');
    if (submitButton) {
      (submitButton as HTMLElement).click();
      return true;
    }

    return false;
  }

  private generateTaskId(): string {
    return `skedpal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractDate(element: Element | null): string | undefined {
    if (!element?.textContent) return undefined;
    
    // Parse date from text content
    const dateText = element.textContent.trim();
    // TODO: Implement proper date parsing for SkedPal's date format
    return dateText;
  }

  private extractPriority(element: Element | null): 'high' | 'medium' | 'low' | undefined {
    if (!element?.textContent) return undefined;
    
    const priorityText = element.textContent.toLowerCase();
    if (priorityText.includes('high')) return 'high';
    if (priorityText.includes('medium')) return 'medium';
    if (priorityText.includes('low')) return 'low';
    
    return undefined;
  }

  private extractStatus(element: Element): 'todo' | 'in-progress' | 'completed' {
    // Check for completion indicators
    const isCompleted = element.classList.contains('completed') || 
                       element.querySelector('.completed, .done, .checked');
    
    const isInProgress = element.classList.contains('in-progress') ||
                        element.querySelector('.in-progress, .working');

    if (isCompleted) return 'completed';
    if (isInProgress) return 'in-progress';
    return 'todo';
  }

  private sendStatusUpdate(status: string): void {
    chrome.runtime.sendMessage({
      type: 'status_update',
      data: { status, taskCount: this.taskElements.length },
      timestamp: Date.now()
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize SkedPal integration
const skedPalIntegration = new SkedPalIntegration();