import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.page.html',
  styleUrls: ['./timesheets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TimesheetsPage implements OnInit {

  timesheets: Timesheet[] = [];

  constructor(
    private timesheetService: TimesheetService,
    private router: Router
  ) { }

  ngOnInit() {
    this.timesheetService.getTimesheets().subscribe(timesheets => {
      this.timesheets = timesheets;
    });
  }

  addTimesheet() {
    this.router.navigate(['/timesheet-form']);
  }

  viewTimesheet(id: number) {
    this.router.navigate(['/timesheet-detail', id]);
  }

}
