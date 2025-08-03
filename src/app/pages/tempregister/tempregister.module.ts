import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TempregisterPageRoutingModule } from './tempregister-routing.module';

import { TempregisterPage } from './tempregister.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TempregisterPageRoutingModule,
    TempregisterPage
  ],
  //declarations: [TempregisterPage]
})
export class TempregisterPageModule {}
