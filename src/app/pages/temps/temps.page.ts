import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { TempService } from '../../services/temp.service';
import { Temp } from '../../models/temp.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-temps',
  templateUrl: './temps.page.html',
  styleUrls: ['./temps.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TempsPage implements OnInit {

  temps: Temp[] = [];
  currentUserRole: string = '';
  searchTerm: string = '';

  isLoading = false;

  constructor(
    private tempService: TempService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadTemps();
  }

  loadCurrentUser() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserRole = currentUser?.role || '';
  }

  loadTemps() {
    this.tempService.getTemps().subscribe(temps => {
      this.temps = temps;
    });
  }

  addTemp() {
    this.router.navigate(['/temp-form']);
  }

  viewTemp(id: number) {
    this.router.navigate(['/temp-detail', id]);
  }

  async approveTemp(temp: Temp, event: Event) {
    event.stopPropagation(); // Prevent card click
    
    const alert = await this.alertController.create({
      header: 'Approve Worker',
      message: `Are you sure you want to approve ${temp.firstName} ${temp.lastName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          handler: () => {
            this.performApproval(temp);
          }
        }
      ]
    });

    await alert.present();
  }

  async declineTemp(temp: Temp, event: Event) {
    event.stopPropagation(); // Prevent card click
    
    const alert = await this.alertController.create({
      header: 'Decline Worker',
      message: `Are you sure you want to decline ${temp.firstName} ${temp.lastName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Decline',
          handler: () => {
            this.performDecline(temp);
          }
        }
      ]
    });

    await alert.present();
  }

  private performApproval(temp: Temp) {
    this.isLoading = true;
    this.tempService.approveTemp(temp.id).subscribe({
      next: async () => {
        temp.approvalStatus = 'approved';
        this.isLoading = false;
        
        const toast = await this.toastController.create({
          message: `${temp.firstName} ${temp.lastName} has been approved`,
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async (error) => {
        this.isLoading = false;
        console.error('Error approving temp:', error);
        
        const toast = await this.toastController.create({
          message: 'Failed to approve worker. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  private performDecline(temp: Temp) {
    this.isLoading = true;
    this.tempService.declineTemp(temp.id).subscribe({
      next: async () => {
        temp.approvalStatus = 'declined';
        this.isLoading = false;
        
        const toast = await this.toastController.create({
          message: `${temp.firstName} ${temp.lastName} has been declined`,
          duration: 3000,
          color: 'warning',
          position: 'top'
        });
        await toast.present();
      },
      error: async (error) => {
        this.isLoading = false;
        console.error('Error declining temp:', error);
        
        const toast = await this.toastController.create({
          message: 'Failed to decline worker. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  getApprovalStatusColor(status?: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'declined': return 'danger';
      case 'pending': return 'warning';
      default: return 'medium';
    }
  }

  getApprovalStatusText(status?: string): string {
    switch (status) {
      case 'approved': return 'Approved';
      case 'declined': return 'Declined';
      case 'pending': return 'Pending';
      default: return 'Pending Review';
    }
  }

  onSearchTermChange(event:any) {
    const searchbarr = document.querySelector<HTMLElement>('ion-searchbar');
    const itemss = Array.from(document.querySelector<HTMLElement>('#temps-grid')!.children);

   //searchbarr?.addEventListener('ionInput', handleSInput);

  // function handleSInput(ev:any) {
     const query = event.target.value.toLowerCase();
     requestAnimationFrame(() => {
       itemss.forEach((item:any) => {
         const shouldShow = item.textContent.toLowerCase().indexOf(query) > -1;
         item["style"].display = shouldShow ? 'block' : 'none';
       });
     });
  }


}
