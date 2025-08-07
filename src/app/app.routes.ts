import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/customer/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.CUSTOMER] }
  },
  {
    path: 'search',
    loadComponent: () => import('./features/booking/search-rooms/search-rooms.component').then(m => m.SearchRoomsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bookings',
    loadComponent: () => import('./features/booking/booking-history/booking-history.component').then(m => m.BookingHistoryComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.CUSTOMER] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'complaints',
    loadComponent: () => import('./features/customer/complaints/complaints.component').then(m => m.ComplaintsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.CUSTOMER] }
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'admin/rooms',
    loadComponent: () => import('./features/admin/manage-rooms/manage-rooms.component').then(m => m.ManageRoomsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'admin/reservations',
    loadComponent: () => import('./features/admin/manage-reservations/manage-reservations.component').then(m => m.ManageReservationsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'admin/customers',
    loadComponent: () => import('./features/admin/manage-customers/manage-customers.component').then(m => m.ManageCustomersComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];