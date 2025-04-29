
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
 * Now incorporating status change information for more uniqueness
 */
export function createNotificationId(type: string, entityId?: string, oldStatus?: string, newStatus?: string): string {
  const timestamp = Date.now();
  
  if (entityId) {
    if (oldStatus && newStatus) {
      // Create a truly unique ID that includes status change information
      return `${type}_${entityId}_${oldStatus.replace(/\s+/g, '')}_${newStatus.replace(/\s+/g, '')}_${timestamp}`;
    }
    return `${type}_${entityId}_${timestamp}`;
  }
  
  const randomPart = Math.floor(Math.random() * 10000);
  return `${type}_${timestamp}_${randomPart}`;
}
