import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../customer/services/event.service';
import { AdminEventService } from '../../services/admin-event.service';
import { EventResponse } from '../../../../shared/models';
import { EventStatus } from '../../../../shared/models/enums';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-events-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './events-management.component.html',
  styleUrls: ['./events-management.component.scss']
})
export class EventsManagementComponent implements OnInit {
  events: EventResponse[] = [];
  filteredEvents: EventResponse[] = [];
  loading = true;
  errorMessage = '';
  selectedStatus = 'ALL';
  displayedColumns: string[] = ['name', 'venue', 'date', 'capacity', 'sold', 'available', 'status', 'actions'];

  // Expose EventStatus enum to template
  EventStatus = EventStatus;

  eventStatuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: EventStatus.DRAFT, label: 'Draft' },
    { value: EventStatus.PUBLISHED, label: 'Published' },
    { value: EventStatus.CANCELLED, label: 'Cancelled' },
    { value: EventStatus.COMPLETED, label: 'Completed' }
  ];

  constructor(
    private eventService: EventService,
    private adminEventService: AdminEventService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Loading events from API...', 'loading =', this.loading);

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        console.log('Events loaded successfully:', events);
        console.log('Setting loading to false');
        this.events = events;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Loading is now:', this.loading);
        console.log('Filtered events:', this.filteredEvents);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        console.log('Setting loading to false (error case)');
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load events.';
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Observable completed');
      }
    });
  }

  applyFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(event => event.status === this.selectedStatus);
    }
  }

  onStatusFilterChange(): void {
    this.applyFilter();
  }

  viewEventSales(eventId: string): void {
    this.router.navigate(['/admin/events', eventId, 'sales']);
  }

  editEvent(eventId: string): void {
    this.router.navigate(['/admin/events', eventId, 'edit']);
  }

  deleteEvent(event: EventResponse): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Event',
      message: `Are you sure you want to delete the event "${event.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminEventService.deleteEvent(event.id).subscribe({
          next: () => {
            this.loadEvents();
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to delete event.';
          }
        });
      }
    });
  }

  changeEventStatus(event: EventResponse, newStatus: EventStatus): void {
    const dialogData: ConfirmDialogData = {
      title: 'Change Event Status',
      message: `Are you sure you want to change the status of "${event.name}" to ${newStatus}?`,
      confirmText: 'Change Status',
      cancelText: 'Cancel',
      confirmColor: 'primary'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminEventService.updateEventStatus(event.id, newStatus).subscribe({
          next: () => {
            this.loadEvents();
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to update event status.';
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTicketsSold(event: EventResponse): number {
    return event.capacity - event.availableTickets;
  }
}
