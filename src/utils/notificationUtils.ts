
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
 * Now ensuring even greater uniqueness with sanitized status values and timestamp
 */
export function createNotificationId(type: string, entityId?: string, oldStatus?: string, newStatus?: string): string {
  const timestamp = Date.now();
  
  if (entityId) {
    if (oldStatus && newStatus) {
      // Sanitize status strings to avoid any special characters
      const sanitizedOldStatus = oldStatus.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const sanitizedNewStatus = newStatus.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      
      // Create a truly unique ID with sanitized values
      return `${type}_${entityId}_${sanitizedOldStatus}_${sanitizedNewStatus}_${timestamp}`;
    }
    return `${type}_${entityId}_${timestamp}`;
  }
  
  const randomPart = Math.floor(Math.random() * 10000);
  return `${type}_${timestamp}_${randomPart}`;
}
