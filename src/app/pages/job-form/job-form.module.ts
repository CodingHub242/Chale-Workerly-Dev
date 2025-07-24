import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobFormPageRoutingModule } from './job-form-routing.module';

import { JobFormPage } from './job-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobFormPageRoutingModule,
    JobFormPage
  ]
})
export class JobFormPageModule {}
