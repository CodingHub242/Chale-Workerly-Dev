import { Component, OnInit } from '@angular/core';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temps',
  templateUrl: './temps.page.html',
  styleUrls: ['./temps.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TempsPage implements OnInit {

  temps: Temp[] = [];

  constructor(
    private tempService: TempService,
    private router: Router
  ) { }

  ngOnInit() {
    this.tempService.getTemps().subscribe(temps => {
      this.temps = temps;
    });
  }

  addTemp() {
    this.router.navigate(['/temp-form']);
  }

  viewTemp(id: number) {
    this.router.navigate(['/temp-detail', id]);
  }

}
