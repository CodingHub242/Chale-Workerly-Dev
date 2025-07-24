import { Component, OnInit } from '@angular/core';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ShiftsPage implements OnInit {

  shifts: Shift[] = [];

  constructor(
    private shiftService: ShiftService,
    private router: Router
  ) { }

  ngOnInit() {
    this.shiftService.getShifts().subscribe(shifts => {
      this.shifts = shifts;
    });
  }

  addShift() {
    this.router.navigate(['/shift-form']);
  }

  viewShift(id: number) {
    this.router.navigate(['/shift-detail', id]);
  }

}
