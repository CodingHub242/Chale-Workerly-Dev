import { Component, OnInit } from '@angular/core';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
import { Router, RouterModule } from '@angular/router';
import { ActionSheetController, IonicModule } from '@ionic/angular';
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
    private router: Router,
    private actionSheetCtrl: ActionSheetController
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

  async updateStatus(shift: Shift) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Update Status',
      buttons: [
        {
          text: 'Pending',
          handler: () => this.saveStatus(shift, 'pending')
        },
        {
          text: 'Checked In',
          handler: () => this.saveStatus(shift, 'checked-in')
        },
        {
          text: 'Started',
          handler: () => this.saveStatus(shift, 'started')
        },
        {
          text: 'Completed',
          handler: () => this.saveStatus(shift, 'completed')
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  saveStatus(shift: Shift, status: 'pending' | 'checked-in' | 'started' | 'completed') {
    const updatedShift = { ...shift, status };
    this.shiftService.updateShiftStat(shift.id, { status: status }).subscribe(() => {
      shift.status = status;
    });
  }

}
