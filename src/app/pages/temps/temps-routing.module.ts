import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TempsPage } from './temps.page';

const routes: Routes = [
  {
    path: '',
    component: TempsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TempsPageRoutingModule {}
