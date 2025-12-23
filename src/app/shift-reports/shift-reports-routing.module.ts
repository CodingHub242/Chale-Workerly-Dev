import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShiftReportsPage } from './shift-reports.page';

const routes: Routes = [
  {
    path: '',
    component: ShiftReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftReportsPageRoutingModule {}
