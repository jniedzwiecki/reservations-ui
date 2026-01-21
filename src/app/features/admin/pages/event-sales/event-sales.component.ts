import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AdminEventService } from '../../services/admin-event.service';
import { EventService } from '../../../customer/services/event.service';
import { EventResponse, EventSalesResponse } from '../../../../shared/models';

@Component({
  selector: 'app-event-sales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './event-sales.component.html',
  styleUrls: ['./event-sales.component.scss']
})
export class EventSalesComponent implements OnInit {
  event: EventResponse | null = null;
  salesData: EventSalesResponse | null = null;
  loading = true;
  errorMessage = '';
  eventId: string | null = null;

  constructor(
    private adminEventService: AdminEventService,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEventSalesData();
    } else {
      this.errorMessage = 'Invalid event ID';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadEventSalesData(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.errorMessage = '';

    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loadSalesData();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load event data.';
        this.cdr.detectChanges();
      }
    });
  }

  loadSalesData(): void {
    if (!this.eventId) return;

    this.adminEventService.getEventSales(this.eventId).subscribe({
      next: (salesData) => {
        this.salesData = salesData;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load sales data.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/events']);
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

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}
