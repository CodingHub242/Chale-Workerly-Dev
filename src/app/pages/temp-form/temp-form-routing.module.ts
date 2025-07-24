import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TempFormPage } from './temp-form.page';

const routes: Routes = [
  {
    path: '',
    component: TempFormPage
  },
  {
    path: ':id',
    component: TempFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TempFormPageRoutingModule {}
