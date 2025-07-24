import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetDetailPageRoutingModule } from './timesheet-detail-routing.module';

import { TimesheetDetailPage } from './timesheet-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimesheetDetailPageRoutingModule,
    TimesheetDetailPage
  ],
 // declarations: [TimesheetDetailPage]
})
export class TimesheetDetailPageModule {}
