import { Component, Input, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Client } from 'src/app/models/client.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.page.html',
  styleUrls: ['./jobs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class JobsPage implements OnInit {
  @Input('Client') clients = {} as Array<Client>;
  jobs: Job[] = [];

  constructor(
    private jobService: JobService,
    private router: Router
  ) { }

  ngOnInit() {
    this.jobService.getJobs().subscribe((jobs:any) => {
      this.jobs = jobs;

      this.jobs.forEach((element:any) => {
          
          if (element.client) {
            element.client = JSON.parse(element.client);
            console.log(element.client);
          }
      });
    });
  }

  addJob() {
    this.router.navigate(['/job-form']);
  }

  viewJob(id: number) {
    this.router.navigate(['/job-detail', id]);
  }

}
