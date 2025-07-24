import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientFormPage } from './client-form.page';

const routes: Routes = [
  {
    path: '',
    component: ClientFormPage
  },
  {
    path: ':id',
    component: ClientFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientFormPageRoutingModule {}
