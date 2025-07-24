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
  private postapiUrl = `${environment.apiUrl}/shiftAdd`;

  constructor(private http: HttpClient) { }

  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.apiUrl);
  }

  getShift(id: number): Observable<Shift> {
    return this.http.get<Shift>(`${this.apiUrl}/${id}`);
  }

  addShift(shift: Shift): Observable<Shift> {
    return this.http.post<Shift>(this.postapiUrl, shift);
  }

  updateShift(shift: Shift): Observable<any> {
    return this.http.put(`${this.apiUrl}/${shift.id}`, shift);
  }
}