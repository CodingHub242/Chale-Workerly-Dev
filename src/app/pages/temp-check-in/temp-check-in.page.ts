import { Component, OnInit } from '@angular/core';
import { ShiftService } from '../../services/shift.service';
import { TempService } from '../../services/temp.service';
import { Shift } from '../../models/shift.model';
import { Temp } from '../../models/temp.model';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-temp-check-in',
  templateUrl: './temp-check-in.page.html',
  styleUrls: ['./temp-check-in.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class TempCheckInPage implements OnInit {
  currentUser: any;
  shifts: Shift[] = [];
  temps: Temp[] = [];
  searchTerm: string = '';
  filteredShifts: (Shift & { temp: Temp })[] = [];

  constructor(
    private shiftService: ShiftService,
    private tempService: TempService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Only allow admin users to access this page
    if (this.currentUser.role !== 'admin') {
      this.router.navigate(['/temp-dashboard']);
      return;
    }

    this.loadShifts();
    this.loadTemps();
  }

  loadShifts() {
    this.shiftService.getShifts().subscribe(shifts => {
      this.shifts = shifts;
      this.filterShiftsForToday();
    });
  }

  loadTemps() {
    this.tempService.getTemps().subscribe(temps => {
      this.temps = temps;
    });
  }

  filterShiftsForToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter shifts that are scheduled for today
    const todayShifts = this.shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate.getTime() === today.getTime();
    });

    // Combine shifts with their assigned temps
    this.filteredShifts = todayShifts.flatMap(shift => {
      // Create a separate entry for each temp assigned to the shift
      return shift.temps.map(temp => {
        return { ...shift, temp };
      });
    });

    // Sort by temp name
    this.filteredShifts.sort((a, b) => {
      const nameA = `${a.temp.firstName} ${a.temp.lastName}`.toLowerCase();
      const nameB = `${b.temp.firstName} ${b.temp.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  // Helper function to check if a date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return new Date(date).toDateString() === today.toDateString();
  }

  onSearchTermChange() {
    if (!this.searchTerm) {
      this.filterShiftsForToday();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredShifts = this.filteredShifts.filter(shift => {
      const fullName = `${shift.temp.firstName} ${shift.temp.lastName}`.toLowerCase();
      const jobTitle = shift.job.title.toLowerCase();
      return fullName.includes(term) || jobTitle.includes(term);
    });
  }

  checkIn(shift: Shift & { temp: Temp }) {
    const updateData: any = { 
      status: 'checked-in',
      checkedInAt: new Date().toISOString()
    };
    
    this.shiftService.updateShiftStat(shift.id, updateData).subscribe(() => {
      shift.status = 'checked-in';
      shift.checkedInAt = new Date();
    });
  }

  checkOut(shift: Shift & { temp: Temp }) {
    const updateData: any = {
      status: 'completed',
      checkedOutAt: new Date().toISOString()
    };
    
    this.shiftService.updateShiftStat(shift.id, updateData).subscribe(() => {
      shift.status = 'completed';
      shift.checkedOutAt = new Date();
    });
  }

  logout() {
    this.authService.logout();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'checked-in':
        return 'primary';
      case 'started':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'medium';
    }
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
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'checked-in':
        return 'Checked In';
      case 'started':
        return 'Started';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  }
}