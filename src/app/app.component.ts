import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  animations: [
    trigger('collapse', [
      state('expanded', style({ height: '*', opacity: 1 })),
      state('collapsed', style({ height: '0', opacity: 0 })),
      transition('expanded <=> collapsed', [
        animate('200ms ease-out')
      ])
    ])
  ]
})
export class AppComponent {
  currentUser: any;
  showNotifications = false;
  notificationsOpen = false;
  unreadCount = 0;
  
  public appPages: any[] = [];

  // Admin menu items
  private adminPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Shifts', url: '/shifts', icon: 'calendar' },
    { title: 'Jobs', url: '/jobs', icon: 'briefcase' },
    { title: 'Clients', url: '/clients', icon: 'people' },
    { title: 'Temps', url: '/temps', icon: 'person' },
    { title: 'Timesheets', url: '/timesheets', icon: 'document' },
    { title: 'Reports', url: '/reports', icon: 'analytics' },
    { title: 'Invoices', url: '/invoices', icon: 'cash' },
  ];

  // Temp menu items
  private tempPages = [
    { title: 'Dashboard', url: '/temp-dashboard', icon: 'home' },
    { title: 'Shifts', url: '/shifts', icon: 'calendar' },
    { title: 'Timesheets', url: '/timesheets', icon: 'document' },
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.setMenuItems();
  }
  
  ngOnInit() {
    // Only show notifications for logged in users
    this.showNotifications = !!this.currentUser;
    
    // Subscribe to notification updates
    this.notificationService.notifications$.subscribe(notifications => {
      this.unreadCount = this.notificationService.getUnreadCount();
    });

    // Subscribe to auth changes to update menu
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      //console.log('User changed:', user);
      this.setMenuItems();
    });
  }

  setMenuItems() {
    if (this.currentUser) {
      if (this.currentUser.role === 'temp') {
        this.appPages = this.tempPages;
      } else {
        this.appPages = this.adminPages;
      }
    } else {
      this.appPages = [];
    }
  }
  
  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
  }
}
