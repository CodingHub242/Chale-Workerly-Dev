import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../../services/timesheet.service';
import { InvoiceService, InvoicePreview } from '../../services/invoice.service';
import { ClientService } from '../../services/client.service';
import { Timesheet } from '../../models/timesheet.model';
import { Client } from '../../models/client.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { InvoicePreviewComponent } from '../../components/invoice-preview/invoice-preview.component';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.page.html',
  styleUrls: ['./timesheets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, InvoicePreviewComponent]
})
export class TimesheetsPage implements OnInit {

  timesheets: Timesheet[] = [];
  filteredTimesheets: Timesheet[] = [];
  statusFilter: string = '';
  currentUser: any;
  selectedTimesheets: number[] = [];
  clients: Client[] = [];
  showInvoiceGeneration = false;

  constructor(
    private timesheetService: TimesheetService,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private router: Router,
    public authService: AuthService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTimesheets();
    this.loadClients();
  }

  loadTimesheets() {
    let filters: any = {};
    
    // For temps, only show their own timesheets
    if (this.authService.isTemp()) {
      // Use the temp user's ID or tempId property
      const tempUser = this.currentUser;
      //filters.tempId = tempUser.tempId || tempUser.id;
      filters.tempId = tempUser.id;
      console.log('Filtering timesheets for temp user:', filters.tempId);

       this.timesheetService.getTempsheet(filters).subscribe(timesheets => {
      this.timesheets = timesheets;
      this.filteredTimesheets = timesheets;

      console.log('Loaded timesheets for temp user:', this.timesheets);
    });
    }
    else
      {
         this.timesheetService.getTimesheets(filters).subscribe(timesheets => {
          this.timesheets = timesheets;
          this.filteredTimesheets = timesheets;

          console.log('Loaded timesheets for temp user:', this.timesheets);
        });
      }
    
   
  }

  loadClients() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  addTimesheet() {
    this.router.navigate(['/timesheet-form']);
  }

  viewTimesheet(id: number) {
    this.router.navigate(['/timesheet-detail', id]);
  }

  filterTimesheets() {
    if (this.statusFilter) {
      this.filteredTimesheets = this.timesheets.filter(timesheet =>
        timesheet.status === this.statusFilter
      );
    } else {
      this.filteredTimesheets = this.timesheets;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'submitted':
        return 'primary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'medium';
    }
  }

  // Invoice generation methods
  toggleTimesheetSelection(timesheetId: number) {
    const index = this.selectedTimesheets.indexOf(timesheetId);
    if (index > -1) {
      this.selectedTimesheets.splice(index, 1);
    } else {
      this.selectedTimesheets.push(timesheetId);
    }
  }

  isTimesheetSelected(timesheetId: number): boolean {
    return this.selectedTimesheets.includes(timesheetId);
  }

  getApprovedTimesheets(): Timesheet[] {
    return this.filteredTimesheets.filter(ts => ts.status === 'approved');
  }

  selectAllApprovedTimesheets() {
    const approvedIds = this.getApprovedTimesheets().map(ts => ts.id);
    this.selectedTimesheets = [...approvedIds];
  }

  clearSelection() {
    this.selectedTimesheets = [];
  }

  async generateInvoice() {
    if (this.selectedTimesheets.length === 0) {
      const toast = await this.toastController.create({
        message: 'Please select at least one approved timesheet',
        duration: 3000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    // Check if all selected timesheets are approved
    const selectedTimesheetObjects = this.timesheets.filter(ts =>
      this.selectedTimesheets.includes(ts.id)
    );
    
    const unapprovedCount = selectedTimesheetObjects.filter(ts =>
      ts.status !== 'approved'
    ).length;

    if (unapprovedCount > 0) {
      const toast = await this.toastController.create({
        message: `${unapprovedCount} selected timesheet(s) are not approved and will be excluded`,
        duration: 4000,
        color: 'warning'
      });
      toast.present();
    }

    // Filter to only approved timesheets
    const approvedTimesheetIds = selectedTimesheetObjects
      .filter(ts => ts.status === 'approved')
      .map(ts => ts.id);

    if (approvedTimesheetIds.length === 0) {
      const toast = await this.toastController.create({
        message: 'No approved timesheets selected',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    this.showClientSelectionModal(approvedTimesheetIds);
  }

  async showClientSelectionModal(timesheetIds: number[]) {
    const alert = await this.alertController.create({
      header: 'Generate Invoice',
      message: 'Select a client for this invoice:',
      inputs: this.clients.map(client => ({
        name: 'client',
        type: 'radio',
        label: client.name,
        value: client.id
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Preview Invoice',
          handler: (clientId) => {
            if (clientId) {
              this.previewInvoice(timesheetIds, clientId);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  previewInvoice(timesheetIds: number[], clientId: number) {
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    this.invoiceService.generateInvoicePreview({
      client_id: clientId,
      timesheet_ids: timesheetIds
    }).subscribe({
      next: (preview) => {
        this.showInvoicePreview(preview, timesheetIds, clientId, issueDate, dueDate);
      },
      error: (error) => {
        console.error('Error generating invoice preview:', error);
        this.showErrorToast('Failed to generate invoice preview');
      }
    });
  }

  async showInvoicePreview(preview: InvoicePreview, timesheetIds: number[], clientId: number, issueDate: Date, dueDate: Date) {
    const modal = await this.modalController.create({
      component: InvoicePreviewComponent,
      componentProps: {
        invoiceData: preview,
        isPreview: true,
        onGenerate: () => {
          modal.dismiss();
          this.createInvoice(timesheetIds, clientId, issueDate, dueDate);
        },
        onCancel: () => {
          modal.dismiss();
        }
      },
      cssClass: 'invoice-preview-modal'
    });

    await modal.present();
  }

  createInvoice(timesheetIds: number[], clientId: number, issueDate: Date, dueDate: Date) {
    this.invoiceService.generateInvoiceFromTimesheets({
      client_id: clientId,
      timesheet_ids: timesheetIds,
      due_date: dueDate.toISOString().split('T')[0],
      notes: 'Generated from approved timesheets'
    }).subscribe({
      next: (invoice) => {
        this.showSuccessToast(`Invoice #${invoice.id} generated successfully!`);
        this.clearSelection();
        this.router.navigate(['/invoices']);
      },
      error: (error) => {
        console.error('Error generating invoice:', error);
        this.showErrorToast('Failed to generate invoice');
      }
    });
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  toggleInvoiceGeneration() {
    this.showInvoiceGeneration = !this.showInvoiceGeneration;
    if (!this.showInvoiceGeneration) {
      this.clearSelection();
    }
  }

  // Admin approve/reject functionality
  async approveTimesheet(timesheet: Timesheet, event: Event) {
    event.stopPropagation(); // Prevent card click
    
    const alert = await this.alertController.create({
      header: 'Approve Timesheet',
      message: `Are you sure you want to approve Timesheet #${timesheet.id}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          handler: () => {
            this.performApproval(timesheet);
          }
        }
      ]
    });

    await alert.present();
  }

  async rejectTimesheet(timesheet: Timesheet, event: Event) {
    event.stopPropagation(); // Prevent card click
    
    const alert = await this.alertController.create({
      header: 'Reject Timesheet',
      message: `Please provide a reason for rejecting Timesheet #${timesheet.id}:`,
      inputs: [
        {
          name: 'rejectionReason',
          type: 'textarea',
          placeholder: 'Enter rejection reason...',
          attributes: {
            required: true,
            minlength: 10
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          handler: (data: any) => {
            if (data.rejectionReason && data.rejectionReason.trim().length >= 10) {
              this.performRejection(timesheet, data.rejectionReason.trim());
              return true;
            } else {
              this.showErrorToast('Rejection reason must be at least 10 characters long');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private performApproval(timesheet: Timesheet) {
    this.timesheetService.approveTimesheet(timesheet.id, this.currentUser.id).subscribe({
      next: (updatedTimesheet: any) => {
        // Update the timesheet in the local array
        const index = this.timesheets.findIndex((ts: any) => ts.id === timesheet.id);
        if (index !== -1) {
          this.timesheets[index] = updatedTimesheet;
          this.filterTimesheets(); // Refresh filtered list
        }
        this.showSuccessToast(`Timesheet #${timesheet.id} has been approved successfully`);

        window.location.reload();
      },
      error: (error: any) => {
        console.error('Error approving timesheet:', error);
        this.showErrorToast('Failed to approve timesheet. Please try again.');
      }
    });
  }

  private performRejection(timesheet: Timesheet, rejectionReason: string) {
    this.timesheetService.rejectTimesheet(timesheet.id, rejectionReason).subscribe({
      next: (updatedTimesheet: any) => {
        // Update the timesheet in the local array
        const index = this.timesheets.findIndex((ts: any) => ts.id === timesheet.id);
        if (index !== -1) {
          this.timesheets[index] = updatedTimesheet;
          this.filterTimesheets(); // Refresh filtered list
        }
        this.showSuccessToast(`Timesheet #${timesheet.id} has been rejected`);

        window.location.reload();
      },
      error: (error: any) => {
        console.error('Error rejecting timesheet:', error);
        this.showErrorToast('Failed to reject timesheet. Please try again.');
      }
    });
  }

  // Delete timesheet functionality
  async deleteTimesheet(timesheet: Timesheet, event: Event) {
    event.stopPropagation(); // Prevent card click
    
    const alert = await this.alertController.create({
      header: 'Delete Timesheet',
      message: `Are you sure you want to permanently delete Timesheet #${timesheet.id}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.performDeletion(timesheet);
          }
        }
      ]
    });

    await alert.present();
  }

  private performDeletion(timesheet: Timesheet) {
    this.timesheetService.deleteTimesheet(timesheet.id).subscribe({
      next: () => {
        // Remove the timesheet from the local arrays
        const index = this.timesheets.findIndex((ts: any) => ts.id === timesheet.id);
        if (index !== -1) {
          this.timesheets.splice(index, 1);
          this.filterTimesheets(); // Refresh filtered list
        }
        this.showSuccessToast(`Timesheet #${timesheet.id} has been deleted successfully`);
      },
      error: (error: any) => {
        //console.error(error.error.error);
        this.showErrorToast((error.error.error).toString());
      }
    });
  }

  // Bulk approval functionality
  async bulkApproveTimesheets() {
    const submittedTimesheets = this.getSubmittedTimesheets();
    if (submittedTimesheets.length === 0) {
      this.showErrorToast('No submitted timesheets to approve');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Bulk Approve Timesheets',
      message: `Are you sure you want to approve ${submittedTimesheets.length} submitted timesheet(s)?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve All',
          handler: () => {
            this.performBulkApproval(submittedTimesheets);
          }
        }
      ]
    });

    await alert.present();
  }

  private performBulkApproval(timesheets: Timesheet[]) {
    let completedCount = 0;
    let errorCount = 0;

    timesheets.forEach(timesheet => {
      this.timesheetService.approveTimesheet(timesheet.id, this.currentUser.id).subscribe({
        next: (updatedTimesheet: any) => {
          const index = this.timesheets.findIndex((ts: any) => ts.id === timesheet.id);
          if (index !== -1) {
            this.timesheets[index] = updatedTimesheet;
          }
          completedCount++;
          
          if (completedCount + errorCount === timesheets.length) {
            this.filterTimesheets();
            if (errorCount === 0) {
              this.showSuccessToast(`Successfully approved ${completedCount} timesheet(s)`);
              window.location.reload();
            } else {
              this.showErrorToast(`Approved ${completedCount} timesheet(s), ${errorCount} failed`);
            }
          }
        },
        error: (error: any) => {
          console.error('Error approving timesheet:', error);
          errorCount++;
          
          if (completedCount + errorCount === timesheets.length) {
            this.filterTimesheets();
            if (completedCount === 0) {
              this.showErrorToast('Failed to approve any timesheets');
            } else {
              this.showErrorToast(`Approved ${completedCount} timesheet(s), ${errorCount} failed`);
            }
          }
        }
      });
    });
  }

  getSubmittedTimesheets(): Timesheet[] {
    return this.filteredTimesheets.filter((ts: any) => ts.status === 'submitted');
  }

  getPendingTimesheetsCount(): number {
    return this.getSubmittedTimesheets().length;
  }
}
