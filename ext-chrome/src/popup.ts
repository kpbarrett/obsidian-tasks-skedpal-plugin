// Popup script for Chrome extension

interface StatusData {
  isAuthenticated: boolean;
  nativeConnected: boolean;
  skedpalTabs: number;
}

class PopupController {
  private statusElement!: HTMLElement;
  private obsidianStatusElement!: HTMLElement;
  private skedpalStatusElement!: HTMLElement;
  private syncToSkedPalButton!: HTMLButtonElement;
  private syncFromSkedPalButton!: HTMLButtonElement;
  private authenticateButton!: HTMLButtonElement;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadStatus();
  }

  private initializeElements(): void {
    this.statusElement = document.getElementById('status')!;
    this.obsidianStatusElement = document.getElementById('obsidianStatus')!;
    this.skedpalStatusElement = document.getElementById('skedpalStatus')!;
    this.syncToSkedPalButton = document.getElementById('syncToSkedPal') as HTMLButtonElement;
    this.syncFromSkedPalButton = document.getElementById('syncFromSkedPal') as HTMLButtonElement;
    this.authenticateButton = document.getElementById('authenticate') as HTMLButtonElement;
  }

  private setupEventListeners(): void {
    this.syncToSkedPalButton.addEventListener('click', () => {
      this.syncToSkedPal();
    });

    this.syncFromSkedPalButton.addEventListener('click', () => {
      this.syncFromSkedPal();
    });

    this.authenticateButton.addEventListener('click', () => {
      this.authenticate();
    });
  }

  private async loadStatus(): Promise<void> {
    try {
      // Get extension status
      const status = await this.getExtensionStatus();
      this.updateStatusDisplay(status);
    } catch (error) {
      console.error('Failed to load status:', error);
      this.showError('Failed to load extension status');
    }
  }

  private async getExtensionStatus(): Promise<StatusData> {
    // Check for SkedPal tabs
    const skedpalTabs = await new Promise<number>((resolve) => {
      chrome.tabs.query({ url: ['https://*.skedpal.com/*', 'https://skedpal.com/*'] }, (tabs) => {
        resolve(tabs.length);
      });
    });

    // Get background service status
    const backgroundStatus = await new Promise<{ isAuthenticated: boolean; nativeConnected: boolean }>((resolve) => {
      chrome.runtime.sendMessage({ type: 'get_status' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ isAuthenticated: false, nativeConnected: false });
        } else {
          resolve(response || { isAuthenticated: false, nativeConnected: false });
        }
      });
    });

    return {
      ...backgroundStatus,
      skedpalTabs
    };
  }

  private updateStatusDisplay(status: StatusData): void {
    // Update overall status
    if (status.nativeConnected && status.skedpalTabs > 0) {
      this.statusElement.textContent = 'Ready to sync';
      this.statusElement.className = 'status connected';
      this.syncToSkedPalButton.disabled = false;
      this.syncFromSkedPalButton.disabled = false;
    } else if (status.skedpalTabs > 0) {
      this.statusElement.textContent = 'SkedPal detected - Obsidian not connected';
      this.statusElement.className = 'status disconnected';
      this.syncToSkedPalButton.disabled = true;
      this.syncFromSkedPalButton.disabled = false;
    } else {
      this.statusElement.textContent = 'Open SkedPal to sync';
      this.statusElement.className = 'status disconnected';
      this.syncToSkedPalButton.disabled = true;
      this.syncFromSkedPalButton.disabled = true;
    }

    // Update individual status indicators
    this.obsidianStatusElement.textContent = status.nativeConnected ? 'Connected' : 'Not connected';
    this.obsidianStatusElement.style.color = status.nativeConnected ? '#28a745' : '#dc3545';

    this.skedpalStatusElement.textContent = status.skedpalTabs > 0 ? 'Detected' : 'Not detected';
    this.skedpalStatusElement.style.color = status.skedpalTabs > 0 ? '#28a745' : '#dc3545';

    // Update authentication button
    this.authenticateButton.textContent = status.isAuthenticated ? 'Re-authenticate' : 'Authenticate';
  }

  private async syncToSkedPal(): Promise<void> {
    try {
      this.showLoading('Syncing to SkedPal...');
      
      // Request sync from Obsidian
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'sync_to_skedpal' 
        }, (response) => {
          resolve(response);
        });
      });

      if (response?.success) {
        this.showSuccess('Tasks synced to SkedPal');
      } else {
        this.showError('Failed to sync tasks');
      }
    } catch (error) {
      console.error('Sync to SkedPal failed:', error);
      this.showError('Sync failed: ' + error.message);
    }
  }

  private async syncFromSkedPal(): Promise<void> {
    try {
      this.showLoading('Syncing from SkedPal...');
      
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'sync_from_skedpal' 
        }, (response) => {
          resolve(response);
        });
      });

      if (response?.success) {
        this.showSuccess('Tasks synced from SkedPal');
      } else {
        this.showError('Failed to sync tasks');
      }
    } catch (error) {
      console.error('Sync from SkedPal failed:', error);
      this.showError('Sync failed: ' + error.message);
    }
  }

  private async authenticate(): Promise<void> {
    try {
      this.showLoading('Authenticating...');
      
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'authenticate' 
        }, (response) => {
          resolve(response);
        });
      });

      if (response?.success) {
        this.showSuccess('Authentication successful');
        // Reload status
        setTimeout(() => this.loadStatus(), 1000);
      } else {
        this.showError('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.showError('Authentication failed: ' + error.message);
    }
  }

  private showLoading(message: string): void {
    this.statusElement.textContent = message;
    this.statusElement.className = 'status';
    this.statusElement.style.backgroundColor = '#fff3cd';
    this.statusElement.style.color = '#856404';
    this.statusElement.style.borderColor = '#ffeaa7';
  }

  private showSuccess(message: string): void {
    this.statusElement.textContent = message;
    this.statusElement.className = 'status connected';
  }

  private showError(message: string): void {
    this.statusElement.textContent = message;
    this.statusElement.className = 'status disconnected';
  }
}

// Initialize popup controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});