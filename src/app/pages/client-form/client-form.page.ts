import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

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
    });

    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId) {
      this.isEditMode = true;
      this.clientService.getClient(this.clientId).subscribe(client => {
        this.form.patchValue(client);
      });
    }
  }

  saveClient() {
    if (this.form.invalid) {
      return;
    }

    const clientData: Client = this.form.value;

    if (this.isEditMode) {
      clientData.id = this.clientId;
      this.clientService.updateClient(clientData).subscribe(() => {
        //this.clientService.getClient(this.clientId);
        this.router.navigate(['/clients']).then(() => {
          window.location.reload();
          });
      });
    } else {
      this.clientService.addClient(clientData).subscribe(() => {
        this.router.navigate(['/clients']).then(() => {
          window.location.reload();
          });
      });
    }
  }
}
