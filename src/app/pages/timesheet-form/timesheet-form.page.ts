import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,FormControl, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetService } from '../../services/timesheet.service';
import { ShiftService } from '../../services/shift.service';
import { Timesheet, TimesheetEntry } from '../../models/timesheet.model';
import { Shift } from '../../models/shift.model';
import * as $ from 'jquery';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.page.html',
  styleUrls: ['./timesheet-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule, FormsModule]
})
export class TimesheetFormPage implements OnInit {
  timesheetForm: FormGroup;
  isEditMode = false;
  timesheetId: number | null = null;
  currentUser: any;
  temps: Temp[] = [];
  shifts: Shift[] = [];
  selectedTempId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private shiftService: ShiftService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private tempService: TempService
  ) {
    this.timesheetForm = this.fb.group({
      period: this.fb.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required]
      }),
      entries: this.fb.array([]),
      totalHours: [0],
      totalPay: [0]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    //console.log(this.currentUser.role);

    // Load temps for admin view
    if (this.authService.isAdmin()) {
      this.tempService.getTemps().subscribe(temps => {
        this.temps = temps;
        //console.log(this.temps);
      });
    } else {
      // For temp users, set their ID
      this.selectedTempId = this.currentUser.id;
    }

    // Check if we're editing an existing timesheet
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.timesheetId = +params['id'];
        this.loadTimesheet(this.timesheetId);
      } else {
        // Set default period to current month
        const period = this.timesheetService.getCurrentPeriod();
        this.timesheetForm.get('period')?.setValue({
          startDate: period.startDate,
          endDate: period.endDate
        });
      }
    });

    // Load shifts for the temp
    this.loadShifts();
  }

  onTempChange(event: any) {
    // Update the selected temp ID from the event
    this.selectedTempId = event.detail.value;
    
    // When temp selection changes, reload shifts for the selected temp
    this.loadShifts();
    
    // Clear existing entries when changing temp
    const entries = this.timesheetForm.get('entries') as FormArray;
    while (entries.length !== 0) {
      entries.removeAt(0);
    }
    
    // Reset totals
    this.timesheetForm.get('totalHours')?.setValue(0);
    this.timesheetForm.get('totalPay')?.setValue(0);
  }

  loadShifts() {
    const tempId = this.selectedTempId || (this.authService.isTemp() ? this.currentUser.id : null);
    if (tempId) {
      this.shiftService.getShifts().subscribe(shifts => {
        this.shifts = shifts.filter(shift =>
          shift.temps.some(temp => temp.id === tempId)
        );
      });
    }
  }

  loadTimesheet(id: number) {
    this.timesheetService.getTimesheet(id).subscribe(timesheet => {
    //   console.log('Timesheet details:', timesheet);
     this.selectedTempId = timesheet.tempId;
    // console.log(timesheet.period_start_date, timesheet.period_end_date);
      // const startDate = timesheet.period_start_date;
      // const endDate = timesheet.period_end_date;
     
      this.timesheetForm.get('period')?.setValue({
        startDate: timesheet.period_start_date,
        endDate: timesheet.period_end_date
      });

      //console.log(startDate, endDate);

      // Clear existing entries
      const entries = this.timesheetForm.get('entries') as FormArray;
      while (entries.length !== 0) {
        entries.removeAt(0);
      }

      // Add entries from timesheet
      timesheet.entries.forEach(entry => {
        entries.push(this.createEntryFormGroup(entry));
      });

      this.timesheetForm.get('totalHours')?.setValue(timesheet.totalHours);
      this.timesheetForm.get('totalPay')?.setValue(timesheet.totalPay);

      // Update the form with the timesheet details
    


    });
  }

  get entries(): FormArray {
    return this.timesheetForm.get('entries') as FormArray;
  }

  createEntryFormGroup(entry?: TimesheetEntry): FormGroup {
    return this.fb.group({
      date: [entry?.date || '', Validators.required],
      startTime: [entry?.startTime || '', Validators.required],
      endTime: [entry?.endTime || '', Validators.required],
      breakDuration: [entry?.breakDuration || 0],
      notes: [entry?.notes || '']
    });
  }

  addEntry() {
    this.entries.push(this.createEntryFormGroup());
  }

  removeEntry(index: number) {
    this.entries.removeAt(index);
  }

  calculateHours() {
    let totalHours = 0;
    this.entries.controls.forEach(entry => {
      const startTime = entry.get('startTime')?.value;
      const endTime = entry.get('endTime')?.value;
      const breakDuration = entry.get('breakDuration')?.value || 0;

      if (startTime && endTime) {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        // Handle overnight shifts
        if (end < start) {
          diff += 24;
        }
        
        diff -= breakDuration / 60; // Subtract break in hours
        totalHours += diff;
      }
    });

    this.timesheetForm.get('totalHours')?.setValue(totalHours);
    return totalHours;
  }

  onSubmit() {
    if (this.timesheetForm.invalid) {
      return;
    }

    const formData = this.timesheetForm.value;
    const totalHours = this.calculateHours();
    
    // Get the selected temp's data for pay calculation
    const selectedTemp = this.temps.find(t => t.id === this.selectedTempId) || this.currentUser;
    const basePay = selectedTemp.basePay || 0;
    
    const timesheetData: any = {
      tempId: this.selectedTempId || this.currentUser.id,
      shifts: this.shifts,
      entries: formData.entries,
      totalHours: totalHours,
      submittedDate: new Date().toISOString(),
      totalPay: totalHours * basePay,
      status: 'submitted',
      period: formData.period
    };

    if (this.isEditMode && this.timesheetId) {
      timesheetData.id = this.timesheetId;
      this.timesheetService.updateTimesheet(timesheetData).subscribe(() => {
        this.router.navigate(['/timesheets']).then(() => {
          window.location.reload();
        });
      });
    } else {
      this.timesheetService.addTimesheet(timesheetData).subscribe(() => {
        this.router.navigate(['/timesheets']).then(() => {
          window.location.reload();
        });
      });
    }
  }

  submitForApproval() {
    // First save the timesheet
    this.onSubmit();
    
    // Then submit for approval (this would need to be adjusted to get the timesheet ID)
    // For now, we'll assume it's handled in the backend after saving
  }
}
