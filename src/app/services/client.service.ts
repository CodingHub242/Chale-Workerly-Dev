import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = `${environment.apiUrl}/clients`;
  private postapiUrl = `${environment.apiUrl}/clientAdd`;

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  addClient(clientData: FormData): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData);
  }

  updateClient(id: number, clientData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, clientData);
  }
}