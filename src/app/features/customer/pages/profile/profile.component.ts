import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { User } from '../../../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  totalTickets = 0;
  loadingStats = true;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loadingStats = true;

    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.totalTickets = tickets.filter(t => t.status === 'RESERVED').length;
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
        this.totalTickets = 0;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewMyTickets(): void {
    this.router.navigate(['/customer/my-tickets']);
  }

  logout(): void {
    this.authService.logout();
  }
}
