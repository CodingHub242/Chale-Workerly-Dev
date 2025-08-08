import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TempCheckInPage } from './temp-check-in.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: TempCheckInPage
      }
    ])
  ],
  //declarations: [TempCheckInPage]
})
export class TempCheckInPageModule { }