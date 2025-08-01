import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface GeneratedInvoice {
  id: string;
  invoice_number: string;
  client: {
    id: number;
    name: string;
    email: string;
    address: string;
    phone?: string;
  };
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: {
    id: number;
    description: string;
    temp_name: string;
    hours: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  payment_terms?: string;
}

@Component({
  selector: 'app-invoice-display',
  templateUrl: './invoice-display.component.html',
  styleUrls: ['./invoice-display.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InvoiceDisplayComponent implements OnInit {
  @Input() invoiceData!: GeneratedInvoice;
  @Input() showActions: boolean = true;
  @Input() onPrint?: () => void;
  @Input() onDownload?: () => void;
  @Input() onEmail?: () => void;
  @Input() onMarkPaid?: () => void;

  constructor() { }

  ngOnInit() {
    if (!this.invoiceData) {
      console.error('Invoice data is required for InvoiceDisplayComponent');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return 'medium';
      case 'sent':
        return 'primary';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'draft':
        return 'document-outline';
      case 'sent':
        return 'mail-outline';
      case 'paid':
        return 'checkmark-circle-outline';
      case 'overdue':
        return 'warning-outline';
      default:
        return 'document-outline';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  handlePrint() {
    if (this.onPrint) {
      this.onPrint();
    } else {
      window.print();
    }
  }

  handleDownload() {
    if (this.onDownload) {
      this.onDownload();
    }
  }

  handleEmail() {
    if (this.onEmail) {
      this.onEmail();
    }
  }

  handleMarkPaid() {
    if (this.onMarkPaid) {
      this.onMarkPaid();
    }
  }

  getTotalHours(): number {
    return this.invoiceData.items.reduce((total, item) => total + item.hours, 0);
  }

  getUniqueTemps(): string[] {
    const temps = this.invoiceData.items.map(item => item.temp_name);
    return [...new Set(temps)];
  }

  getWorkerSummary(): any[] {
    const workerMap = new Map();
    
    this.invoiceData.items.forEach(item => {
      const workerName = item.temp_name;
      if (workerMap.has(workerName)) {
        const existing = workerMap.get(workerName);
        existing.totalHours += item.hours;
        existing.totalAmount += item.amount;
        existing.itemCount += 1;
        existing.rates.push(item.rate);
      } else {
        workerMap.set(workerName, {
          name: workerName,
          totalHours: item.hours,
          totalAmount: item.amount,
          itemCount: 1,
          rates: [item.rate]
        });
      }
    });
    
    // Calculate average rates and return array
    return Array.from(workerMap.values()).map(worker => ({
      ...worker,
      averageRate: worker.rates.reduce((sum: number, rate: number) => sum + rate, 0) / worker.rates.length
    }));
  }
}