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
  selectedFile: string | null = null;

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
      email: [''],
      experience: ['', [Validators.required]],
      basePay: ['0'],
      status: ['active'],
      role: ['temp'],
      approvalStatus: ['pending'],
      skills: [''],
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFile = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveTemp() {
    if (this.form.invalid) {
      return;
    }

    const tempDate: Temp = {
      ...this.form.value,
      skills: this.form.value.skills.split(',').map((skill: string) => skill.trim()),
      profilePictureUrl: this.selectedFile || undefined
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
