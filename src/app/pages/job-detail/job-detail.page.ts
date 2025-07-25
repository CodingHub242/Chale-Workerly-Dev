import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { EmailPopoverComponent } from './email-popover/email-popover.component';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.page.html',
  styleUrls: ['./job-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class JobDetailPage implements OnInit {

  job!: Job;
  extensionGot:any;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    const jobId = this.route.snapshot.params['id'];
    this.jobService.getJob(jobId).subscribe((job: Job) => {
      this.job = job;
      //console.log('Job Details:', this.job.attachments);
    });
  }

  editJob() {
    this.router.navigate(['/job-form', this.job.id]);
  }

  addAttachments(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments[]', files[i]);
      }
      // You might need a new service method here to upload attachments
      // For now, let's assume you have one.
       this.jobService.addAttachments(this.job.id, formData).subscribe((data:any) => {
          window.location.reload();
      });
    }
  }

  deleteAttachment(attachmentId: number) {
    // You will need a service method for this
    this.jobService.deleteAttachment(this.job.id, attachmentId).subscribe((data:any) => {
      window.location.reload();
    });
  }

  async presentEmailPopover(ev: any, attachment: any) {
    const popover = await this.popoverController.create({
      component: EmailPopoverComponent,
      componentProps: { attachment: attachment },
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    console.log('File Extension:', extension);
    this.extensionGot = extension;
    switch (extension) {
      case 'pdf':
        return 'document-text-outline';
      case 'doc':
      case 'docx':
        return 'document-outline';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'image-outline';
      default:
        return 'document-outline';
    }
  }
}
