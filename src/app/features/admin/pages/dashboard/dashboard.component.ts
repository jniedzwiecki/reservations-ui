import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EventService } from '../../../customer/services/event.service';
import { AdminEventService } from '../../services/admin-event.service';
import { EventResponse, EventSalesResponse } from '../../../../shared/models';
import { forkJoin } from 'rxjs';

interface DashboardMetrics {
  totalEvents: number;
  totalRevenue: number;
  avgOccupancy: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics = {
    totalEvents: 0,
    totalRevenue: 0,
    avgOccupancy: 0
  };
  recentEvents: EventResponse[] = [];
  loading = true;
  errorMessage = '';
  displayedColumns: string[] = ['name', 'date', 'capacity', 'sold', 'status', 'actions'];

  constructor(
    private eventService: EventService,
    private adminEventService: AdminEventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.recentEvents = events.slice(0, 5);
        this.calculateMetrics(events);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load dashboard data.';
        this.cdr.detectChanges();
      }
    });
  }

  calculateMetrics(events: EventResponse[]): void {
    this.metrics.totalEvents = events.length;

    const salesRequests = events.map(event =>
      this.adminEventService.getEventSales(event.id)
    );

    if (salesRequests.length > 0) {
      forkJoin(salesRequests).subscribe({
        next: (salesData: EventSalesResponse[]) => {
          this.metrics.totalRevenue = salesData.reduce((sum, sales) => sum + sales.revenue, 0);
          const avgOccupancy = salesData.reduce((sum, sales) => sum + sales.occupancyRate, 0) / salesData.length;
          this.metrics.avgOccupancy = isNaN(avgOccupancy) ? 0 : avgOccupancy;
        },
        error: () => {
          this.metrics.totalRevenue = 0;
          this.metrics.avgOccupancy = 0;
        }
      });
    }
  }

  viewEventSales(eventId: string): void {
    this.router.navigate(['/admin/events', eventId, 'sales']);
  }

  editEvent(eventId: string): void {
    this.router.navigate(['/admin/events', eventId, 'edit']);
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

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getTicketsSold(event: EventResponse): number {
    return event.capacity - event.availableTickets;
  }
}
