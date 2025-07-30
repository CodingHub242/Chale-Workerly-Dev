import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
 registerForm!: FormGroup;

  constructor(private authService: AuthService, private router: Router) {}


  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      role: new FormControl('admin'),
    });
  }
onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.firstName, this.registerForm.value.lastName,this.registerForm.value.role)
        .subscribe((user) => {
          this.router.navigate(['/dashboard']);
        }, (error) => {
          console.error(error);
        });
    }
  }
}