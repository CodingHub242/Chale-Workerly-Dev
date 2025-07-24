import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetsPageRoutingModule } from './timesheets-routing.module';

import { TimesheetsPage } from './timesheets.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimesheetsPageRoutingModule,
    TimesheetsPage
  ],
 // declarations: [TimesheetsPage]
})
export class TimesheetsPageModule {}
