import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './pages/auth.guard';
import { TempGuard } from './pages/temp.guard';
import { AdminGuard } from './pages/admin.guard';

const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },
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
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'temp-dashboard',
    loadChildren: () => import('./pages/temp-dashboard/temp-dashboard.module').then( m => m.TempDashboardPageModule),
    canActivate: [TempGuard],
  },
  {
    path: 'jobs',
    loadChildren: () => import('./pages/jobs/jobs.module').then( m => m.JobsPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'timesheets',
    loadChildren: () => import('./pages/timesheets/timesheets.module').then( m => m.TimesheetsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'clients',
    loadChildren: () => import('./pages/clients/clients.module').then( m => m.ClientsPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'invoices',
    loadChildren: () => import('./pages/invoices/invoices.module').then( m => m.InvoicesPageModule),
    canActivate: [AdminGuard],
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
    loadChildren: () => import('./pages/shifts/shifts.module').then( m => m.ShiftsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'temps',
    loadChildren: () => import('./pages/temps/temps.module').then( m => m.TempsPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'client-form',
    loadChildren: () => import('./pages/client-form/client-form.module').then( m => m.ClientFormPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'job-form',
    loadChildren: () => import('./pages/job-form/job-form.module').then( m => m.JobFormPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'temp-form',
    loadChildren: () => import('./pages/temp-form/temp-form.module').then( m => m.TempFormPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'shift-form',
    loadChildren: () => import('./pages/shift-form/shift-form.module').then( m => m.ShiftFormPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'timesheet-form',
    loadChildren: () => import('./pages/timesheet-form/timesheet-form.module').then( m => m.TimesheetFormPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'client-detail',
    loadChildren: () => import('./pages/client-detail/client-detail.module').then( m => m.ClientDetailPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'job-detail',
    loadChildren: () => import('./pages/job-detail/job-detail.module').then( m => m.JobDetailPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'temp-detail',
    loadChildren: () => import('./pages/temp-detail/temp-detail.module').then( m => m.TempDetailPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'shift-detail/:id',
    loadChildren: () => import('./pages/shift-detail/shift-detail.module').then( m => m.ShiftDetailPageModule),
    canActivate: [AuthGuard],
  },
  //  {
  //   path: 'shift-detail',
  //   loadChildren: () => import('./pages/shift-detail/shift-detail.module').then( m => m.ShiftDetailPageModule)
  // },
  {
    path: 'timesheet-detail/:id',
    loadChildren: () => import('./pages/timesheet-detail/timesheet-detail.module').then( m => m.TimesheetDetailPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'invoice-form',
    loadChildren: () => import('./pages/invoice-form/invoice-form.module').then( m => m.InvoiceFormPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'reports',
    loadChildren: () => import('./pages/reports/reports.module').then( m => m.ReportsPageModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'templogin',
    loadChildren: () => import('./pages/templogin/templogin.module').then( m => m.TemploginPageModule),
  },
  {
    path: 'tempregister',
    loadChildren: () => import('./pages/tempregister/tempregister.module').then( m => m.TempregisterPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
