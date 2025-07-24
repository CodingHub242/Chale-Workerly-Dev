import { Component, Input, OnInit } from '@angular/core';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { Router, RouterModule } from '@angular/router';
import { ActionSheetController, IonicModule } from '@ionic/angular';
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
    private router: Router,
    private actionSheetCtrl: ActionSheetController
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

    async updateStatus(job: Job) {
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Update Status',
        buttons: [
          {
            text: 'Assigning In Progress',
            handler: () => this.saveStatus(job, 'Assigning In Progress')
          },
          {
            text: 'Assigned',
            handler: () => this.saveStatus(job, 'Assigned')
          },
          {
            text: 'Completed',
            handler: () => this.saveStatus(job, 'Completed')
          },
          {
            text: 'Cancelled',
            handler: () => this.saveStatus(job, 'Cancelled')
          },
          {
            text: 'InActive',
            handler: () => this.saveStatus(job, 'InActive')
          },
          {
            text: 'Declined',
            handler: () => this.saveStatus(job, 'Declined')
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }
  
    saveStatus(job: Job, status: 'Assigning In Progress' | 'Assigned' | 'Completed' | 'Cancelled' | 'InActive' | 'Declined') {
      const updatedJob = { ...job, status };
      
      this.jobService.updateJobStat(job.id, { status: status }).subscribe(() => {
        job.status = status;
      });
    }

}
