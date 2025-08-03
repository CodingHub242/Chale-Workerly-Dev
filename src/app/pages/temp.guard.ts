import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TempGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    // If no user is logged in, redirect to temp login
    if (!currentUser) {
      this.router.navigate(['/templogin']);
      return false;
    }
    
    // If user is logged in but not a temp, redirect to appropriate dashboard
    if (currentUser.role !== 'temp') {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    // User is logged in and has temp role
    return true;
  }
}