import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.page.html',
  styleUrls: ['./invoice-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class InvoiceFormPage implements OnInit {

  form!: FormGroup;
  clients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      issueDate: [new Date().toISOString(), Validators.required],
      dueDate: ['', Validators.required],
    });

    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  generateInvoice() {
    if (this.form.invalid) {
      return;
    }

    const { clientId, issueDate, dueDate } = this.form.value;
    this.invoiceService.generateInvoice(clientId, issueDate, dueDate).subscribe(invoice => {
      this.router.navigate(['/invoices']);
    });
  }
}
