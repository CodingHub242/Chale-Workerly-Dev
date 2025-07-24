import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetService } from '../../services/timesheet.service';
import { ShiftService } from '../../services/shift.service';
import { Timesheet } from '../../models/timesheet.model';
import { Shift } from '../../models/shift.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.page.html',
  styleUrls: ['./timesheet-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule,ReactiveFormsModule]
})
export class TimesheetFormPage implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  timesheetId: number = 0;
  shifts: Shift[] = [];

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private shiftService: ShiftService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      shiftIds: [[], Validators.required],
      submittedDate: [new Date().toISOString(), Validators.required],
      approved: [false]
    });

    this.shiftService.getShifts().subscribe(shifts => this.shifts = shifts);

    this.timesheetId = this.route.snapshot.params['id'];
    if (this.timesheetId) {
      this.isEditMode = true;
      this.timesheetService.getTimesheet(this.timesheetId).subscribe(timesheet => {
        this.form.patchValue({
          shiftIds: timesheet.shifts.map(shift => shift.id),
          submittedDate: timesheet.submittedDate,
          approved: timesheet.approved
        });
      });
    }
  }

  saveTimesheet() {
    if (this.form.invalid) {
      return;
    }

    const timesheetData: Timesheet = {
      ...this.form.value,
      shifts: this.shifts.filter(shift => this.form.value.shiftIds.includes(shift.id))
    };

    // Recalculate total hours and pay
    timesheetData.totalHours = timesheetData.shifts.reduce((acc, shift) => {
      const startTime = new Date(shift.startTime);
      const endTime = new Date(shift.endTime);
      return acc + (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }, 0);
    timesheetData.totalPay = timesheetData.shifts.reduce((acc, shift) => {
      const startTime = new Date(shift.startTime);
      const endTime = new Date(shift.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return acc + (hours * shift.job.payRate);
    }, 0);


    if (this.isEditMode) {
      timesheetData.id = this.timesheetId;
      this.timesheetService.updateTimesheet(timesheetData).subscribe(() => {
        this.router.navigate(['/timesheets']);
      });
    } else {
      this.timesheetService.addTimesheet(timesheetData).subscribe(() => {
        this.router.navigate(['/timesheets']);
      });
    }
  }
}
