import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shift } from '../models/shift.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  private apiUrl = `${environment.apiUrl}/shifts`;
  private postapiUrl = `${environment.apiUrl}/updateStat`;

  constructor(private http: HttpClient) { }

  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.apiUrl);
  }

  getShift(id: number): Observable<Shift> {
    return this.http.get<Shift>(`${this.apiUrl}/${id}`);
  }

  addShift(shiftData: any): Observable<Shift> {
    return this.http.post<Shift>(this.apiUrl, shiftData);
  }

  updateShift(id: number, shiftData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, shiftData);
  }

  updateShiftStat(id: number, shiftData: any): Observable<any> {
    return this.http.put(`${this.postapiUrl}/${id}`, shiftData);
  }

   updateShiftTStat(id: number, shiftData: any): Observable<any> {
    return this.http.put(`${this.postapiUrl}/tstat/${id}`, shiftData);
  }

  getShiftsByTemp(tempId: number): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/temp/${tempId}`);
  }
}