import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TempFormPageRoutingModule } from './temp-form-routing.module';

import { TempFormPage } from './temp-form.page';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TempFormPageRoutingModule,
    TempFormPage,
    ReactiveFormsModule
  ],
  //declarations: [TempFormPage]
})
export class TempFormPageModule {}
