import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  
  private nextId = 1;

  constructor() { }

  // Show a notification
  showNotification(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const notifications = this.notificationsSubject.value;
    const newNotification: Notification = {
      id: this.nextId++,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    this.notificationsSubject.next([newNotification, ...notifications]);
  }

  // Mark a notification as read
  markAsRead(id: number) {
    const notifications = this.notificationsSubject.value.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    this.notificationsSubject.next(notifications);
  }

  // Mark all notifications as read
  markAllAsRead() {
    const notifications = this.notificationsSubject.value.map(notification => 
      ({ ...notification, read: true })
    );
    this.notificationsSubject.next(notifications);
  }

  // Remove a notification
  removeNotification(id: number) {
    const notifications = this.notificationsSubject.value.filter(
      notification => notification.id !== id
    );
    this.notificationsSubject.next(notifications);
  }

  // Get unread notifications count
  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }
}