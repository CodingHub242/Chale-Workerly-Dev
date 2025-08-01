import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

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

  constructor(
    private route: ActivatedRoute,
    private timesheetService: TimesheetService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    const timesheetId = this.route.snapshot.params['id'];
    this.timesheetService.getTimesheet(timesheetId).subscribe(timesheet => {
      this.timesheet = timesheet;
    });
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
}
