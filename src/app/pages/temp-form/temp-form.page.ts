import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temp-form',
  templateUrl: './temp-form.page.html',
  styleUrls: ['./temp-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule,ReactiveFormsModule]
})
export class TempFormPage implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  tempId: number = 0;

  constructor(
    private fb: FormBuilder,
    private tempService: TempService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      experience: ['', [Validators.required]],
      basePay: ['0'],
      status: ['active'],
      role: ['temp'],
      approvalStatus: ['pending'],
      skills: ['', Validators.required],
    });

    this.tempId = this.route.snapshot.params['id'];
    if (this.tempId) {
      this.isEditMode = true;
      this.tempService.getTemp(this.tempId).subscribe(temp => {
        this.form.patchValue({
          ...temp,
          skills: temp.skills.join(',')
        });
      });
    }
  }

  saveTemp() {
    if (this.form.invalid) {
      return;
    }

    const tempDate: Temp = {
      ...this.form.value,
      skills: this.form.value.skills.split(',').map((skill: string) => skill.trim())
    };


    if (this.isEditMode) {
      tempDate.id = this.tempId;
      this.tempService.updateTemp(tempDate).subscribe(() => {
        this.router.navigate(['/temps']).then(() => {
          window.location.reload();
        });
      });
    } else {
      this.tempService.addTemp(tempDate).subscribe(() => {
        this.router.navigate(['/temps']).then(() => {
          window.location.reload();
        });
      });
    }
  }
}
