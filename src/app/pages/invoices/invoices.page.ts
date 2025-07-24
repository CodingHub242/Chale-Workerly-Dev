import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class InvoicesPage implements OnInit {

  invoices: Invoice[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.invoiceService.getInvoices().subscribe(invoices => {
      this.invoices = invoices;
    });
  }

  addInvoice() {
    // For simplicity, I'll navigate to a new page to generate the invoice.
    // In a real app, you might have a modal or a more complex form.
    this.router.navigate(['/invoice-form']);
  }

  viewInvoice(id: number) {
    this.router.navigate(['/invoice-detail', id]);
  }
}
