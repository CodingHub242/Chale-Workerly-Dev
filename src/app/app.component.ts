import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

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
