import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
import { Router, RouterModule } from '@angular/router';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarEvent, CalendarView } from 'angular-calendar';
import { startOfDay } from 'date-fns';
import { AuthService } from '../../services/auth.service';

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
  refresh: any;
  currentUser: any;

  constructor(
    private shiftService: ShiftService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadShifts();
    console.log(this.viewDate);
  }

  loadShifts() {
    this.shiftService.getShifts().subscribe(shifts => {
      // Filter shifts for temp users to only show their assigned shifts
      if (this.authService.isTemp()) {
        this.shifts = shifts.filter(shift =>
          shift.temps.some(temp => temp.id === this.currentUser.id)
        );
      } else {
        this.shifts = shifts;
      }
      
      this.events = this.shifts.map(shift => {
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

  async updateTStatus(shift: Shift) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Update Status',
      buttons: [
        {
          text: 'Pending',
          handler: () => this.saveTStatus(shift, 'pending')
        },
        {
          text: 'Accepted',
          handler: () => this.saveTStatus(shift, 'accepted')
        },
        {
          text: 'Declined',
          handler: () => this.saveTStatus(shift, 'declined')
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
    
    // Prepare the data to send to the API
    const updateData: any = { status: status };
    
    // If status is being updated to 'checked-in', include the current datetime
    if (status === 'checked-in') {
      updateData.checkedInAt = new Date().toISOString();
    }
    
    this.shiftService.updateShiftStat(shift.id, updateData).subscribe(() => {
      shift.status = status;
      // Update the local shift object with the check-in time if applicable
      if (status === 'checked-in') {
        shift.checkedInAt = new Date();
      }
    });
  }

   saveTStatus(shift: Shift, status: 'pending' | 'accepted' | 'declined') {
    const updatedShift = { ...shift, status };
    
    // Prepare the data to send to the API
    const updateData: any = { status: status };
    
    // If status is being updated to 'checked-in', include the current datetime
    // if (status === 'accepted') {
    //   updateData.checkedInAt = new Date().toISOString();
    // }
    
    this.shiftService.updateShiftTStat(shift.id, updateData).subscribe(() => {
      shift.tempStatus = status;
      // Update the local shift object with the check-in time if applicable
      // if (status === 'checked-in') {
      //   shift.checkedInAt = new Date();
      // }
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'checked-in':
        return 'checkmark-circle-outline';
      case 'started':
        return 'play-circle-outline';
      case 'completed':
        return 'flag-outline';
      default:
        return 'help-circle-outline';
    }
  }
}
