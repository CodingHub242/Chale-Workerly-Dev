import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Temp } from '../../models/temp.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-drawer',
  templateUrl: './assign-drawer.component.html',
  styleUrls: ['./assign-drawer.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AssignDrawerComponent implements OnInit {

  @Input() temps: Temp[] = [];
  @Input() selectedTemps: number[] = [];
  searchTerm: string = '';
  filteredTemps: Temp[] = [];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.filteredTemps = this.temps;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss({
      selectedTemps: this.selectedTemps,
    });
  }

  isTempSelected(tempId: number) {
    return this.selectedTemps.includes(tempId);
  }


  toggleTemp(tempId: number) {
    const index = this.selectedTemps.indexOf(tempId);
    if (index > -1) {
      this.selectedTemps.splice(index, 1);
    } else {
      this.selectedTemps.push(tempId);
    }
  }

  onSearchTermChange(event: any) {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.filteredTemps = this.temps.filter(temp =>
        temp.firstName.toLowerCase().includes(query) ||
        temp.lastName.toLowerCase().includes(query) ||
        temp.email.toLowerCase().includes(query)
      );
    } else {
      this.filteredTemps = this.temps;
    }
  }

}
