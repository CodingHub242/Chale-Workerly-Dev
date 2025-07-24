import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientDetailPageRoutingModule } from './client-detail-routing.module';

import { ClientDetailPage } from './client-detail.page';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientDetailPageRoutingModule,
    ClientDetailPage
  ]
})
export class ClientDetailPageModule {}
