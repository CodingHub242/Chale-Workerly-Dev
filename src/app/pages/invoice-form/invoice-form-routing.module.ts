import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoiceFormPage } from './invoice-form.page';

const routes: Routes = [
  {
    path: '',
    component: InvoiceFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceFormPageRoutingModule {}
