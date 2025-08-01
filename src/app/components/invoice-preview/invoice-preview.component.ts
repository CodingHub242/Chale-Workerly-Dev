import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface InvoicePreviewData {
  client: {
    id: number;
    name: string;
    email: string;
    address: string;
  };
  timesheets: Array<{
    id: number;
    temp_id: number;
    temp_name: string;
    period: string;
    hours: number;
    rate: number;
    amount: number;
    description: string;
  }>;
  summary: {
    total_hours: number;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    timesheet_count: number;
  };
  temp_summary?: Array<{
    temp_id: number;
    temp_name: string;
    total_hours: number;
    total_amount: number;
    timesheet_count: number;
    average_rate: number;
  }>;
  period_range?: {
    start_formatted: string;
    end_formatted: string;
    duration_days: number;
  };
}

@Component({
  selector: 'app-invoice-preview',
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InvoicePreviewComponent {
  @Input() invoiceData!: InvoicePreviewData;
  @Input() invoiceNumber: string = 'PREVIEW';
  @Input() issueDate: string = new Date().toLocaleDateString();
  @Input() dueDate: string = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  @Input() companyInfo = {
    name: 'Workerly Staffing Solutions',
    address: '123 Business Ave, Suite 100',
    city: 'Business City, BC 12345',
    phone: '+1 (555) 123-4567',
    email: 'billing@workerly.com',
    website: 'www.workerly.com'
  };

  @Output() onApprove = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatHours(hours: number): string {
    return hours.toFixed(2);
  }

  approve() {
    this.onApprove.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}