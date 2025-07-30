import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timesheet, TimesheetStatus } from '../models/timesheet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  private apiUrl = `${environment.apiUrl}/timesheets`;

  constructor(private http: HttpClient) { }

  getTimesheets(filters?: { tempId?: number; status?: TimesheetStatus }): Observable<Timesheet[]> {
    let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.tempId) params.append('tempId', filters.tempId.toString());
      if (filters.status) params.append('status', filters.status);
      url += `?${params.toString()}`;
    }
    return this.http.get<Timesheet[]>(url);
  }

  getTimesheet(id: number): Observable<Timesheet> {
    return this.http.get<Timesheet>(`${this.apiUrl}/${id}`);
  }

  addTimesheet(timesheet: Timesheet): Observable<Timesheet> {
    return this.http.post<Timesheet>(this.apiUrl, timesheet);
  }

  updateTimesheet(timesheet: Timesheet): Observable<any> {
    return this.http.put(`${this.apiUrl}/${timesheet.id}`, timesheet);
  }

  submitTimesheet(id: number): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.apiUrl}/${id}/submit`, {});
  }

  approveTimesheet(id: number, approverId: number): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.apiUrl}/${id}/approve`, { approverId });
  }

  rejectTimesheet(id: number, rejectionReason: string): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.apiUrl}/${id}/reject`, { rejectionReason });
  }

  getCurrentPeriod(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
}