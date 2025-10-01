// Background service worker for Chrome extension

interface SyncMessage {
  type: 'sync_to_skedpal' | 'sync_from_skedpal' | 'status_update' | 'auth_required';
  data?: any;
  timestamp: number;
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'in-progress' | 'completed';
  tags?: string[];
}

class BackgroundService {
  private nativePort: chrome.runtime.Port | null = null;
  private isAuthenticated: boolean = false;

  constructor() {
    this.setupMessageHandlers();
    this.setupNativeMessaging();
  }

  private setupMessageHandlers(): void {
    // Handle messages from content scripts
    chrome.runtime.onMessage.addListener((message: SyncMessage, sender, sendResponse) => {
      this.handleContentScriptMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle extension icon clicks
    chrome.action.onClicked.addListener((tab) => {
      this.handleExtensionClick(tab);
    });
  }

  private setupNativeMessaging(): void {
    // Connect to native messaging host (Obsidian plugin)
    try {
      this.nativePort = chrome.runtime.connectNative('com.obsidian.tasks.skedpal');
      
      this.nativePort.onMessage.addListener((message: SyncMessage) => {
        this.handleNativeMessage(message);
      });

      this.nativePort.onDisconnect.addListener(() => {
        console.log('Native messaging port disconnected');
        this.nativePort = null;
      });
    } catch (error) {
      console.warn('Native messaging not available:', error);
    }
  }

  private handleContentScriptMessage(
    message: SyncMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): void {
    console.log('Received message from content script:', message);

    switch (message.type) {
      case 'sync_to_skedpal':
        this.handleSyncToSkedPal(message.data);
        break;
      case 'sync_from_skedpal':
        this.handleSyncFromSkedPal();
        break;
      case 'status_update':
        this.forwardToNative(message);
        break;
      case 'auth_required':
        this.handleAuthRequired();
        break;
    }

    sendResponse({ success: true });
  }

  private handleNativeMessage(message: SyncMessage): void {
    console.log('Received message from native host:', message);

    switch (message.type) {
      case 'sync_to_skedpal':
        this.forwardToContentScripts(message);
        break;
      case 'sync_from_skedpal':
        this.requestSyncFromSkedPal();
        break;
    }
  }

  private handleSyncToSkedPal(tasks: TaskData[]): void {
    console.log(`Syncing ${tasks.length} tasks to SkedPal`);
    
    // Forward to all SkedPal tabs
    chrome.tabs.query({ url: ['https://*.skedpal.com/*', 'https://skedpal.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'inject_tasks',
            data: tasks,
            timestamp: Date.now()
          });
        }
      });
    });
  }

  private handleSyncFromSkedPal(): void {
    console.log('Requesting task extraction from SkedPal');
    
    // Request tasks from all SkedPal tabs
    chrome.tabs.query({ url: ['https://*.skedpal.com/*', 'https://skedpal.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'extract_tasks',
            timestamp: Date.now()
          });
        }
      });
    });
  }

  private requestSyncFromSkedPal(): void {
    this.handleSyncFromSkedPal();
  }

  private forwardToContentScripts(message: SyncMessage): void {
    chrome.tabs.query({ url: ['https://*.skedpal.com/*', 'https://skedpal.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message);
        }
      });
    });
  }

  private forwardToNative(message: SyncMessage): void {
    if (this.nativePort) {
      this.nativePort.postMessage(message);
    }
  }

  private handleAuthRequired(): void {
    // Show authentication popup or redirect to login
    chrome.tabs.create({
      url: 'https://skedpal.com/login'
    });
  }

  private handleExtensionClick(tab: chrome.tabs.Tab): void {
    // Open popup or show status
    chrome.action.setPopup({
      tabId: tab.id,
      popup: 'popup.html'
    });
  }

  // Public methods for external access
  public getStatus(): { isAuthenticated: boolean; nativeConnected: boolean } {
    return {
      isAuthenticated: this.isAuthenticated,
      nativeConnected: this.nativePort !== null
    };
  }

  public authenticate(): void {
    // TODO: Implement SkedPal authentication
    this.isAuthenticated = true;
  }
}

// Initialize background service
const backgroundService = new BackgroundService();