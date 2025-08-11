import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { JobService } from 'src/app/services/job.service';
import { Job } from 'src/app/models/job.model';
import { AppComponent } from 'src/app/app.component';

@Component({
  standalone: true,
  selector: 'app-templogin',
  templateUrl: './templogin.page.html',
  styleUrls: ['./templogin.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class TemploginPage implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  passwordType: string = 'password';
  passwordIcon: string = 'eye-outline';
  availableJobs: Job[] = [];
  displayJobs: Job[] = []; // Jobs for display including duplicates
  sliderOffset = 0;
  private sliderInterval: any;
  private cardWidth = 305; // Card width (280px) + margin (25px)

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private jobService: JobService,
    private appComponent: AppComponent
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    localStorage.removeItem('currentUser');
    this.appComponent.currentUser = false;
    
    this.loadAvailableJobs();
    this.startJobSlider();
  }

  ngOnDestroy() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  loadAvailableJobs() {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        // Filter for active jobs that are available for assignment
        this.availableJobs = jobs.filter(job =>
          // job.status === 'Assigning In Progress' || job.status === 'InActive'
          job.status === 'Assigning In Progress'
        );
        this.setupDisplayJobs();
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        // Fallback with sample jobs if API fails
        this.availableJobs = [
          { id: 1, title: 'Warehouse Assistant', payRate: 15, status: 'Assigning In Progress' } as Job,
          { id: 2, title: 'Office Clerk', payRate: 18, status: 'Assigning In Progress' } as Job,
          { id: 3, title: 'Customer Service', payRate: 16, status: 'Assigning In Progress' } as Job
        ];
        this.setupDisplayJobs();
      }
    });
  }

  setupDisplayJobs() {
    if (this.availableJobs.length > 0) {
      // Create duplicates for infinite loop effect
      // We need at least 2 sets to create seamless loop
      this.displayJobs = [...this.availableJobs, ...this.availableJobs];
    }
  }

  startJobSlider() {
    this.sliderInterval = setInterval(() => {
      if (this.availableJobs.length > 0) {
        // Move left by one card width
        this.sliderOffset -= this.cardWidth;
        
        // Calculate when we've shown all original cards once
        const originalSetWidth = this.availableJobs.length * this.cardWidth;
        
        // If we've moved past the first set, reset to beginning seamlessly
        if (Math.abs(this.sliderOffset) >= originalSetWidth) {
          this.sliderOffset = 0;
        }
      }
    }, 3000); // Change every 3 seconds
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
   
    this.authService.loginTemp(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        //console.log(data);
        if (data.temp.role === 'temp') {
          this.router.navigate(['/temp-dashboard']).then(() => {
            window.location.reload();
          });
        } else {
          this.errorMessage = 'This login is for temporary workers only.';
          localStorage.removeItem('currentUser');
          // window.location.reload();
          this.router.navigate(['/templogin']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
        //alert('Login error: '+ error);
        this.router.navigate(['/templogin']);
        // window.location.reload();
      }
    });
  }

  register() {
    this.router.navigate(['/tempregister']);
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
  }
}
