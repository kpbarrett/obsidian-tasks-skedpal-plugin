/**
 * Chrome Extension Bridge for Obsidian Plugin
 * Provides native messaging communication between Obsidian and Chrome extension
 */

export interface ChromeMessage {
    type: string;
    data?: any;
    correlationId?: string;
}

export interface ChromeResponse {
    success: boolean;
    data?: any;
    error?: string;
    correlationId?: string;
}

export interface ConnectionStatus {
    connected: boolean;
    lastError?: string;
    lastConnected?: Date;
}

export class ChromeExtensionBridge {
    private port: chrome.runtime.Port | null = null;
    private messageHandlers: Map<string, (data: any) => Promise<any>> = new Map();
    private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (error: any) => void }> = new Map();
    private connectionStatus: ConnectionStatus = { connected: false };
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // Start with 1 second

    constructor() {
        this.setupMessageHandlers();
    }

    /**
     * Initialize connection to Chrome extension
     */
    async connect(): Promise<boolean> {
        try {
            if (!chrome?.runtime) {
                throw new Error('Chrome runtime not available');
            }

            this.port = chrome.runtime.connectNative('com.obsidian.tasks.skedpal');
            
            this.port.onMessage.addListener((message: ChromeMessage) => {
                this.handleIncomingMessage(message);
            });

            this.port.onDisconnect.addListener(() => {
                this.handleDisconnect();
            });

            this.connectionStatus = {
                connected: true,
                lastConnected: new Date()
            };
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;

            console.log('Chrome extension bridge connected successfully');
            return true;
        } catch (error) {
            console.error('Failed to connect to Chrome extension:', error);
            this.connectionStatus = {
                connected: false,
                lastError: error.message
            };
            return false;
        }
    }

    /**
     * Disconnect from Chrome extension
     */
    disconnect(): void {
        if (this.port) {
            this.port.disconnect();
            this.port = null;
        }
        this.connectionStatus.connected = false;
        this.pendingRequests.clear();
    }

    /**
     * Send message to Chrome extension
     */
    async sendMessage(type: string, data?: any): Promise<any> {
        if (!this.port || !this.connectionStatus.connected) {
            throw new Error('Not connected to Chrome extension');
        }

        const correlationId = this.generateCorrelationId();
        const message: ChromeMessage = {
            type,
            data,
            correlationId
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(correlationId, { resolve, reject });
            
            // Set timeout for response
            setTimeout(() => {
                if (this.pendingRequests.has(correlationId)) {
                    this.pendingRequests.delete(correlationId);
                    reject(new Error('Request timeout'));
                }
            }, 30000); // 30 second timeout

            try {
                this.port!.postMessage(message);
            } catch (error) {
                this.pendingRequests.delete(correlationId);
                reject(error);
            }
        });
    }

    /**
     * Register message handler
     */
    registerHandler(type: string, handler: (data: any) => Promise<any>): void {
        this.messageHandlers.set(type, handler);
    }

    /**
     * Get current connection status
     */
    getConnectionStatus(): ConnectionStatus {
        return { ...this.connectionStatus };
    }

    /**
     * Force reconnection attempt
     */
    async reconnect(): Promise<boolean> {
        this.disconnect();
        return await this.connect();
    }

    private setupMessageHandlers(): void {
        // Register default handlers
        this.registerHandler('ping', async () => ({ pong: true }));
        this.registerHandler('status', async () => this.getConnectionStatus());
    }

    private handleIncomingMessage(message: ChromeMessage): void {
        // Handle response to pending request
        if (message.correlationId && this.pendingRequests.has(message.correlationId)) {
            const { resolve, reject } = this.pendingRequests.get(message.correlationId)!;
            this.pendingRequests.delete(message.correlationId);
            
            if (message.type === 'error') {
                reject(new Error(message.data?.error || 'Unknown error'));
            } else {
                resolve(message.data);
            }
            return;
        }

        // Handle incoming request
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            handler(message.data)
                .then(result => {
                    if (message.correlationId) {
                        this.sendResponse(message.correlationId, { success: true, data: result });
                    }
                })
                .catch(error => {
                    if (message.correlationId) {
                        this.sendResponse(message.correlationId, { success: false, error: error.message });
                    }
                });
        }
    }

    private handleDisconnect(): void {
        this.port = null;
        this.connectionStatus.connected = false;
        this.connectionStatus.lastError = 'Disconnected from Chrome extension';

        // Reject all pending requests
        for (const [correlationId, { reject }] of this.pendingRequests) {
            reject(new Error('Connection lost'));
        }
        this.pendingRequests.clear();

        // Attempt reconnection with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.reconnectDelay *= 2; // Exponential backoff
                this.connect();
            }, this.reconnectDelay);
        }
    }

    private sendResponse(correlationId: string, response: ChromeResponse): void {
        if (this.port && this.connectionStatus.connected) {
            const message: ChromeMessage = {
                type: 'response',
                data: response,
                correlationId
            };
            this.port.postMessage(message);
        }
    }

    private generateCorrelationId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}