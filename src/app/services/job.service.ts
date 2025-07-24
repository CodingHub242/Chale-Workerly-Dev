import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/job.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private apiUrl = `${environment.apiUrl}/jobs`;
  private postapiUrl = `${environment.apiUrl}/updateJobStat`;

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJob(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  addJob(job: FormData): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  getJobsByClient(clientId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/client/${clientId}`);
  }

  updateJob(job: FormData): Observable<any> {
    const id = job.get('id');
    // Use POST for updates to handle FormData correctly, and let Laravel spoof the method.
    return this.http.post(`${this.apiUrl}/${id}`, job);
  }

  updateJobStat(id:number,job:any): Observable<any> {
   // const id = job.get('id');
    // Use POST for updates to handle FormData correctly, and let Laravel spoof the method.
    return this.http.put(`${this.postapiUrl}/${id}`, job);
  }
}