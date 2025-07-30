import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { Timesheet } from '../models/timesheet.model';
import { Client } from '../models/client.model';
import { Shift } from '../models/shift.model';
import { TimesheetService } from './timesheet.service';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private invoices: Invoice[] = [];

  constructor(
    private timesheetService: TimesheetService,
    private clientService: ClientService
  ) { }

  getInvoices(): Observable<Invoice[]> {
    return of(this.invoices);
  }

  getInvoice(id: number): Observable<Invoice> {
    return of(this.invoices.find(invoice => invoice.id === id) as Invoice);
  }

  generateInvoice(clientId: number, issueDate: Date, dueDate: Date): Observable<Invoice> {
    return new Observable(observer => {
      forkJoin({
        client: this.clientService.getClient(clientId),
        timesheets: this.timesheetService.getTimesheets()
      }).subscribe(({ client, timesheets }: { client: Client, timesheets: Timesheet[] }) => {
        const relevantTimesheets = timesheets.filter((timesheet: Timesheet) =>
          timesheet.shifts.every((shift: Shift) => shift.job.client.id === clientId) &&
          timesheet.approvedBy
        );

        const newInvoice: Invoice = {
          id: this.invoices.length + 1,
          client: client,
          timesheets: relevantTimesheets,
          totalAmount: relevantTimesheets.reduce((acc: number, timesheet: Timesheet) => acc + timesheet.totalPay, 0),
          issueDate,
          dueDate,
          paid: false
        };
        this.invoices.push(newInvoice);
        observer.next(newInvoice);
        observer.complete();
      });
    });
  }
}