import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timesheet-detail',
  templateUrl: './timesheet-detail.page.html',
  styleUrls: ['./timesheet-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TimesheetDetailPage implements OnInit {

  timesheet!: Timesheet;

  constructor(
    private route: ActivatedRoute,
    private timesheetService: TimesheetService,
    private router: Router
  ) { }

  ngOnInit() {
    const timesheetId = this.route.snapshot.params['id'];
    this.timesheetService.getTimesheet(timesheetId).subscribe(timesheet => {
      this.timesheet = timesheet;
    });
  }

  editTimesheet() {
    this.router.navigate(['/timesheet-form', this.timesheet.id]);
  }

}
