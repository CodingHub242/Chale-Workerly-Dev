import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TemploginPageRoutingModule } from './templogin-routing.module';

import { TemploginPage } from './templogin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TemploginPageRoutingModule,
    TemploginPage
  ],
  //declarations: [TemploginPage]
})
export class TemploginPageModule {}
