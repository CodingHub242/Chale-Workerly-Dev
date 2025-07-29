import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.page.html',
  styleUrls: ['./client-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class ClientFormPage implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  clientId: number = 0;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar: [null]
    });

    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId) {
      this.isEditMode = true;
      this.clientService.getClient(this.clientId).subscribe(client => {
        this.form.patchValue(client);
        this.imagePreview = client.avatar ? `https://app.chaleapp.org/public/storage/${client.avatar}` : null;
      });
    }
  }

  onFileChange(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({
        avatar: file
      });
      this.form.get('avatar')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveClient() {
    if (this.form.invalid) {
      return;
    }

    const formData = new FormData();
    Object.keys(this.form.value).forEach(key => {
      formData.append(key, this.form.value[key]);
    });

    if (this.isEditMode) {
      formData.append('_method', 'PUT');
      this.clientService.updateClient(this.clientId, formData).subscribe(() => {
        //this.clientService.getClient(this.clientId);
        this.router.navigate(['/clients']).then(() => {
          window.location.reload();
          });
      });
    } else {
      this.clientService.addClient(formData).subscribe(() => {
        this.router.navigate(['/clients']).then(() => {
          window.location.reload();
          });
      });
    }
  }
}
