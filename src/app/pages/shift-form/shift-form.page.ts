import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftService } from '../../services/shift.service';
import { JobService } from '../../services/job.service';
import { TempService } from '../../services/temp.service';
import { ClientService } from '../../services/client.service';
import { Shift } from '../../models/shift.model';
import { Job } from '../../models/job.model';
import { Temp } from '../../models/temp.model';
import { Client } from '../../models/client.model';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AssignDrawerComponent } from '../assign-drawer/assign-drawer.component';

@Component({
  selector: 'app-shift-form',
  templateUrl: './shift-form.page.html',
  styleUrls: ['./shift-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, AssignDrawerComponent]
})
export class ShiftFormPage implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  shiftId: number = 0;
  jobs: Job[] = [];
  temps: Temp[] = [];
  clients: Client[] = [];
  filteredTemps: Temp[] = [];

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private jobService: JobService,
    private tempService: TempService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      jobId: ['', Validators.required],
      clientId: ['', Validators.required],
      tempIds: [[]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      notes: [''],
      allDay: [false]
    });

    this.form.get('allDay')?.valueChanges.subscribe(allDay => {
      const startTime = this.form.get('startTime');
      const endTime = this.form.get('endTime');

      if (allDay) {
        startTime?.clearValidators();
        endTime?.clearValidators();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        this.form.patchValue({
          startTime: startOfDay.toISOString().slice(0, 16),
          endTime: endOfDay.toISOString().slice(0, 16)
        });
      } else {
        startTime?.setValidators([Validators.required]);
        endTime?.setValidators([Validators.required]);
      }
      startTime?.updateValueAndValidity();
      endTime?.updateValueAndValidity();
    });

    this.form.get('jobId')?.valueChanges.subscribe(jobId => {
      const selectedJob = this.jobs.find(j => j.id === jobId);
      console.log('Selected Job:', selectedJob);
      if (selectedJob) {
        this.form.patchValue({ clientId: selectedJob.client.id });
        this.filterTempsByJob(selectedJob);
      } else {
        this.filteredTemps = this.temps;
      }
      this.form.get('tempIds')?.setValue([]);
    });

    this.jobService.getJobs().subscribe(jobs => this.jobs = jobs);
    this.tempService.getTemps().subscribe(temps => {
      this.temps = temps;
      this.filteredTemps = temps;
    });
    this.clientService.getClients().subscribe(clients => this.clients = clients);

    const date = this.route.snapshot.queryParams['date'];
    if (date) {
      this.form.patchValue({
        startTime: new Date(date).toISOString().slice(0, 16)
      });
    }

    this.shiftId = this.route.snapshot.params['id'];
    if (this.shiftId) {
      this.isEditMode = true;
      this.shiftService.getShift(this.shiftId).subscribe((shift:any) => {
        this.form.patchValue({
          jobId: shift[0].job.id,
          clientId: shift[0].client.id,
          tempIds: shift[0].temps.map((t:any) => t.id),
          startTime: new Date(shift[0].startTime).toISOString().slice(0, 16),
          endTime: new Date(shift[0].endTime).toISOString().slice(0, 16),
          notes: shift[0].notes
        });
      });
    }
  }

  async openAssignDrawer() {
    const modal = await this.modalCtrl.create({
      component: AssignDrawerComponent,
      componentProps: {
        temps: this.filteredTemps,
        selectedTemps: this.form.get('tempIds')?.value
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.form.patchValue({
        tempIds: data.selectedTemps
      });
    }
  }

  filterTempsByJob(job: Job) {
    const jobExperienceRange = job.experience;

    if (!jobExperienceRange || jobExperienceRange.length !== 2) {
      this.filteredTemps = this.temps;
      console.warn('Job does not have a valid experience range:', job);
      return;
    }

    const [minExp, maxExp] = jobExperienceRange;

    this.filteredTemps = this.temps.filter(temp => {
      if (typeof temp.experience !== 'number') {
        console.warn(`Temp with ID ${temp.id} has an invalid experience value.`);
        return false;
      }
      return temp.experience >= minExp && temp.experience <= maxExp;
    });
  }

  saveShift() {
    if (this.form.invalid) {
      return;
    }

    const { tempIds, startTime, endTime, notes } = this.form.value;

    const selectedJob = this.jobs.find(j => j.id === this.form.value.jobId);
    if (!selectedJob) {
      console.error('No job selected');
      return;
    }

    const shiftData = {
      job_id: selectedJob.id,
      client_id: selectedJob.client.id,
      temp_ids: tempIds,
      start_time: startTime,
      end_time: endTime,
      notes: notes,
    };

    if (this.isEditMode) {
      this.shiftService.updateShift(this.shiftId, shiftData).subscribe({
        next: () => {
          this.router.navigate(['/shifts']).then(() => {
            window.location.reload();
          });
        },
        error: (err) => {
          console.error('Error updating shift:', err);
        }
      });
    } else {
      this.shiftService.addShift(shiftData).subscribe({
        next: () => {
          this.router.navigate(['/shifts']).then(() => {
            window.location.reload();
          });
        },
        error: (err) => {
          console.error('Error creating shift:', err);
        }
      });
    }
  }
}
