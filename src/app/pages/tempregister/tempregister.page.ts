import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Temp } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TempService } from 'src/app/services/temp.service';
import { JobService } from 'src/app/services/job.service';
import { Job } from 'src/app/models/job.model';

@Component({
  standalone:true,
  selector: 'app-tempregister',
  templateUrl: './tempregister.page.html',
  styleUrls: ['./tempregister.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule,ReactiveFormsModule]

})
export class TempregisterPage implements OnInit, OnDestroy {
registerForm!: FormGroup;
isLoading = false;
errorMessage = '';
passwordType: string = 'password';
passwordIcon: string = 'eye-outline';
availableJobs: Job[] = [];
displayJobs: Job[] = []; // Jobs for display including duplicates
sliderOffset = 0;
private sliderInterval: any;
private cardWidth = 305; // Card width (280px) + margin (25px)

  constructor( private fb: FormBuilder,private authService: AuthService, private router: Router,private tempService: TempService, private jobService: JobService) {}


  ngOnInit() {
    this.registerForm = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      experience: ['', [Validators.required]],
      basePay: ['0'],
      status: ['active'],
      password: ['', Validators.required],
      role: ['temp'],
      skills: ['', Validators.required],
      approvalStatus: ['pending'],
    });
    
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
          job.status === 'Assigning In Progress' || job.status === 'InActive'
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
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
   
    this.authService.addTemp(
      this.registerForm.value.title,
      this.registerForm.value.password,
      this.registerForm.value.firstName,
      this.registerForm.value.lastName,
      this.registerForm.value.role,
      this.registerForm.value.status,
      this.registerForm.value.phone,
      this.registerForm.value.email,
      this.registerForm.value.experience,
      this.registerForm.value.basePay,
      this.registerForm.value.skills.split(',').map((skill: string) => skill.trim()),
      this.registerForm.value.approvalStatus
    ).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        if (data.success) {
          this.router.navigate(['/temp-dashboard']).then(() => {
            window.location.reload();
          });
        } else {
          this.errorMessage = data.error || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Please check your connection and try again.';
        console.error('Registration error:', error);
      }
    });
  }

   login() {
    this.router.navigate(['/templogin']);
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
  }

}
