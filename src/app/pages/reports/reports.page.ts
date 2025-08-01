import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet } from '../../models/timesheet.model';
import { Temp } from '../../models/temp.model';
import { TempService } from '../../services/temp.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

interface ChartData {
  name: string;
  hours: number;
  pay: number;
  percentage: number;
  timesheetCount: number;
}

interface StatusSummary {
  status: string;
  count: number;
  percentage: number;
  hours: number;
  pay: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ReportsPage implements OnInit {
  timesheets: Timesheet[] = [];
  temps: Temp[] = [];
  filteredTimesheets: Timesheet[] = [];
  startDate: string = '';
  endDate: string = '';
  selectedTempId: number | null = null;
  totalHours = 0;
  totalPay = 0;
  currentUser: any;
  
  // Chart data for CSS-based charts
  chartData: ChartData[] = [];
  maxHours = 0;
  
  // Enhanced status tracking
  statusSummary: StatusSummary[] = [];
  averageHoursPerTimesheet = 0;
  averagePayPerTimesheet = 0;

  constructor(
    private timesheetService: TimesheetService,
    private tempService: TempService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Set default date range to current month
    this.currentUser = this.authService.getCurrentUser();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
    
    this.loadTemps();
    this.loadTimesheets();
  }
  
  
  loadTemps() {
    this.tempService.getTemps().subscribe({
      next: (temps) => {
        this.temps = temps || [];
       // console.log('Loaded temps:', this.temps.length);
      },
      error: (error) => {
        console.error('Error loading temps:', error);
        this.temps = [];
      }
    });
  }
  
  loadTimesheets() {
    this.timesheetService.getTimesheets().subscribe({
      next: (timesheets) => {
        this.timesheets = timesheets || [];
       // console.log('Loaded timesheets:', this.timesheets.length);
        this.filterTimesheets();
      },
      error: (error) => {
        console.error('Error loading timesheets:', error);
        this.timesheets = [];
        this.filterTimesheets();
      }
    });
  }
  
  filterTimesheets() {
    try {
      //console.log('Filtering timesheets, total:', this.timesheets.length);
      let filtered = [...(this.timesheets || [])];
      
      // Filter by date range - simplified logic
      if (this.startDate && this.endDate) {
        const startDateObj = new Date(this.startDate);
        const endDateObj = new Date(this.endDate);
        
        filtered = filtered.filter(t => {
          // Use period_start_date and period_end_date if available
          const startDate = t.period_start_date || (t.period?.startDate);
          const endDate = t.period_end_date || (t.period?.endDate);
          
          if (!startDate || !endDate) return true; // Include if no date info
          
          const tStart = new Date(startDate);
          const tEnd = new Date(endDate);
          
          // Check if timesheet period overlaps with filter range
          return tStart <= endDateObj && tEnd >= startDateObj;
        });
      }
      
      // Filter by temp
      if (this.selectedTempId) {
        filtered = filtered.filter(t => t.tempId === this.selectedTempId);
      }
      
      //console.log('Filtered timesheets:', filtered.length);
      this.filteredTimesheets = filtered;
      this.calculateTotals();
      
      // Generate chart data for CSS-based visualization
      this.generateChartData();
    } catch (error) {
      console.error('Error filtering timesheets:', error);
      this.filteredTimesheets = [];
      this.calculateTotals();
    }
  }
  
  calculateTotals() {
    try {
      // Calculate totals with better error handling
      this.totalHours = this.filteredTimesheets.reduce((sum, timesheet) => {
        const hours = Number(timesheet.totalHours) || 0;
        return sum + (isFinite(hours) ? hours : 0);
      }, 0);
      
      this.totalPay = this.filteredTimesheets.reduce((sum, timesheet) => {
        const pay = Number(timesheet.totalPay) || 0;
        return sum + (isFinite(pay) ? pay : 0);
      }, 0);
      
      // Calculate averages
      const timesheetCount = this.filteredTimesheets.length;
      this.averageHoursPerTimesheet = timesheetCount > 0 ? this.totalHours / timesheetCount : 0;
      this.averagePayPerTimesheet = timesheetCount > 0 ? this.totalPay / timesheetCount : 0;
      
      // Generate status summary
      this.generateStatusSummary();
      
    } catch (error) {
      console.error('Error calculating totals:', error);
      this.totalHours = 0;
      this.totalPay = 0;
      this.averageHoursPerTimesheet = 0;
      this.averagePayPerTimesheet = 0;
      this.statusSummary = [];
    }
  }
  
  generateChartData() {
    try {
      // Prepare chart data for CSS-based visualization with enhanced aggregation
      const tempMap = new Map<number, { hours: number, pay: number, name: string, timesheetCount: number }>();
      
      this.filteredTimesheets.forEach(timesheet => {
        if (!timesheet.tempId) return;
        
        const tempId = timesheet.tempId;
        const temp = this.temps.find(t => t.id === tempId);
        const tempName = temp ? `${temp.firstName} ${temp.lastName}` : `Temp ${tempId}`;
        
        if (!tempMap.has(tempId)) {
          tempMap.set(tempId, { hours: 0, pay: 0, name: tempName, timesheetCount: 0 });
        }
        
        const data = tempMap.get(tempId)!;
        const hours = Number(timesheet.totalHours) || 0;
        const pay = Number(timesheet.totalPay) || 0;
        
        if (isFinite(hours)) data.hours += hours;
        if (isFinite(pay)) data.pay += pay;
        data.timesheetCount++;
      });
      
      // Convert to array and calculate percentages
      const chartDataArray = Array.from(tempMap.values());
      this.maxHours = Math.max(...chartDataArray.map(d => d.hours), 1); // Avoid division by zero
      
      this.chartData = chartDataArray.map(data => ({
        name: data.name,
        hours: data.hours,
        pay: data.pay,
        percentage: (data.hours / this.maxHours) * 100,
        timesheetCount: data.timesheetCount
      }));
      
      // Sort by hours descending for better visualization
      this.chartData.sort((a, b) => b.hours - a.hours);
      
    } catch (error) {
      console.error('Error generating chart data:', error);
      this.chartData = [];
      this.maxHours = 0;
    }
  }
  
  generateStatusSummary() {
    try {
      const statusMap = new Map<string, { count: number, hours: number, pay: number }>();
      
      this.filteredTimesheets.forEach(timesheet => {
        const status = timesheet.status || 'unknown';
        const hours = Number(timesheet.totalHours) || 0;
        const pay = Number(timesheet.totalPay) || 0;
        
        if (!statusMap.has(status)) {
          statusMap.set(status, { count: 0, hours: 0, pay: 0 });
        }
        
        const data = statusMap.get(status)!;
        data.count++;
        if (isFinite(hours)) data.hours += hours;
        if (isFinite(pay)) data.pay += pay;
      });
      
      const totalTimesheets = this.filteredTimesheets.length;
      
      this.statusSummary = Array.from(statusMap.entries()).map(([status, data]) => ({
        status: this.getStatusDisplayName(status),
        count: data.count,
        percentage: totalTimesheets > 0 ? (data.count / totalTimesheets) * 100 : 0,
        hours: data.hours,
        pay: data.pay
      }));
      
      // Sort by count descending
      this.statusSummary.sort((a, b) => b.count - a.count);
      
    } catch (error) {
      console.error('Error generating status summary:', error);
      this.statusSummary = [];
    }
  }
  
  getStatusDisplayName(status: string): string {
    const statusNames: { [key: string]: string } = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'pending': 'Pending Review',
      'unknown': 'Unknown Status'
    };
    return statusNames[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }
  
  exportToCSV() {
    // Create CSV content
    let csvContent = 'Temp Name,Period Start,Period End,Hours,Pay,Status\n';
    
    this.filteredTimesheets.forEach(timesheet => {
      const temp = this.temps.find(t => t.id === timesheet.tempId);
      const tempName = temp ? `${temp.firstName} ${temp.lastName}` : `Temp ${timesheet.tempId}`;
      
      // Handle both period object and direct properties
      const periodStart = timesheet.period_start_date ||
                         (timesheet.period ? timesheet.period.startDate : 'N/A');
      const periodEnd = timesheet.period_end_date ||
                       (timesheet.period ? timesheet.period.endDate : 'N/A');
      
      csvContent += `${tempName},${periodStart},${periodEnd},${timesheet.totalHours},${timesheet.totalPay},${timesheet.status}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'timesheet_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  getTempName(tempId: number): string {
    const temp = this.temps.find(t => t.id === tempId);
    return temp ? `${temp.firstName} ${temp.lastName}` : `Temp ${tempId}`;
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'submitted':
        return 'primary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'medium';
    }
  }
  
  getStatusDistribution(): { name: string, count: number, percentage: number }[] {
    return this.statusSummary.map(status => ({
      name: status.status,
      count: status.count,
      percentage: status.percentage
    }));
  }
  
  getSelectedTempName(): string {
    if (!this.selectedTempId) return 'All Temps';
    const temp = this.temps.find(t => t.id === this.selectedTempId);
    return temp ? `${temp.firstName} ${temp.lastName}` : `Temp ${this.selectedTempId}`;
  }
  
  getTimesheetCountText(): string {
    const count = this.filteredTimesheets.length;
    if (count === 0) return 'No timesheets';
    if (count === 1) return '1 timesheet';
    return `${count} timesheets`;
  }
}