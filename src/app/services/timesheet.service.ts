import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timesheet, TimesheetStatus } from '../models/timesheet.model';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  private apiUrl = `${environment.apiUrl}/timesheets`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

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

   getTempsheet(filters?: { tempId?: number; status?: TimesheetStatus }): Observable<Timesheet[]> {
   let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.tempId) params.append('tempId', filters.tempId.toString());
      if (filters.status) params.append('status', filters.status);
      url += `?${params.toString()}`;
    }
    return this.http.get<Timesheet[]>(`${this.apiUrl}/temp/${filters!.tempId}`);
  }

  addTimesheet(timesheet: Timesheet): Observable<Timesheet> {
    return this.http.post<Timesheet>(this.apiUrl, timesheet);
  }

  updateTimesheet(timesheet: Timesheet): Observable<any> {
    return this.http.put(`${this.apiUrl}/${timesheet.id}`, timesheet);
  }

  submitTimesheet(id: number): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.apiUrl}/${id}/submit`, {}).pipe(
      map(timesheet => {
        this.notificationService.showNotification(
          'Timesheet Submitted',
          'Your timesheet has been submitted for approval',
          'success'
        );
        return timesheet;
      })
    );
  }

  approveTimesheet(id: number, approverId: number): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.apiUrl}/${id}/approve`, { approverId }).pipe(
      map(timesheet => {
        this.notificationService.showNotification(
          'Timesheet Approved',
          'Your timesheet has been approved',
          'success'
        );
        return timesheet;
      })
    );
  }

  rejectTimesheet(id: number, rejectionReason: string): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.apiUrl}/${id}/reject`, { rejectionReason }).pipe(
      map(timesheet => {
        this.notificationService.showNotification(
          'Timesheet Rejected',
          `Your timesheet has been rejected. Reason: ${rejectionReason}`,
          'error'
        );
        return timesheet;
      })
    );
  }

  deleteTimesheet(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/delete/${id}`).pipe(
      map((response:any) => {
        if(response.success)
        {
          this.notificationService.showNotification(
            'Timesheet Deleted',
            'The timesheet has been deleted successfully',
            'success'
          );
        }
        else
          {
            this.notificationService.showNotification(
              'Timesheet Deletion Failed',
              response.error,
              'error'
            );
          }
        // this.notificationService.showNotification(
        //   'Timesheet Deleted',
        //   'The timesheet has been deleted successfully',
        //   'success'
        // );
          return response;
      })
    );
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