import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
import { Router, RouterModule } from '@angular/router';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarEvent, CalendarView } from 'angular-calendar';
import { startOfDay } from 'date-fns';

@Component({
  schemas:[ CUSTOM_ELEMENTS_SCHEMA ],
  selector: 'app-shifts',
  templateUrl: './shifts.page.html',
  styleUrls: ['./shifts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, CalendarModule]
})
export class ShiftsPage implements OnInit {

  shifts: Shift[] = [];
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  constructor(
    private shiftService: ShiftService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    this.loadShifts();
    console.log(this.viewDate);
  }

  loadShifts() {
    this.shiftService.getShifts().subscribe(shifts => {
      this.shifts = shifts;
      this.events = shifts.map(shift => {
        const temps = shift.temps.map(t => t.firstName).join(', ');
        return {
          start: startOfDay(new Date(shift.startTime)),
          title: `${shift.job.title} - ${temps || 'Unassigned'}`,
        };
      });
    });
  }

  addShift(date?: Date) {
    if (date) {
      this.router.navigate(['/shift-form'], { queryParams: { date: date.toISOString() } });
    } else {
      this.router.navigate(['/shift-form']);
    }
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

  prev() {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
  }

  next() {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
  }

  isPastDate(date: Date): boolean {
    return date <= new Date();
  }
}
