import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VenueService } from '../../services/venue.service';
import { VenueResponse } from '../../../../shared/models/venue.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-venues-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './venues-management.component.html',
  styleUrls: ['./venues-management.component.scss']
})
export class VenuesManagementComponent implements OnInit {
  venues: VenueResponse[] = [];
  displayedColumns: string[] = ['name', 'address', 'capacity', 'createdAt', 'actions'];
  loading = false;

  constructor(
    private venueService: VenueService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    console.log('[VenuesManagement] Starting to load venues...');
    this.loading = true;
    console.log('[VenuesManagement] Loading state:', this.loading);

    this.venueService.getAllVenues().subscribe({
      next: (venues) => {
        console.log('[VenuesManagement] Venues received:', venues);
        this.venues = venues;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('[VenuesManagement] Loading state after success:', this.loading);
        console.log('[VenuesManagement] Venues array:', this.venues);
      },
      error: (error) => {
        console.error('[VenuesManagement] Error loading venues:', error);
        this.snackBar.open('Failed to load venues', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
        console.log('[VenuesManagement] Loading state after error:', this.loading);
      }
    });
  }

  editVenue(id: string): void {
    this.router.navigate(['/admin/venues/edit', id]);
  }

  deleteVenue(venue: VenueResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Venue',
        message: `Are you sure you want to delete venue "${venue.name}"? This action cannot be undone and will fail if there are events assigned to this venue.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.venueService.deleteVenue(venue.id).subscribe({
          next: () => {
            this.snackBar.open('Venue deleted successfully', 'Close', { duration: 3000 });
            this.loadVenues();
          },
          error: (error) => {
            console.error('Error deleting venue:', error);
            const errorMessage = error.error?.message || 'Failed to delete venue. It may have associated events.';
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  createVenue(): void {
    this.router.navigate(['/admin/venues/new']);
  }
}
