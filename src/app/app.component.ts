import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  public appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Shifts', url: '/shifts', icon: 'calendar' },
    { title: 'Jobs', url: '/jobs', icon: 'briefcase' },
    { title: 'Clients', url: '/clients', icon: 'people' },
    { title: 'Temps', url: '/temps', icon: 'person' },
    { title: 'Timesheets', url: '/timesheets', icon: 'document' },
    { title: 'Invoices', url: '/invoices', icon: 'cash' },
    { title: 'Profile', url: '/profile', icon: 'person-circle' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];

  constructor() {}
}
