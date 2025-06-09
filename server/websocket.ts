import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { storage } from './storage';
import { generateCustomerServiceResponse } from './openai';

export class WebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // User authentication
      socket.on('authenticate', (userId: string) => {
        this.userSockets.set(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
      });

      // Join page-specific rooms for real-time updates
      socket.on('join-page', (pageId: string) => {
        socket.join(`page:${pageId}`);
        console.log(`Socket ${socket.id} joined page room: ${pageId}`);
      });

      // Handle customer service interactions
      socket.on('customer-message', async (data: {
        pageId: string;
        customerId: string;
        customerName: string;
        message: string;
      }) => {
        try {
          // Store the interaction
          const interaction = await storage.createCustomerInteraction({
            pageId: data.pageId,
            customerId: data.customerId,
            customerName: data.customerName,
            message: data.message,
            status: 'pending'
          });

          // Broadcast to all users monitoring this page
          this.io.to(`page:${data.pageId}`).emit('new-customer-message', {
            id: interaction.id,
            ...data,
            createdAt: interaction.createdAt
          });

          // Generate AI response if no human responds within 2 minutes
          setTimeout(async () => {
            const pendingInteraction = await storage.getPendingInteractions(data.pageId);
            const stillPending = pendingInteraction.find(i => i.id === interaction.id);
            
            if (stillPending) {
              await this.generateAIResponse(interaction.id, data.pageId, data.message, data.customerId);
            }
          }, 2 * 60 * 1000); // 2 minutes

        } catch (error) {
          console.error('Error handling customer message:', error);
          socket.emit('error', { message: 'Failed to process customer message' });
        }
      });

      // Handle employee responses
      socket.on('employee-response', async (data: {
        interactionId: string;
        response: string;
        employeeId: string;
        responseTime: number;
      }) => {
        try {
          await storage.updateCustomerInteractionResponse(
            data.interactionId,
            data.response,
            data.employeeId,
            data.responseTime
          );

          // Broadcast the response
          socket.broadcast.emit('interaction-updated', {
            id: data.interactionId,
            response: data.response,
            respondedBy: data.employeeId,
            responseTime: data.responseTime,
            isAutoResponse: false
          });

        } catch (error) {
          console.error('Error handling employee response:', error);
          socket.emit('error', { message: 'Failed to save response' });
        }
      });

      // Real-time metrics updates
      socket.on('request-metrics', async (userId: string) => {
        try {
          const metrics = await storage.getDashboardMetrics(userId);
          socket.emit('metrics-update', metrics);
        } catch (error) {
          console.error('Error fetching metrics:', error);
          socket.emit('error', { message: 'Failed to fetch metrics' });
        }
      });

      // Employee activity tracking
      socket.on('employee-active', (data: { employeeId: string; isActive: boolean }) => {
        storage.updateEmployeeActivity(data.employeeId, data.isActive);
        socket.broadcast.emit('employee-status-changed', data);
      });

      socket.on('disconnect', () => {
        // Remove user from tracking when they disconnect
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            break;
          }
        }
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async generateAIResponse(
    interactionId: string,
    pageId: string,
    customerMessage: string,
    customerId: string
  ) {
    try {
      // Get customer history for context
      const recentInteractions = await storage.getCustomerInteractionsByPage(pageId, 10);
      const customerHistory = recentInteractions
        .filter(i => i.customerId === customerId)
        .map(i => i.message)
        .slice(0, 3);

      // Get page info for business context
      const page = await storage.getFacebookPageById(pageId);
      const businessContext = page?.pageName || 'this business';

      // Generate AI response
      const aiResponse = await generateCustomerServiceResponse(
        customerMessage,
        customerHistory,
        businessContext
      );

      if (!aiResponse.requiresHuman) {
        // Save AI response
        await storage.updateCustomerInteractionResponse(
          interactionId,
          aiResponse.response,
          'ai',
          1 // AI response time is typically under 1 second
        );

        // Broadcast the AI response
        this.io.to(`page:${pageId}`).emit('ai-response-generated', {
          id: interactionId,
          response: aiResponse.response,
          respondedBy: 'ai',
          responseTime: 1,
          isAutoResponse: true,
          confidence: aiResponse.confidence,
          sentiment: aiResponse.sentiment
        });

        // Also send alert if confidence is low
        if (aiResponse.confidence < 0.7) {
          this.io.to(`page:${pageId}`).emit('low-confidence-response', {
            interactionId,
            confidence: aiResponse.confidence,
            message: 'AI response has low confidence - human review recommended'
          });
        }
      } else {
        // Send alert that human intervention is required
        this.io.to(`page:${pageId}`).emit('human-intervention-required', {
          interactionId,
          message: 'Customer inquiry requires human attention',
          customerMessage,
          customerId
        });
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      this.io.to(`page:${pageId}`).emit('ai-response-error', {
        interactionId,
        message: 'Failed to generate AI response'
      });
    }
  }

  // Public methods for sending real-time updates
  public sendAlert(userId: string, alert: {
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  }) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('alert', alert);
    }
  }

  public sendMetricsUpdate(userId: string, metrics: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('metrics-update', metrics);
    }
  }

  public sendRestrictionAlert(userId: string, alert: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('restriction-alert', alert);
    }
  }

  public sendAIRecommendation(userId: string, recommendation: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('ai-recommendation', recommendation);
    }
  }
}

export let websocketService: WebSocketService;

export function initializeWebSocket(server: Server) {
  websocketService = new WebSocketService(server);
  return websocketService;
}
