import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShiftReportsPageRoutingModule } from './shift-reports-routing.module';

import { ShiftReportsPage } from './shift-reports.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShiftReportsPageRoutingModule
  ],
  //declarations: [ShiftReportsPage]
})
export class ShiftReportsPageModule {}
