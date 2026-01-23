import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { TicketService } from '../../services/ticket.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { TicketResponse } from '../../../../shared/models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaymentDialogComponent } from '../../../../shared/components/payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss']
})
export class TicketDetailsComponent implements OnInit, OnDestroy {
  ticket: TicketResponse | null = null;
  loading = true;
  cancelling = false;
  errorMessage = '';
  timeRemaining = { minutes: 0, seconds: 0, expired: false };
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicketDetails(ticketId);
    } else {
      this.errorMessage = 'Invalid ticket ID';
      this.loading = false;
      this.cdr.detectChanges();
    }

    // Check if opened with pay action
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'pay' && this.ticket) {
        setTimeout(() => this.openPaymentDialog(), 500);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadTicketDetails(ticketId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.ticketService.getTicketById(ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.loading = false;
        if (this.isPendingPayment()) {
          this.startPaymentTimer();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load ticket details. Please try again later.';
        this.cdr.detectChanges();
      }
    });
  }

  openPaymentDialog(): void {
    if (!this.ticket || !this.isPendingPayment()) return;

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        ticketId: this.ticket.id,
        amount: this.ticket.price,
        eventName: this.ticket.eventName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Reload ticket to get updated status
        this.loadTicketDetails(this.ticket!.id);
      }
    });
  }

  private startPaymentTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Initial update
    this.updateTimeRemaining();

    // Update every second
    this.timerInterval = setInterval(() => {
      this.updateTimeRemaining();
      if (this.timeRemaining.expired) {
        clearInterval(this.timerInterval);
      }
      // Use markForCheck instead of detectChanges to avoid the error
      this.cdr.markForCheck();
    }, 1000);
  }

  private updateTimeRemaining(): void {
    if (!this.ticket) return;
    this.timeRemaining = this.paymentService.getTimeRemaining(this.ticket.paymentExpiresAt);
  }

  cancelTicket(): void {
    if (!this.ticket) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Ticket',
        message: `Are you sure you want to cancel your ticket for "${this.ticket.eventName}"? This action cannot be undone.`,
        confirmText: 'Cancel Ticket',
        cancelText: 'Keep Ticket',
        confirmColor: 'warn' as const
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.ticket) {
        this.performCancellation(this.ticket.id);
      }
    });
  }

  performCancellation(ticketId: string): void {
    this.cancelling = true;
    this.errorMessage = '';

    this.ticketService.cancelTicket(ticketId).subscribe({
      next: () => {
        this.cancelling = false;
        // Navigate back to my tickets
        this.router.navigate(['/customer/my-tickets']);
      },
      error: (error) => {
        this.cancelling = false;
        this.errorMessage = error.message || 'Failed to cancel ticket. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/my-tickets']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  canCancelTicket(): boolean {
    if (!this.ticket) return false;
    const eventDate = new Date(this.ticket.eventDateTime);
    const now = new Date();
    return ['RESERVED', 'PAID'].includes(this.ticket.status) && eventDate > now;
  }

  isEventPast(): boolean {
    if (!this.ticket) return false;
    const eventDate = new Date(this.ticket.eventDateTime);
    const now = new Date();
    return eventDate < now;
  }

  isPendingPayment(): boolean {
    return this.ticket?.status === 'PENDING_PAYMENT';
  }

  isPaymentExpired(): boolean {
    return this.isPendingPayment() && this.timeRemaining.expired;
  }
}
