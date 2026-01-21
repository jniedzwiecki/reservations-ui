import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  mobileMenuOpen = false;
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isCustomer(): boolean {
    return this.authService.hasRole(UserRole.CUSTOMER);
  }

  isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  isPowerUser(): boolean {
    return this.authService.hasRole(UserRole.POWER_USER);
  }

  isAdminOrPowerUser(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.POWER_USER]);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    if (this.isCustomer()) {
      this.router.navigate(['/customer/profile']);
    } else if (this.isAdminOrPowerUser()) {
      // Admin/Power User can also have a profile page if needed
      this.router.navigate(['/customer/profile']);
    }
  }
}
