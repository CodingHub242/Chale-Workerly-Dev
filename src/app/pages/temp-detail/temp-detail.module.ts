import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TempDetailPageRoutingModule } from './temp-detail-routing.module';

import { TempDetailPage } from './temp-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TempDetailPageRoutingModule,
    TempDetailPage
  ],
  // declarations: [TempDetailPage]
})
export class TempDetailPageModule {}
