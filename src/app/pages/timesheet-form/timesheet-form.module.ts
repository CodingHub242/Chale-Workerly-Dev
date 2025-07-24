import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetFormPageRoutingModule } from './timesheet-form-routing.module';

import { TimesheetFormPage } from './timesheet-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimesheetFormPageRoutingModule,
    TimesheetFormPage,
    ReactiveFormsModule
  ],
 // declarations: [TimesheetFormPage]
})
export class TimesheetFormPageModule {}
