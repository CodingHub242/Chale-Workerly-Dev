import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface WorkerlyUser {
  id: number;
  email: string;
  role: 'admin' | 'temp' | 'client';
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<WorkerlyUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/workerly`;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
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

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    window.location.reload();
  }

  getCurrentUser(): WorkerlyUser | null {
    return this.currentUserSubject.value;
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
