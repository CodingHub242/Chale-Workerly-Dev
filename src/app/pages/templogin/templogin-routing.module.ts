import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TemploginPage } from './templogin.page';

const routes: Routes = [
  {
    path: '',
    component: TemploginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemploginPageRoutingModule {}
