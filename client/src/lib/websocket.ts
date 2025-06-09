import { io, Socket } from 'socket.io-client';

class WebSocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Function[]> = new Map();

  initialize(userId: string) {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.userId = userId;
    
    // Connect to WebSocket server
    this.socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.setupEventHandlers();
    this.authenticate();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Set up message handlers
    this.socket.on('alert', (data) => {
      this.emit('alert', data);
    });

    this.socket.on('metrics-update', (data) => {
      this.emit('metrics-update', data);
    });

    this.socket.on('new-customer-message', (data) => {
      this.emit('new-customer-message', data);
    });

    this.socket.on('ai-response-generated', (data) => {
      this.emit('ai-response-generated', data);
    });

    this.socket.on('human-intervention-required', (data) => {
      this.emit('human-intervention-required', data);
    });

    this.socket.on('interaction-updated', (data) => {
      this.emit('interaction-updated', data);
    });

    this.socket.on('employee-status-changed', (data) => {
      this.emit('employee-status-changed', data);
    });

    this.socket.on('restriction-alert', (data) => {
      this.emit('restriction-alert', data);
    });

    this.socket.on('ai-recommendation', (data) => {
      this.emit('ai-recommendation', data);
    });

    this.socket.on('low-confidence-response', (data) => {
      this.emit('low-confidence-response', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  private authenticate() {
    if (this.socket && this.userId) {
      this.socket.emit('authenticate', this.userId);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.userId) {
          this.initialize(this.userId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Public methods for sending messages
  joinPage(pageId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-page', pageId);
    }
  }

  sendCustomerMessage(data: {
    pageId: string;
    customerId: string;
    customerName: string;
    message: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('customer-message', data);
    }
  }

  sendEmployeeResponse(data: {
    interactionId: string;
    response: string;
    employeeId: string;
    responseTime: number;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('employee-response', data);
    }
  }

  requestMetrics(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('request-metrics', userId);
    }
  }

  updateEmployeeActivity(data: { employeeId: string; isActive: boolean }) {
    if (this.socket?.connected) {
      this.socket.emit('employee-active', data);
    }
  }

  // Event subscription methods
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.eventHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager();

export const initializeWebSocket = (userId: string) => {
  websocketManager.initialize(userId);
};

export const getWebSocket = () => websocketManager;

export default websocketManager;
