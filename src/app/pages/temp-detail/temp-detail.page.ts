import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
 
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
 
   constructor(
     private route: ActivatedRoute,
     private tempService: TempService,
     private shiftService: ShiftService,
     private router: Router
   ) { }
 
   ngOnInit() {
     const tempId = this.route.snapshot.params['id'];
     this.tempService.getTemp(tempId).subscribe(temp => {
       this.temp = temp;
     });
     this.shiftService.getShiftsByTemp(tempId).subscribe(shifts => {
       const now = new Date();
       this.activeShifts = shifts.filter(shift => new Date(shift.endTime) > now);
       this.completedShifts = shifts.filter(shift => new Date(shift.endTime) <= now);
     });
   }
 
   editTemp() {
     this.router.navigate(['/temp-form', this.temp.id]);
   }
 
   goToShift(shiftId: number) {
     this.router.navigate(['/shift-detail', shiftId]);
   }
 
 }
