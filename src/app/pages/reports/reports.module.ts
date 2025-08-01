import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReportsPage } from './reports.page';
import { ReportsPageRoutingModule } from './reports-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsPageRoutingModule,
    ReportsPage
  ],
  //declarations: [ReportsPage]
})
export class ReportsPageModule {}