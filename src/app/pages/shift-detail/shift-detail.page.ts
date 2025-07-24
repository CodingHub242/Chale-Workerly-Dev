import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftService } from '../../services/shift.service';
import { Shift } from '../../models/shift.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shift-detail',
  templateUrl: './shift-detail.page.html',
  styleUrls: ['./shift-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShiftDetailPage implements OnInit {

  shift!: Shift;

  constructor(
    private route: ActivatedRoute,
    private shiftService: ShiftService,
    private router: Router
  ) { }

  ngOnInit() {
    const shiftId = this.route.snapshot.params['id'];
    this.shiftService.getShift(shiftId).subscribe((shift:any) => {
      this.shift = shift[0];
      console.log('Shift details:', this.shift);
    });
  }

  editShift() {
    this.router.navigate(['/shift-form', this.shift.id]);
  }

}
