import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ShiftService } from '../../services/shift.service';
import { TimesheetService } from '../../services/timesheet.service';
import { Shift } from '../../models/shift.model';
import { Timesheet } from '../../models/timesheet.model';
import { Chart, registerables } from 'chart.js';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterByStatusPipe } from '../../pipes/filter-by-status.pipe';
Chart.register(...registerables);

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-temp-dashboard',
  templateUrl: './temp-dashboard.page.html',
  styleUrls: ['./temp-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FilterByStatusPipe, FormsModule]
})
export class TempDashboardPage implements OnInit {

  @ViewChild('barChart') barChart!: ElementRef;

  currentUser: any;
  selectedTab = 'working';
  myShifts: Shift[] = [];
  myTimesheets: Timesheet[] = [];
  chart: any;
  
  // Stat counts
  completedShiftsCount = 0;
  pendingShiftsCount = 0;
  approvedTimesheetsCount = 0;
  rejectedTimesheetsCount = 0;

  constructor(
    private shiftService: ShiftService,
    private authService: AuthService,
    private router: Router,
    private timesheetService: TimesheetService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Only allow temp users to access this dashboard
    if (!this.authService.isTemp()) {
       this.router.navigate(['/dashboard']);
      //this.authService.logout();
      return;
    }

    this.loadMyShifts();
    this.loadMyTimesheets();
  }
// Helper function to check if a date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return new Date(date).toDateString() === today.toDateString();
  }

  // Helper function to check if a date is in the future
  isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck > today;
  }

  // Helper function to check if a date is in the past
  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  }

  loadMyShifts() {
    this.shiftService.getShifts().subscribe(shifts => {
      // Filter shifts to only show those assigned to the current temp
      this.myShifts = shifts.filter(shift =>
        shift.temps.some(temp => temp.id === this.currentUser.id)
      );
      
      this.calculateShiftStats();
      this.createBarChart();
    });
  }

  loadMyTimesheets() {
    // Load timesheets for the current temp
    const filters = { tempId: this.currentUser.id };
    this.timesheetService.getTempsheet(filters).subscribe(timesheets => {
      this.myTimesheets = timesheets;
      this.calculateTimesheetStats();
    });
  }

  calculateShiftStats() {
    this.completedShiftsCount = this.myShifts.filter(shift => shift.status === 'completed').length;
    this.pendingShiftsCount = this.myShifts.filter(shift => shift.status === 'pending').length;
  }

  calculateTimesheetStats() {
    this.approvedTimesheetsCount = this.myTimesheets.filter(timesheet => timesheet.status === 'approved').length;
    this.rejectedTimesheetsCount = this.myTimesheets.filter(timesheet => timesheet.status === 'rejected').length;
  }

  createBarChart() {
    const shiftsByDay = this.myShifts.reduce((acc, shift) => {
      const day = new Date(shift.startTime).toLocaleDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const ctx = this.barChart.nativeElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(shiftsByDay),
        datasets: [{
          label: 'My Shifts',
          data: Object.values(shiftsByDay),
          backgroundColor: 'rgba(74, 144, 226, 0.2)',
          borderColor: 'rgba(74, 144, 226, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Get working shifts (today and started status)
  getWorkingShifts(): Shift[] {
    return this.myShifts.filter(shift =>
      this.isToday(shift.startTime) && (shift.status === 'started' || shift.status === 'checked-in')
    );
  }

  // Get pending shifts (future or pending status)
  getPendingShifts(): Shift[] {
    return this.myShifts.filter(shift =>
      (this.isFuture(shift.startTime) || shift.status === 'pending')
    );
  }

  // Get past shifts (before today)
  getPastShifts(): Shift[] {
    return this.myShifts.filter(shift =>
      this.isPast(shift.startTime)
    );
  }

  // Get shifts by status (kept for backward compatibility)
  getShiftsByStatus(status: string): Shift[] {
    return this.myShifts.filter(shift => shift.status === status);
  }

  getApprovalStatusColor(status?: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'declined': return 'danger';
      case 'pending': return 'warning';
      default: return 'medium';
    }
  }
   getApprovalStatusText(status?: string): string {
    switch (status) {
      case 'approved': return 'Approved';
      case 'declined': return 'Declined';
      case 'pending': return 'Pending';
      default: return 'Pending Review';
    }
  }
  logout() {
    this.authService.logout();
  }
}