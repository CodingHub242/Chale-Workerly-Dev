import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetFormPage } from './timesheet-form.page';

const routes: Routes = [
  {
    path: '',
    component: TimesheetFormPage
  },
  {
    path: ':id',
    component: TimesheetFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimesheetFormPageRoutingModule {}
