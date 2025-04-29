
/**
 * Utility functions for notifications
 */

// Helper function to format date for notifications
export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000; // 24 hours in milliseconds
  
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  if (date.getTime() >= today) {
    return `Hoje, ${time}`;
  } else if (date.getTime() >= yesterday) {
    return `Ontem, ${time}`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}

// Create a unique ID for notifications
export function createNotificationId(prefix: string, entityId?: string): string {
  return `${prefix}-${Date.now()}-${entityId || Math.random().toString(36).substring(2, 9)}`;
}
