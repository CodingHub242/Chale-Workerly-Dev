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
Chart.register(...registerables);

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit {

  @ViewChild('barChart') barChart!: ElementRef;

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
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  processShifts() {
    this.tempsWithShifts = this.temps.map(temp => ({
      ...temp,
      shifts: this.shifts.filter(shift =>
        shift.temps.some(t => t.id === temp.id)
      )
    }));

    this.clientsWithShifts = this.clients.map(client => ({
      ...client,
      shifts: this.shifts.filter(shift => shift.client.id === client.id)
    }));
  }
}
