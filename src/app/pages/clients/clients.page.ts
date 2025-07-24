import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ClientsPage implements OnInit {

  clients: Client[] = [];

  constructor(
    private clientService: ClientService,
    private router: Router
  ) { }

  ngOnInit() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  addClient() {
    this.router.navigate(['/client-form']);
  }

  viewClient(id: number) {
    this.router.navigate(['/client-detail', id]);
  }

}
