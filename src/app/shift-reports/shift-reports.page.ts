import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClientService } from '../services/client.service';
import { JobService } from '../services/job.service';
import { ShiftService } from '../services/shift.service';
import { Client } from '../models/client.model';
import { Job } from '../models/job.model';
import { Shift } from '../models/shift.model';

@Component({
  standalone: true,
  selector: 'app-shift-reports',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './shift-reports.page.html',
  styleUrls: ['./shift-reports.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ShiftReportsPage implements OnInit {

  clients: Client[] = [];
  jobs: Job[] = [];
  shifts: Shift[] = [];
  selectedClientId: number | null = null;
  selectedJobId: number | null = null;
  selectedDate: string = '';
  tempShifts: any[] = [];
  filteredTempShifts: any[] = [];
  searchTerm: string = '';

  constructor(
    private clientService: ClientService,
    private jobService: JobService,
    private shiftService: ShiftService
  ) { }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  onClientChange() {
    if (this.selectedClientId) {
      this.jobService.getJobsByClient(this.selectedClientId).subscribe(jobs => {
        this.jobs = jobs;
        this.selectedJobId = null;
        this.shifts = [];
      });
    } else {
      this.jobs = [];
      this.selectedJobId = null;
      this.shifts = [];
    }
  }

  onJobChange() {
    if (this.selectedJobId && this.selectedDate) {
      this.loadShifts();
    } else {
      this.shifts = [];
    }
  }

  onDateChange() {
    if (this.selectedJobId && this.selectedDate) {
      this.loadShifts();
    } else {
      this.shifts = [];
    }
  }

  loadShifts() {
    if (this.selectedJobId && this.selectedDate) {
      this.shiftService.getShiftsByJobAndDate(this.selectedJobId, this.selectedDate).subscribe(shifts => {
        this.shifts = shifts;
        this.flattenTempShifts();
      });
    }
  }

  flattenTempShifts() {
    this.tempShifts = [];
    this.shifts.forEach(shift => {
      shift.temps.forEach((temp: any) => {
        this.tempShifts.push({
          shift: shift,
          temp: temp,
          pivot: temp.pivot || {}
        });
      });
    });
    this.filterTempShifts();
  }

  filterTempShifts() {
    if (!this.searchTerm) {
      this.filteredTempShifts = [...this.tempShifts];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTempShifts = this.tempShifts.filter(tempShift =>
        `${tempShift.temp.firstName} ${tempShift.temp.lastName}`.toLowerCase().includes(term) ||
        tempShift.shift.job.title.toLowerCase().includes(term) ||
        tempShift.shift.client.name.toLowerCase().includes(term)
      );
    }
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
