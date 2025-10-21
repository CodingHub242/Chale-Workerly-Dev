import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Temp } from '../models/temp.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TempService {

  private apiUrl = `${environment.apiUrl}/temps`;

  constructor(private http: HttpClient) { }

  getTemps(): Observable<Temp[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((temps: any[]) => temps.map(temp => ({
        ...temp,
        profilePictureUrl: temp.profile_picture_url || temp.profilePictureUrl
      })))
    );
  }

  getTemp(id: number): Observable<Temp> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((temp: any) => ({
        ...temp,
        profilePictureUrl: temp.profile_picture_url || temp.profilePictureUrl
      }))
    );
  }

  addTemp(temp: Temp): Observable<Temp> {
    return this.http.post<Temp>(this.apiUrl, temp);
  }

  updateTemp(temp: Temp): Observable<any> {
    return this.http.put(`${this.apiUrl}/${temp.id}`, temp);
  }

  uploadProfilePicture(tempId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this.http.post(`${this.apiUrl}/${tempId}/upload-profile-picture`, formData);
  }

  approveTemp(tempId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tempId}/approve`, {});
  }

  declineTemp(tempId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tempId}/decline`, {});
  }
}