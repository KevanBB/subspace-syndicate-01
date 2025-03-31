
/**
 * Admin Logger Utility
 * 
 * A utility for logging admin actions for audit purposes
 */

export enum LogAction {
  VIEW = 'view',
  UPDATE = 'update',
  DELETE = 'delete',
  CREATE = 'create',
  LOGIN = 'login',
  VIEW_SENSITIVE = 'view_sensitive',
}

export interface LogEntry {
  userId: string;
  action: LogAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Logs an admin action
 */
export async function logAdminAction(
  userId: string,
  action: LogAction,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  const logEntry: LogEntry = {
    userId,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date(),
  };
  
  // In a real implementation, this would write to a database or send to a logging service
  console.log('ADMIN ACTION LOGGED:', logEntry);
  
  return logEntry;
}

// Function to get headers utility for Next.js
export const getHeaders = () => {
  return {
    headers: () => new Headers(),
  };
};

export const headersList = getHeaders();
