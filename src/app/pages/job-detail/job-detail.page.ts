import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.page.html',
  styleUrls: ['./job-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class JobDetailPage implements OnInit {

  job!: Job;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router
  ) { }

  ngOnInit() {
    const jobId = this.route.snapshot.params['id'];
    this.jobService.getJob(jobId).subscribe((job:any) => {
      this.job = job[0];

      //console.log('Job Details:', this.job.title);
    });
  }

  editJob() {
    this.router.navigate(['/job-form', this.job.id]);
  }

}
