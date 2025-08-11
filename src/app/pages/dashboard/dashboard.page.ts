import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { JobService } from '../../services/job.service';
import { ClientService } from '../../services/client.service';
import { TempService } from '../../services/temp.service';
import { ShiftService } from '../../services/shift.service';
import { TimesheetService } from '../../services/timesheet.service';
import { Job } from '../../models/job.model';
import { Client } from '../../models/client.model';
import { Temp } from '../../models/temp.model';
import { Shift } from '../../models/shift.model';
import { Timesheet } from '../../models/timesheet.model';
import { Chart, registerables } from 'chart.js';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterByStatusPipe } from '../../pipes/filter-by-status.pipe';
import { FilterByTimePipe } from '../../pipes/filter-by-start.pipe';
Chart.register(...registerables);

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FilterByStatusPipe,FilterByTimePipe, FormsModule]
})
export class DashboardPage implements OnInit {

  @ViewChild('barChart') barChart!: ElementRef;

  currentUser:any;

  selectedTab = 'working';
  jobs: Job[] = [];
  clients: Client[] = [];
  temps: Temp[] = [];
  shifts: Shift[] = [];
  timesheets: Timesheet[] = [];
  date = new Date().toISOString().split('T')[0];
  chart: any;
  tempsWithShifts: (Temp & { shifts: Shift[] })[] = [];
  tempsShifts: (Temp & { shifts: Shift[] })[] = [];
  clientsWithShifts: (Client & { shifts: Shift[] })[] = [];
  
  // Filtered temps for each tab
  workingTemps: (Temp & { shifts: Shift[] })[] = [];
  pendingTemps: (Temp & { shifts: Shift[] })[] = [];
  pastTemps: (Temp & { shifts: Shift[] })[] = [];

  constructor(
    private jobService: JobService,
    private clientService: ClientService,
    private tempService: TempService,
    private shiftService: ShiftService,
    private authService: AuthService,
    private router:Router,
    private timesheetService: TimesheetService
  ) { }

  ngOnInit() {
    this.jobService.getJobs().subscribe(jobs => this.jobs = jobs);
    this.clientService.getClients().subscribe(clients => this.clients = clients);
    this.tempService.getTemps().subscribe(temps => this.temps = temps);
    this.shiftService.getShifts().subscribe(shifts => {
      this.shifts = shifts;
      this.processShifts();
      this.createBarChart();
    });
    this.timesheetService.getTimesheets().subscribe(timesheets => this.timesheets = timesheets);

    this.currentUser = this.authService.getCurrentUser();

     if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirect temp users to their specific dashboard
    if (this.authService.isTemp()) {
      this.router.navigate(['/temp-dashboard']);
      return;
    }
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

  createBarChart() {
    const shiftsByDay = this.shifts.reduce((acc, shift) => {
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
          label: 'Shifts',
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

processShifts() {
  // Get temps with their shifts
  this.tempsWithShifts = this.temps
    .map(temp => ({
      ...temp,
      shifts: this.shifts.filter(shift =>
        shift.temps.some(t => t.id === temp.id)
      )
    }))
    .filter(temp => temp.shifts.length > 0);
    
  // Filter temps for each tab
  this.workingTemps = this.tempsWithShifts
    .map(temp => ({
      ...temp,
      shifts: this.getWorkingShifts(temp.shifts)
    }))
    .filter(temp => temp.shifts.length > 0);
    
  this.pendingTemps = this.tempsWithShifts
    .map(temp => ({
      ...temp,
      shifts: this.getPendingShifts(temp.shifts)
    }))
    .filter(temp => temp.shifts.length > 0);
    
  this.pastTemps = this.tempsWithShifts
    .map(temp => ({
      ...temp,
      shifts: this.getPastShifts(temp.shifts)
    }))
    .filter(temp => temp.shifts.length > 0);

  this.clientsWithShifts = this.clients.map(client => ({
    ...client,
    shifts: this.shifts.filter(shift => shift.client.id === client.id)
  }));

   
}

// Get working shifts (today and started status)
getWorkingShifts(shifts: Shift[]): Shift[] {
  return shifts.filter(shift =>
    this.isToday(shift.startTime) && (shift.status === 'started' || shift.status === 'checked-in')
  );
}

// Get pending shifts (future or pending status)
getPendingShifts(shifts: Shift[]): Shift[] {
  return shifts.filter(shift =>
    //(this.isFuture(shift.startTime) || shift.status === 'pending')
     (this.isFuture(shift.startTime))
  );
}

// Get past shifts (before today)
getPastShifts(shifts: Shift[]): Shift[] {
  return shifts.filter(shift =>
    this.isPast(shift.startTime)
  );
}

  logout() {
    this.authService.logout();
  }
}
