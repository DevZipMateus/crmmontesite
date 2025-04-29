
/**
 * Format a date for display in notifications
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Create a unique notification ID
 */
export function createNotificationId(type: string, entityId?: string): string {
  const timestamp = Date.now();
  
  if (entityId) {
    return `${type}_${entityId}`;
  }
  
  const randomPart = Math.floor(Math.random() * 10000);
  return `${type}_${timestamp}_${randomPart}`;
}
