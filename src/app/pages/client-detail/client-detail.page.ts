import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { environment } from 'src/environments/environment';
 
 @Component({
   schemas:[ CUSTOM_ELEMENTS_SCHEMA ],
   standalone: true,
   selector: 'app-client-detail',
   templateUrl: './client-detail.page.html',
   styleUrls: ['./client-detail.page.scss'],
   imports: [CommonModule, IonicModule]
 })
 export class ClientDetailPage implements OnInit {
 
   client!: Client;
   jobs: Job[] = [];
   environment = environment;
 
   constructor(
     private route: ActivatedRoute,
     private clientService: ClientService,
     private jobService: JobService,
     private router: Router
   ) { }
 
   ngOnInit() {
     const clientId = this.route.snapshot.params['id'];
     this.clientService.getClient(clientId).subscribe(client => {
       this.client = client;
     });
     this.jobService.getJobsByClient(clientId).subscribe(jobs => {
      this.jobs = jobs;
    });
   }
 
   editClient() {
     this.router.navigate(['/client-form', this.client.id]);
   }

   goToJob(jobId: number) {
    this.router.navigate(['/job-detail', jobId]);
  }
 
 }
