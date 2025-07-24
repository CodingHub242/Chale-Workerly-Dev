import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Temp } from '../models/temp.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TempService {

  private apiUrl = `${environment.apiUrl}/temps`;

  constructor(private http: HttpClient) { }

  getTemps(): Observable<Temp[]> {
    return this.http.get<Temp[]>(this.apiUrl);
  }

  getTemp(id: number): Observable<Temp> {
    return this.http.get<Temp>(`${this.apiUrl}/${id}`);
  }

  addTemp(temp: Temp): Observable<Temp> {
    return this.http.post<Temp>(this.apiUrl, temp);
  }

  updateTemp(temp: Temp): Observable<any> {
    return this.http.put(`${this.apiUrl}/${temp.id}`, temp);
  }
}