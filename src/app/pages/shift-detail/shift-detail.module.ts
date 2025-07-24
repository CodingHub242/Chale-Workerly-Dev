import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShiftDetailPageRoutingModule } from './shift-detail-routing.module';

import { ShiftDetailPage } from './shift-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShiftDetailPageRoutingModule,
    ShiftDetailPage
  ]
})
export class ShiftDetailPageModule {}
