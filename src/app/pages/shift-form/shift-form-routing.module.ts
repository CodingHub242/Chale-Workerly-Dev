import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShiftFormPage } from './shift-form.page';

const routes: Routes = [
  {
    path: '',
    component: ShiftFormPage
  },
  {
    path: ':id',
    component: ShiftFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftFormPageRoutingModule {}
