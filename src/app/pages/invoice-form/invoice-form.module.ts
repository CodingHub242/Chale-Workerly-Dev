import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoiceFormPageRoutingModule } from './invoice-form-routing.module';

import { InvoiceFormPage } from './invoice-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoiceFormPageRoutingModule,
    InvoiceFormPage
  ]
})
export class InvoiceFormPageModule {}
