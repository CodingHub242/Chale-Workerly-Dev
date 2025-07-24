import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { ClientService } from '../../services/client.service';
import { Job } from '../../models/job.model';
import { Client } from '../../models/client.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.page.html',
  styleUrls: ['./job-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class JobFormPage implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  jobId: number = 0;
  clients: Client[] = [];
  existingAttachments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      client_id: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      payRate: ['', Validators.required],
      workhours: [''],
      experience: [{ lower: 0, upper: 5 }],
      status: ['Assigning In Progress', Validators.required],
      attachments: [[]]
    });

    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });

    this.jobId = this.route.snapshot.params['id'];
    //console.log('Job ID:', this.jobId);
    if (this.jobId) {
      this.isEditMode = true;
      this.jobService.getJob(this.jobId).subscribe((job:any) => {
        const jobData = job[0];
        this.existingAttachments = JSON.parse(jobData.attachments) || [];
        console.log('Existing Attachments:', this.existingAttachments);
        this.form.patchValue({
          ...jobData,
          client_id: jobData.client.id,
          experience: {
            lower: jobData.experience[0] || 0,
            upper: jobData.experience[1] || 5
          },
          attachments: this.existingAttachments,
        });
      });
    }
  }

  saveJob() {
    if (this.form.invalid) {
      return;
    }

    const formData = new FormData();
    const jobData = this.form.value;

    Object.keys(jobData).forEach(key => {
      if (key === 'attachments') {
        const attachments = this.form.get('attachments')?.value;
        if (attachments && attachments.length > 0) {
          for (let i = 0; i < attachments.length; i++) {
            formData.append('attachments[]', attachments[i]);
          }
        }
      } else if (key === 'experience') {
        const experience = jobData[key];
        if (experience && typeof experience === 'object') {
          // Append as an array for the backend to process
          formData.append('experience[]', experience.lower);
          formData.append('experience[]', experience.upper);
        } else {
          formData.append(key, experience);
        }
      } else {
        formData.append(key, jobData[key]);
      }
    });

    if (this.isEditMode) {
      formData.append('id', this.jobId.toString());
      formData.append('_method', 'PUT'); // Spoof the PUT method for Laravel
      this.jobService.updateJob(formData).subscribe(() => {
        this.router.navigate(['/jobs']).then(() => {
          window.location.reload();
        });
      });
    } else {
      this.jobService.addJob(formData).subscribe(() => {
        this.router.navigate(['/jobs']).then(() => {
          window.location.reload();
          });
      });
    }
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files) {
      this.form.patchValue({
        attachments: Array.from(files)
      });
    }
  }
}
