import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temp-detail',
  templateUrl: './temp-detail.page.html',
  styleUrls: ['./temp-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TempDetailPage implements OnInit {

  temp!: Temp;

  constructor(
    private route: ActivatedRoute,
    private tempService: TempService,
    private router: Router
  ) { }

  ngOnInit() {
    const tempId = this.route.snapshot.params['id'];
    this.tempService.getTemp(tempId).subscribe(temp => {
      this.temp = temp;
    });
  }

  editTemp() {
    this.router.navigate(['/temp-form', this.temp.id]);
  }

}
