
import { Notification } from "@/types/notification";

/**
 * Service for storing and retrieving notifications from localStorage
 */
export const notificationStorage = {
  /**
   * Load saved notifications from localStorage
   */
  loadNotifications(): Notification[] {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        console.log('Loading saved notifications from localStorage:', savedNotifications);
        return JSON.parse(savedNotifications);
      }
      console.log('No saved notifications found in localStorage');
      return [];
    } catch (e) {
      console.error('Error loading notifications from localStorage:', e);
      return [];
    }
  },

  /**
   * Save notifications to localStorage
   */
  saveNotifications(notifications: Notification[]): void {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      console.log('Notifications saved to localStorage:', notifications.length);
    }
  },

  /**
   * Load dismissed notification IDs from localStorage
   */
  loadDismissedIds(): string[] {
    try {
      const savedDismissed = localStorage.getItem('dismissedNotifications');
      if (savedDismissed) {
        console.log('Loading dismissed notifications from localStorage:', savedDismissed);
        return JSON.parse(savedDismissed);
      }
      console.log('No dismissed notifications found in localStorage');
      return [];
    } catch (e) {
      console.error('Error loading dismissed IDs from localStorage:', e);
      return [];
    }
  },

  /**
   * Save dismissed notification IDs to localStorage
   */
  saveDismissedIds(dismissedIds: string[]): void {
    if (dismissedIds.length > 0) {
      localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedIds));
      console.log('Dismissed notifications updated in localStorage:', dismissedIds);
    }
  }
};
