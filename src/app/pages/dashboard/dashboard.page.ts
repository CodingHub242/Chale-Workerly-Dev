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
Chart.register(...registerables);

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FilterByStatusPipe, FormsModule]
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
  chart: any;
  tempsWithShifts: (Temp & { shifts: Shift[] })[] = [];
  clientsWithShifts: (Client & { shifts: Shift[] })[] = [];

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
  // Get only active shifts (not completed)
  const activeShifts = this.shifts.filter(shift => 
    ['pending', 'checked-in', 'started'].includes(shift.status)
  );

  // Get temps with their active shifts, limited to 10
  this.tempsWithShifts = this.temps
    .map(temp => ({
      ...temp,
      shifts: activeShifts.filter(shift =>
        shift.temps.some(t => t.id === temp.id)
      )
    }))
    .filter(temp => temp.shifts.length > 0)
    .slice(0, 10);    this.clientsWithShifts = this.clients.map(client => ({
      ...client,
      shifts: this.shifts.filter(shift => shift.client.id === client.id)
    }));
  }

  logout() {
    this.authService.logout();
  }
}
