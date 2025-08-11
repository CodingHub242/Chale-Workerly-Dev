import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';

@Component({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-outline';

  constructor(private authService: AuthService, private router: Router,private appComponent: AppComponent) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });

    localStorage.removeItem('currentUser');
    this.appComponent.currentUser = false;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe((user) => {
          this.router.navigate(['/dashboard']).then(() => {
            window.location.reload();
          });
        }, (error) => {
          console.error(error);
        });
    }
  }

  register() {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
  }
}