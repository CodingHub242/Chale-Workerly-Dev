import { Component, Input } from '@angular/core';
import { IonicModule, PopoverController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-popover',
  templateUrl: './email-popover.component.html',
  styleUrls: ['./email-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EmailPopoverComponent {

  @Input() attachment: any;
  emailForm: FormGroup;

  constructor(
    private popoverController: PopoverController,
    private fb: FormBuilder,
    private jobService: JobService,
    private toast:ToastController
  ) {
    this.emailForm = this.fb.group({
      recipient: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      body: ['']
    });
  }

  sendEmail() {
    if (this.emailForm.valid) {
      const emailData = {
        ...this.emailForm.value,
        attachmentId: this.attachment.id
      };
      // You will need a service method for this
      this.jobService.sendAttachmentByEmail(emailData).subscribe((data:any) => {
        //this.clientService.getClient(this.clientId);
        if(data.success)
        {
            const toast = this.toast.create({
              message: 'Email sent successfully.',
              duration: 2000,
              position: 'top',
              color: 'success'
            });
            toast.then(t => t.present());
        }
        else{
            const toast = this.toast.create({
              message: 'Failed to send email.',
              duration: 2000,
              position: 'top',
              color: 'danger'
            });
            toast.then(t => t.present());
        }//console.log('Email sent successfully:', data);
        });
      this.popoverController.dismiss();
    }
  }

  dismiss() {
    this.popoverController.dismiss();
  }
}