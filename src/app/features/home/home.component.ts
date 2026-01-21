import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../shared/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  navigateToEvents(): void {
    console.log('navigateToEvents called, isAuthenticated:', this.isAuthenticated);
    if (this.isAuthenticated) {
      const user = this.authService.getCurrentUser();
      console.log('Current user:', user);
      if (user?.role === UserRole.CUSTOMER) {
        console.log('Navigating to /customer/events');
        this.router.navigate(['/customer/events']);
      } else if (user?.role === UserRole.ADMIN || user?.role === UserRole.POWER_USER) {
        console.log('Navigating to /admin/events');
        this.router.navigate(['/admin/events']);
      }
    } else {
      console.log('Not authenticated, navigating to login');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/customer/events' } });
    }
  }

  navigateToMyTickets(): void {
    console.log('navigateToMyTickets called, isAuthenticated:', this.isAuthenticated);
    if (this.isAuthenticated) {
      console.log('Navigating to /customer/my-tickets');
      this.router.navigate(['/customer/my-tickets']);
    } else {
      console.log('Not authenticated, navigating to login');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/customer/my-tickets' } });
    }
  }
}
