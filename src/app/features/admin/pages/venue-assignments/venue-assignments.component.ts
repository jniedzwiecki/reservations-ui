import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { VenueService } from '../../services/venue.service';
import { UserResponse } from '../../../../shared/models/user.model';
import { VenueResponse } from '../../../../shared/models/venue.model';
import { UserRole } from '../../../../shared/models/enums';
import { AssignVenueDialogComponent } from './assign-venue-dialog/assign-venue-dialog.component';

@Component({
  selector: 'app-venue-assignments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './venue-assignments.component.html',
  styleUrls: ['./venue-assignments.component.scss']
})
export class VenueAssignmentsComponent implements OnInit {
  powerUsers: UserResponse[] = [];
  allVenues: VenueResponse[] = [];
  displayedColumns: string[] = ['email', 'assignedVenues', 'actions'];
  loading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private venueService: VenueService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Load users and venues in parallel
    Promise.all([
      this.userService.getAllUsers().toPromise(),
      this.venueService.getAllVenues().toPromise()
    ]).then(([users, venues]) => {
      // Filter only power users
      this.powerUsers = (users || []).filter(user => user.role === UserRole.POWER_USER);
      this.allVenues = venues || [];
      this.loading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading data:', error);
      this.errorMessage = 'Failed to load users and venues';
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  openAssignVenueDialog(user: UserResponse): void {
    const dialogRef = this.dialog.open(AssignVenueDialogComponent, {
      width: '600px',
      data: {
        user: user,
        allVenues: this.allVenues,
        assignedVenues: user.assignedVenues || []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  unassignVenue(user: UserResponse, venue: VenueResponse): void {
    this.venueService.unassignUserFromVenue({
      userId: user.id,
      venueId: venue.id
    }).subscribe({
      next: () => {
        this.snackBar.open(`Unassigned ${user.email} from ${venue.name}`, 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        console.error('Error unassigning venue:', error);
        this.snackBar.open('Failed to unassign venue', 'Close', { duration: 3000 });
      }
    });
  }

  getAssignedVenueNames(user: UserResponse): string {
    if (!user.assignedVenues || user.assignedVenues.length === 0) {
      return 'No venues assigned';
    }
    return user.assignedVenues.map(v => v.name).join(', ');
  }
}
