import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Invoice } from '../models/invoice.model';
import { Timesheet } from '../models/timesheet.model';
import { Client } from '../models/client.model';
import { Shift } from '../models/shift.model';
import { Temp } from '../models/temp.model';
import { TimesheetService } from './timesheet.service';
import { ClientService } from './client.service';
import { TempService } from './temp.service';
import { environment } from '../../environments/environment';

export interface InvoiceGenerationRequest {
  client_id: number;
  timesheet_ids: number[];
  due_date?: string;
  notes?: string;
}

export interface InvoicePreviewRequest {
  client_id: number;
  timesheet_ids: number[];
}

export interface InvoicePreview {
  client: Client;
  timesheets: any[];
  summary: {
    total_hours: number;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    timesheet_count: number;
  };
}

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  data?: Invoice;
  errors?: any;
}

export interface InvoiceListResponse {
  success: boolean;
  data?: {
    data: Invoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface InvoiceStatistics {
  total_invoices: number;
  pending_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_revenue: number;
  pending_revenue: number;
  overdue_revenue: number;
  current_month_revenue: number;
  average_invoice_amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = `${environment.apiUrl}/invoices`;
  private preview = `${environment.apiUrl}`;
  private timesheetApiUrl = `${environment.apiUrl}/timesheets`;

  constructor(
    private http: HttpClient,
    private timesheetService: TimesheetService,
    private clientService: ClientService,
    private tempService: TempService
  ) { }

  /**
   * Get all invoices with optional filtering
   */
  getInvoices(params?: {
    status?: string;
    client_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Observable<Invoice[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Invoice[]>(this.apiUrl, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('Error fetching invoices:', error);
          return of([]);
        })
      );
  }

  /**
   * Get single invoice details
   */
  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching invoice:', error);
          throw error;
        })
      );
  }

  /**
   * Get approved timesheets available for invoicing
   */
  getApprovedTimesheetsForInvoicing(): Observable<Timesheet[]> {
    return this.http.get<{ success: boolean; data: Timesheet[] }>(`${this.timesheetApiUrl}/available-for-invoice`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching available timesheets:', error);
          return of([]);
        })
      );
  }

  /**
   * Get invoiced timesheets
   */
  getInvoicedTimesheets(): Observable<Timesheet[]> {
    return this.http.get<{ success: boolean; data: Timesheet[] }>(`${this.timesheetApiUrl}/invoiced`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching invoiced timesheets:', error);
          return of([]);
        })
      );
  }

  /**
   * Generate invoice preview before creating actual invoice
   */
  generateInvoicePreview(request: InvoicePreviewRequest): Observable<InvoicePreview> {
    return this.http.post<{ success: boolean; data: InvoicePreview }>(`${this.preview}/preview/invoice`, request)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Failed to generate preview');
        }),
        catchError(error => {
          console.error('Error generating invoice preview:', error);
          throw error;
        })
      );
  }

  /**
   * Generate invoice from approved timesheets
   */
  generateInvoiceFromTimesheets(request: InvoiceGenerationRequest): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/generate`, request)
      .pipe(
        catchError(error => {
          console.error('Error generating invoice:', error);
          throw error;
        })
      );
  }

  /**
   * Legacy method - kept for backward compatibility
   */
  generateInvoice(clientId: number, timesheetIds: number[], dueDate?: Date, notes?: string): Observable<Invoice> {
    const request: InvoiceGenerationRequest = {
      client_id: clientId,
      timesheet_ids: timesheetIds,
      due_date: dueDate?.toISOString().split('T')[0],
      notes
    };
    return this.generateInvoiceFromTimesheets(request);
  }

  /**
   * Update invoice status
   */
  updateInvoiceStatus(invoiceId: number, status: string): Observable<InvoiceResponse> {
    return this.http.patch<InvoiceResponse>(`${this.apiUrl}/${invoiceId}/status`, { status })
      .pipe(
        catchError(error => {
          console.error('Error updating invoice status:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to update invoice status'
          });
        })
      );
  }

  /**
   * Mark invoice as paid
   */
  markInvoiceAsPaid(invoiceId: number): Observable<InvoiceResponse> {
    return this.http.patch<InvoiceResponse>(`${this.apiUrl}/${invoiceId}/mark-paid`, {})
      .pipe(
        catchError(error => {
          console.error('Error marking invoice as paid:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to mark invoice as paid'
          });
        })
      );
  }

  /**
   * Cancel invoice
   */
  cancelInvoice(invoiceId: number): Observable<InvoiceResponse> {
    return this.http.patch<InvoiceResponse>(`${this.apiUrl}/${invoiceId}/cancel`, {})
      .pipe(
        catchError(error => {
          console.error('Error cancelling invoice:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to cancel invoice'
          });
        })
      );
  }

  /**
   * Generate PDF invoice
   */
  generateInvoicePDF(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          console.error('Error generating PDF:', error);
          throw error;
        })
      );
  }

  /**
   * Send invoice via email
   */
  sendInvoice(invoiceId: number): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.apiUrl}/${invoiceId}/send`, {})
      .pipe(
        catchError(error => {
          console.error('Error sending invoice:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to send invoice'
          });
        })
      );
  }

  /**
   * Get invoice statistics
   */
  getInvoiceStatistics(): Observable<{ success: boolean; data?: InvoiceStatistics }> {
    return this.http.get<{ success: boolean; data: InvoiceStatistics }>(`${this.apiUrl}/stats/overview`)
      .pipe(
        catchError(error => {
          console.error('Error fetching invoice statistics:', error);
          return of({ success: false });
        })
      );
  }

  /**
   * Get overdue invoices
   */
  getOverdueInvoices(): Observable<Invoice[]> {
    return this.http.get<{ success: boolean; data: Invoice[] }>(`${this.apiUrl}/status/overdue`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching overdue invoices:', error);
          return of([]);
        })
      );
  }

  /**
   * Bulk mark invoices as sent
   */
  bulkMarkAsSent(invoiceIds: number[]): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.apiUrl}/bulk/mark-sent`, { invoice_ids: invoiceIds })
      .pipe(
        catchError(error => {
          console.error('Error bulk marking as sent:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to mark invoices as sent'
          });
        })
      );
  }

  /**
   * Bulk mark invoices as paid
   */
  bulkMarkAsPaid(invoiceIds: number[]): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.apiUrl}/bulk/mark-paid`, { invoice_ids: invoiceIds })
      .pipe(
        catchError(error => {
          console.error('Error bulk marking as paid:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to mark invoices as paid'
          });
        })
      );
  }

  /**
   * Remove timesheet from invoice (if invoice is still editable)
   */
  removeTimesheetFromInvoice(timesheetId: number): Observable<InvoiceResponse> {
    return this.http.delete<InvoiceResponse>(`${this.timesheetApiUrl}/${timesheetId}/remove-from-invoice`)
      .pipe(
        catchError(error => {
          console.error('Error removing timesheet from invoice:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to remove timesheet from invoice'
          });
        })
      );
  }
}