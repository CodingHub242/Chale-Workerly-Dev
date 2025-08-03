import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    // If no user is logged in, redirect to login
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // If user is logged in but not an admin, redirect to temp dashboard
    if (currentUser.role !== 'admin') {
      this.router.navigate(['/temp-dashboard']);
      return false;
    }
    
    // User is logged in and has admin role
    return true;
  }
}