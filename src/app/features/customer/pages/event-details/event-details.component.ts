import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { TicketService } from '../../services/ticket.service';
import { EventResponse } from '../../../../shared/models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: EventResponse | null = null;
  loading = true;
  reserving = false;
  errorMessage = '';
  alreadyReserved = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private ticketService: TicketService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(eventId);
      this.checkIfAlreadyReserved(eventId);
    } else {
      this.errorMessage = 'Invalid event ID';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadEventDetails(eventId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load event details. Please try again later.';
        this.cdr.detectChanges();
      }
    });
  }

  checkIfAlreadyReserved(eventId: string): void {
    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.alreadyReserved = tickets.some(ticket =>
          ticket.eventId === eventId && ticket.status === 'RESERVED'
        );
      },
      error: () => {
        // Ignore error, just assume not reserved
        this.alreadyReserved = false;
      }
    });
  }

  reserveTicket(): void {
    if (!this.event) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Reservation',
        message: `Are you sure you want to reserve a ticket for "${this.event.name}"? This will cost ${this.formatPrice(this.event.price)}.`,
        confirmText: 'Reserve',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.event) {
        this.performReservation(this.event.id);
      }
    });
  }

  performReservation(eventId: string): void {
    this.reserving = true;
    this.errorMessage = '';

    this.ticketService.reserveTicket(eventId).subscribe({
      next: (ticket) => {
        this.reserving = false;
        // Navigate to my tickets page
        this.router.navigate(['/customer/my-tickets']);
      },
      error: (error) => {
        this.reserving = false;
        this.errorMessage = error.message || 'Failed to reserve ticket. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/events']);
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

  getOccupancyPercentage(): number {
    if (!this.event) return 0;
    const sold = this.event.capacity - this.event.availableTickets;
    return (sold / this.event.capacity) * 100;
  }

  isReserveButtonDisabled(): boolean {
    if (!this.event) return true;
    return this.event.availableTickets === 0 || this.alreadyReserved || this.reserving;
  }

  getReserveButtonText(): string {
    if (this.reserving) return 'Reserving...';
    if (this.alreadyReserved) return 'Already Reserved';
    if (this.event && this.event.availableTickets === 0) return 'Sold Out';
    return 'Reserve Ticket';
  }
}
