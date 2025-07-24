import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timesheet } from '../models/timesheet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  private apiUrl = `${environment.apiUrl}/timesheets`;

  constructor(private http: HttpClient) { }

  getTimesheets(): Observable<Timesheet[]> {
    return this.http.get<Timesheet[]>(this.apiUrl);
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
}