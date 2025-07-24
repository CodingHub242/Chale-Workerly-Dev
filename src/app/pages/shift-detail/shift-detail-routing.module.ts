import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShiftDetailPage } from './shift-detail.page';

const routes: Routes = [
  {
    path: ':id',
    component: ShiftDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftDetailPageRoutingModule {}
