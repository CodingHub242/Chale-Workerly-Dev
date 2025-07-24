import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'jobs',
    loadChildren: () => import('./pages/jobs/jobs.module').then( m => m.JobsPageModule)
  },
  {
    path: 'timesheets',
    loadChildren: () => import('./pages/timesheets/timesheets.module').then( m => m.TimesheetsPageModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./pages/clients/clients.module').then( m => m.ClientsPageModule)
  },
  {
    path: 'invoices',
    loadChildren: () => import('./pages/invoices/invoices.module').then( m => m.InvoicesPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'shifts',
    loadChildren: () => import('./pages/shifts/shifts.module').then( m => m.ShiftsPageModule)
  },
  {
    path: 'temps',
    loadChildren: () => import('./pages/temps/temps.module').then( m => m.TempsPageModule)
  },
  {
    path: 'client-form',
    loadChildren: () => import('./pages/client-form/client-form.module').then( m => m.ClientFormPageModule)
  },
  {
    path: 'job-form',
    loadChildren: () => import('./pages/job-form/job-form.module').then( m => m.JobFormPageModule)
  },
  {
    path: 'temp-form',
    loadChildren: () => import('./pages/temp-form/temp-form.module').then( m => m.TempFormPageModule)
  },
  {
    path: 'shift-form',
    loadChildren: () => import('./pages/shift-form/shift-form.module').then( m => m.ShiftFormPageModule)
  },
  {
    path: 'timesheet-form',
    loadChildren: () => import('./pages/timesheet-form/timesheet-form.module').then( m => m.TimesheetFormPageModule)
  },
  {
    path: 'client-detail',
    loadChildren: () => import('./pages/client-detail/client-detail.module').then( m => m.ClientDetailPageModule)
  },
  {
    path: 'job-detail',
    loadChildren: () => import('./pages/job-detail/job-detail.module').then( m => m.JobDetailPageModule)
  },
  {
    path: 'temp-detail',
    loadChildren: () => import('./pages/temp-detail/temp-detail.module').then( m => m.TempDetailPageModule)
  },
  {
    path: 'shift-detail',
    loadChildren: () => import('./pages/shift-detail/shift-detail.module').then( m => m.ShiftDetailPageModule)
  },
  {
    path: 'timesheet-detail',
    loadChildren: () => import('./pages/timesheet-detail/timesheet-detail.module').then( m => m.TimesheetDetailPageModule)
  },
  {
    path: 'invoice-form',
    loadChildren: () => import('./pages/invoice-form/invoice-form.module').then( m => m.InvoiceFormPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
