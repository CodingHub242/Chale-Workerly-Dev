import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
 
 @Component({
   selector: 'app-temp-detail',
   templateUrl: './temp-detail.page.html',
   styleUrls: ['./temp-detail.page.scss'],
   standalone: true,
   imports: [IonicModule, CommonModule, RouterModule]
 })
 export class TempDetailPage implements OnInit {
 
   temp!: Temp;
   activeShifts: Shift[] = [];
   completedShifts: Shift[] = [];
   timesheets: Timesheet[] = [];
   totalHoursWorked: number = 0;
   totalEarnings: number = 0;
 
   constructor(
     private route: ActivatedRoute,
     private tempService: TempService,
     private shiftService: ShiftService,
     private timesheetService: TimesheetService,
     private router: Router
   ) { }
 
   ngOnInit() {
     const tempId = this.route.snapshot.params['id'];
     console.log(tempId);
     this.tempService.getTemp(tempId).subscribe(temp => {
       this.temp = temp;
     });
     this.shiftService.getShiftsByTemp(tempId).subscribe(shifts => {
       const now = new Date();
       this.activeShifts = shifts.filter(shift => new Date(shift.endTime) > now);
       this.completedShifts = shifts.filter(shift => new Date(shift.endTime) <= now);
     });
     this.timesheetService.getTimesheets({ tempId: tempId }).subscribe(timesheets => {
       this.timesheets = timesheets;
       alert(`Loading timesheets for temp ID ${tempId}: `+ timesheets);
       this.calculateProductivity();
     });
   }
 
   editTemp() {
     this.router.navigate(['/temp-form', this.temp.id]);
   }
 
   goToShift(shiftId: number) {
     this.router.navigate(['/shift-detail', shiftId]);
   }
 
   calculateProductivity() {
     this.totalHoursWorked = this.timesheets.reduce((sum, timesheet) => sum + Number(timesheet.totalHours || 0), 0);
     this.totalEarnings = this.timesheets.reduce((sum, timesheet) => sum + Number(timesheet.totalPay || 0), 0);
     console.log(`Productivity calculation for temp ${this.temp?.firstName} ${this.temp?.lastName}:`);
     console.log(`- Total timesheets: ${this.timesheets.length}`);
     console.log(`- Total hours worked: ${this.totalHoursWorked}`);
     console.log(`- Total earnings: ${this.totalEarnings}`);
   }
 }
