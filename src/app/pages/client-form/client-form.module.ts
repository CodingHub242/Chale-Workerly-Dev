import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientFormPageRoutingModule } from './client-form-routing.module';

import { ClientFormPage } from './client-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientFormPageRoutingModule,
    ClientFormPage
  ]
})
export class ClientFormPageModule {}
