import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TempregisterPage } from './tempregister.page';

const routes: Routes = [
  {
    path: '',
    component: TempregisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TempregisterPageRoutingModule {}
