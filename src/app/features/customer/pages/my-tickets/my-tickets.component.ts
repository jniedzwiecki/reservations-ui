import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TicketService } from '../../services/ticket.service';
import { TicketResponse } from '../../../../shared/models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.scss']
})
export class MyTicketsComponent implements OnInit {
  allTickets: TicketResponse[] = [];
  upcomingTickets: TicketResponse[] = [];
  pastTickets: TicketResponse[] = [];
  loading = true;
  errorMessage = '';
  cancellingTicketId: string | null = null;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.allTickets = tickets;
        this.filterTickets();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load tickets. Please try again later.';
        this.cdr.detectChanges();
      }
    });
  }

  filterTickets(): void {
    const now = new Date();

    this.upcomingTickets = this.allTickets.filter(ticket => {
      const eventDate = new Date(ticket.eventDateTime);
      return eventDate >= now && ['PENDING_PAYMENT', 'PAID', 'RESERVED'].includes(ticket.status);
    }).sort((a, b) =>
      new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime()
    );

    this.pastTickets = this.allTickets.filter(ticket => {
      const eventDate = new Date(ticket.eventDateTime);
      return eventDate < now || ['CANCELLED', 'PAYMENT_FAILED'].includes(ticket.status);
    }).sort((a, b) =>
      new Date(b.eventDateTime).getTime() - new Date(a.eventDateTime).getTime()
    );
  }

  viewTicketDetails(ticketId: string): void {
    this.router.navigate(['/customer/tickets', ticketId]);
  }

  cancelTicket(ticket: TicketResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Ticket',
        message: `Are you sure you want to cancel your ticket for "${ticket.eventName}"? This action cannot be undone.`,
        confirmText: 'Cancel Ticket',
        cancelText: 'Keep Ticket',
        confirmColor: 'warn' as const
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performCancellation(ticket.id);
      }
    });
  }

  performCancellation(ticketId: string): void {
    this.cancellingTicketId = ticketId;
    this.errorMessage = '';

    this.ticketService.cancelTicket(ticketId).subscribe({
      next: () => {
        this.cancellingTicketId = null;
        // Reload tickets to get updated list
        this.loadTickets();
      },
      error: (error) => {
        this.cancellingTicketId = null;
        this.errorMessage = error.message || 'Failed to cancel ticket. Please try again.';
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PAID':
      case 'RESERVED':
        return 'primary';
      case 'PENDING_PAYMENT':
        return 'accent';
      case 'PAYMENT_FAILED':
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }

  payForTicket(ticket: TicketResponse): void {
    this.router.navigate(['/customer/tickets', ticket.id], {
      queryParams: { action: 'pay' }
    });
  }

  isPendingPayment(ticket: TicketResponse): boolean {
    return ticket.status === 'PENDING_PAYMENT';
  }

  isPaymentExpired(ticket: TicketResponse): boolean {
    if (!ticket.paymentExpiresAt) {
      return false;
    }
    return new Date(ticket.paymentExpiresAt) < new Date();
  }

  isCancelling(ticketId: string): boolean {
    return this.cancellingTicketId === ticketId;
  }

  canCancelTicket(ticket: TicketResponse): boolean {
    const eventDate = new Date(ticket.eventDateTime);
    const now = new Date();
    return ['RESERVED', 'PAID'].includes(ticket.status) && eventDate > now;
  }
}
