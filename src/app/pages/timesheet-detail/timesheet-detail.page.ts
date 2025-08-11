import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { Job } from 'src/app/models/job.model';
import { JobService } from 'src/app/services/job.service';
import { Temp } from 'src/app/models/temp.model';
import { TempService } from 'src/app/services/temp.service';

@Component({
  selector: 'app-timesheet-detail',
  templateUrl: './timesheet-detail.page.html',
  styleUrls: ['./timesheet-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TimesheetDetailPage implements OnInit {

  timesheet!: Timesheet;
  currentUser: any;
  job: Job[] = [];
  temps: Temp[] = [];

  constructor(
    private route: ActivatedRoute,
    private timesheetService: TimesheetService,
    private router: Router,
    private jobService: JobService,
    private tempService: TempService,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
      const timesheetId = this.route.snapshot.params['id'];
      this.timesheetService.getTimesheet(timesheetId).subscribe(timesheet => {
      this.timesheet = timesheet;
      //console.log('Timesheet details:', this.timesheet);
    });

    this.loadTemps();
    this.loadJobs();
  }

  ionViewWillEnter()
  {
      
  }

  editTimesheet() {
    this.router.navigate(['/timesheet-form', this.timesheet.id]);
  }

  async approveTimesheet() {
    const alert = await this.alertController.create({
      header: 'Confirm Approval',
      message: 'Are you sure you want to approve this timesheet?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Approve',
          handler: () => {
            this.timesheetService.approveTimesheet(this.timesheet.id, this.currentUser.id).subscribe(
              updatedTimesheet => {
                this.timesheet = updatedTimesheet;
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async rejectTimesheet() {
    const alert = await this.alertController.create({
      header: 'Reject Timesheet',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Reason for rejection'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Reject',
          handler: (data) => {
            this.timesheetService.rejectTimesheet(this.timesheet.id, data.reason).subscribe(
              updatedTimesheet => {
                this.timesheet = updatedTimesheet;
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'submitted':
        return 'primary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'medium';
    }
  }

  loadTemps() {
    this.tempService.getTemps().subscribe(temps => {
      this.temps = temps;
    });
  }

  loadJobs() {
    this.jobService.getJobs().subscribe(jobs => {
      this.job = jobs;

    });
  }

    getTempJobById(jobId: string): string {
    const job = this.job.find(t => (t.id).toString() === (jobId).toString());
    //console.log(job);
    return job ? `Job : ${job.title}` : `job ID: ${jobId}`;
  }

    getTempNameById(tempId: number): string {
    const temp = this.temps.find(t => t.id === tempId);
    return temp ? `${temp.firstName} ${temp.lastName}` : `Worker ID: ${tempId}`;
  }
}
