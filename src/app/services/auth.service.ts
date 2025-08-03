import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface WorkerlyUser {
  id: number;
  email: string;
  role: 'admin' | 'temp' | 'client';
  firstName: string;
  lastName: string;
  // Additional temp properties when role is 'temp'
  title?: string;
  phone?: string;
  experience?: number;
  basePay?: number;
  skills?: string[];
  status?: 'active' | 'inactive' | 'on-leave';
  tempId?: any;
}

export interface Temp {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password:string;
    experience: number; // in years
    basePay: number; // per hour
    skills: string[];
    role: 'admin' | 'temp' | 'client';
    status: 'active' | 'inactive' | 'on-leave';
    approvalStatus?: 'pending' | 'approved' | 'declined';

    tempId?:any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<WorkerlyUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  currentUser:any;

  private apiUrl = `${environment.apiUrl}/workerly`;

  constructor(private http: HttpClient,private router:Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }

    this.currentUser = this.getCurrentUser();
  }

  login(email: string, password: string): Observable<WorkerlyUser> {
    return this.http.post<WorkerlyUser>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(email: string, password: string, firstName: string, lastName: string,role:'admin'): Observable<WorkerlyUser> {
    return this.http.post<WorkerlyUser>(`${this.apiUrl}/signup`, { email, password, firstName, lastName,role })
      .pipe(
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  loginTemp(email: string, password: string): Observable<Temp> {
    return this.http.post<Temp>(`${this.apiUrl}/loginTemp`, { email, password })
      .pipe(
        tap((user:any) => {
          //console.log(user);
          localStorage.setItem('currentUser', JSON.stringify(user.temp));
          this.currentUserSubject.next(user.temp);
        })
      );
  }

   addTemp(title: string, password: string, firstName: string, lastName: string,role:'temp',status:string,phone:string,email:string,experience:number,basePay:number,skills:string[],approvalStatus:'pending'): Observable<Temp> {
    return this.http.post<Temp>(`${this.apiUrl}/signTemp`, { email, password, firstName, lastName,role,title,status,phone,experience,basePay,skills,approvalStatus })
      .pipe(
        tap((user:any) => {
          localStorage.setItem('currentUser', JSON.stringify(user.temp));
          this.currentUserSubject.next(user.temp);
        })
      );
  }

  logout(): void {
    const currentUser = this.getCurrentUser();
    const wasTemp = currentUser?.role === 'temp';
    
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    
    // Navigate to appropriate login page based on user role
    if (wasTemp) {
      this.router.navigate(['/templogin']).then(() => {
        window.location.reload();
      });
    } else {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    }
  }

  getCurrentUser(): WorkerlyUser | Temp | null {
    const user = this.currentUserSubject.value;
    if (user && user.role === 'temp') {
      // Return the temp user data with all temp-specific properties
      return user as Temp;
    }
    return user;
  }

  isTemp(): boolean {
    return this.getCurrentUser()?.role === 'temp';
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  isClient(): boolean {
    return this.getCurrentUser()?.role === 'client';
  }
}
