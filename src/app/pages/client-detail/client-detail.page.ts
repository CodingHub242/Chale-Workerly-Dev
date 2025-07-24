import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { CommonModule } from '@angular/common';

@Component({
  schemas:[ CUSTOM_ELEMENTS_SCHEMA ],
  standalone: true,
  selector: 'app-client-detail',
  templateUrl: './client-detail.page.html',
  styleUrls: ['./client-detail.page.scss'],
  imports: [CommonModule]
})
export class ClientDetailPage implements OnInit {

  client!: Client;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private router: Router
  ) { }

  ngOnInit() {
    const clientId = this.route.snapshot.params['id'];
    this.clientService.getClient(clientId).subscribe(client => {
      this.client = client;
    });
  }

  back(){
    this.router.navigate(['/clients']);
  }

  editClient() {
    this.router.navigate(['/client-form', this.client.id]);
  }

}
