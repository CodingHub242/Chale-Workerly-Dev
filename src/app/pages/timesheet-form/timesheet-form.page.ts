import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,FormControl, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetService } from '../../services/timesheet.service';
import { ShiftService } from '../../services/shift.service';
import { Timesheet, TimesheetEntry } from '../../models/timesheet.model';
import { Shift } from '../../models/shift.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.page.html',
  styleUrls: ['./timesheet-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule]
})
export class TimesheetFormPage implements OnInit {
timesheetForm!: FormGroup;
  form!: FormGroup;
  isEditMode = false;
  timesheetId: number = 0;
  shifts: Shift[] = [];
  period: { startDate: string; endDate: string };
  currentDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private shiftService: ShiftService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.period = this.timesheetService.getCurrentPeriod();
  }

  ngOnInit() {
    this.form = this.fb.group({
      period: this.fb.group({
        startDate: [this.period.startDate, Validators.required],
        endDate: [this.period.endDate, Validators.required]
      }),
      entries: this.fb.array([]),
      notes: ['']
    });

     this.timesheetForm = new FormGroup({
      date: new FormControl('', Validators.required),
      hoursWorked: new FormControl('', Validators.required),
      typeOfWork: new FormControl('', Validators.required),
    });

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.shiftService.getShifts().subscribe(shifts => {
      this.shifts = shifts.filter(shift => 
        shift.temps?.some(temp => temp.id === currentUser.id)
      );
    });

    this.timesheetId = this.route.snapshot.params['id'];
    if (this.timesheetId) {
      this.isEditMode = true;
      this.timesheetService.getTimesheet(this.timesheetId).subscribe(timesheet => {
        this.form.patchValue({
          period: {
            startDate: timesheet.period.startDate,
            endDate: timesheet.period.endDate
          },
          notes: timesheet.entries[0]?.notes || ''
        });

        const entriesArray = this.form.get('entries') as FormArray;
        timesheet.entries.forEach(entry => {
          entriesArray.push(this.createEntryFormGroup(entry));
        });
      });
    }
  }

  get entries() {
    return this.form.get('entries') as FormArray;
  }

  createEntryFormGroup(entry?: TimesheetEntry) {
    return this.fb.group({
      date: [entry?.date || this.currentDate, Validators.required],
      startTime: [entry?.startTime || '', Validators.required],
      endTime: [entry?.endTime || '', Validators.required],
      breakDuration: [entry?.breakDuration || 0, [Validators.required, Validators.min(0)]],
      notes: [entry?.notes || '']
    });
  }

  addEntry() {
    this.entries.push(this.createEntryFormGroup());
  }

  removeEntry(index: number) {
    this.entries.removeAt(index);
  }

  calculateHours(entry: FormGroup): number {
    const startTime = new Date(`${entry.get('date')?.value}T${entry.get('startTime')?.value}`);
    const endTime = new Date(`${entry.get('date')?.value}T${entry.get('endTime')?.value}`);
    const breakDuration = entry.get('breakDuration')?.value || 0;
    
    if (startTime && endTime) {
      const diffInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return Math.max(0, diffInHours - (breakDuration / 60));
    }
    return 0;
  }

  saveTimesheet() {
    if (this.form.invalid) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const entries = this.entries.controls.map(control => control.value);
    const totalHours = entries.reduce((acc, entry) => {
      const hours = this.calculateHours(entry as any);
      return acc + hours;
    }, 0);

    const shifts = this.shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
      return entries.some(entry => entry.date === shiftDate);
    });

    const timesheetData: Timesheet = {
      id: this.isEditMode ? this.timesheetId : 0,
      tempId: currentUser.id,
      shifts,
      entries,
      totalHours,
      totalPay: totalHours * (shifts[0]?.job.payRate || 0), // Using first shift's pay rate
      submittedDate: new Date(),
      status: 'draft',
      period: this.form.get('period')?.value
    };

    if (this.isEditMode) {
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
