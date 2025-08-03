import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TempDashboardPageRoutingModule } from './temp-dashboard-routing.module';

import { TempDashboardPage } from './temp-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TempDashboardPageRoutingModule,
    TempDashboardPage
  ]
})
export class TempDashboardPageModule {}