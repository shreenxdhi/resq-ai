import { toast } from 'react-toastify';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
  onClick?: () => void;
}

class NotificationService {
  private hasPermission: boolean = false;
  private permissionRequested: boolean = false;

  constructor() {
    this.checkPermission();
  }

  // Check if browser supports notifications and has permission
  private checkPermission(): void {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      this.permissionRequested = false;
    }
  }

  // Request permission for notifications
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (this.permissionRequested) {
      return this.hasPermission;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionRequested = true;
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show notification with fallback to toast
  async notify(options: NotificationOptions): Promise<void> {
    // Try browser notification first
    if (await this.showBrowserNotification(options)) {
      return;
    }

    // Fallback to toast notification
    this.showToastNotification(options);
  }

  // Show browser notification
  private async showBrowserNotification(options: NotificationOptions): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data
      });

      if (options.onClick) {
        notification.onclick = options.onClick;
      }

      return true;
    } catch (error) {
      console.error('Error showing browser notification:', error);
      return false;
    }
  }

  // Show toast notification
  private showToastNotification(options: NotificationOptions): void {
    toast.info(`${options.title}: ${options.body}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClick: options.onClick
    });
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermissionStatus(): string {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService; 