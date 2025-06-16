import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

declare global {
  namespace Express {
    interface Request {
      userPlan?: string;
      userId?: string;
    }
  }
}

export const optimizerContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Inject plan — assuming req.user is populated by auth middleware
    const userId = (req.user as any)?.claims?.sub;
    
    if (userId) {
      const userRecord = await storage.getUser(userId);
      req.userPlan = userRecord?.subscriptionPlan || "free";
      req.userId = userId;
    } else {
      req.userPlan = "free";
    }
    
    next();
  } catch (error) {
    console.error('Error setting optimizer context:', error);
    req.userPlan = "free";
    next();
  }
};