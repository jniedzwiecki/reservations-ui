import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './shared/models';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // Home page
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Auth routes (no guard needed)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
  },

  // Customer routes (requires authentication + CUSTOMER role)
  {
    path: 'customer',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'events',
        loadComponent: () => import('./features/customer/pages/events-list/events-list.component').then(m => m.EventsListComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./features/customer/pages/event-details/event-details.component').then(m => m.EventDetailsComponent)
      },
      {
        path: 'my-tickets',
        loadComponent: () => import('./features/customer/pages/my-tickets/my-tickets.component').then(m => m.MyTicketsComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/customer/pages/ticket-details/ticket-details.component').then(m => m.TicketDetailsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },

  // Admin routes (requires authentication + ADMIN or POWER_USER role)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.POWER_USER] },
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/admin/pages/events-management/events-management.component').then(m => m.EventsManagementComponent)
      },
      {
        path: 'events/new',
        loadComponent: () => import('./features/admin/pages/event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'events/edit/:id',
        loadComponent: () => import('./features/admin/pages/event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'events/:id/sales',
        loadComponent: () => import('./features/admin/pages/event-sales/event-sales.component').then(m => m.EventSalesComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./features/admin/pages/users-management/users-management.component').then(m => m.UsersManagementComponent)
      },
      {
        path: 'users/create-power-user',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./features/admin/pages/create-power-user/create-power-user.component').then(m => m.CreatePowerUserComponent)
      },
      {
        path: 'venues',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./features/admin/pages/venues-management/venues-management.component').then(m => m.VenuesManagementComponent)
      },
      {
        path: 'venues/new',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./features/admin/pages/venue-form/venue-form.component').then(m => m.VenueFormComponent)
      },
      {
        path: 'venues/edit/:id',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./features/admin/pages/venue-form/venue-form.component').then(m => m.VenueFormComponent)
      },
      {
        path: 'venue-assignments',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./features/admin/pages/venue-assignments/venue-assignments.component').then(m => m.VenueAssignmentsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/home'
  }
];
