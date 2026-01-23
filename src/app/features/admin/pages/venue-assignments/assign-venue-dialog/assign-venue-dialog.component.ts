import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VenueService } from '../../../services/venue.service';
import { UserResponse } from '../../../../../shared/models/user.model';
import { VenueResponse } from '../../../../../shared/models/venue.model';
import { forkJoin, Observable, of } from 'rxjs';

export interface AssignVenueDialogData {
  user: UserResponse;
  allVenues: VenueResponse[];
  assignedVenues: VenueResponse[];
}

@Component({
  selector: 'app-assign-venue-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './assign-venue-dialog.component.html',
  styleUrls: ['./assign-venue-dialog.component.scss']
})
export class AssignVenueDialogComponent implements OnInit {
  venueForm: FormGroup;
  loading = false;
  venues: VenueResponse[];
  assignedVenueIds: Set<string>;

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AssignVenueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignVenueDialogData
  ) {
    this.venues = data.allVenues;
    this.assignedVenueIds = new Set(data.assignedVenues.map(v => v.id));

    // Create a form control for each venue
    const venueControls: { [key: string]: boolean } = {};
    this.venues.forEach(venue => {
      venueControls[venue.id] = this.assignedVenueIds.has(venue.id);
    });

    this.venueForm = this.fb.group(venueControls);
  }

  ngOnInit(): void {}

  onSave(): void {
    this.loading = true;
    const formValue = this.venueForm.value;

    // Determine which venues to assign and which to unassign
    const toAssign: string[] = [];
    const toUnassign: string[] = [];

    Object.keys(formValue).forEach(venueId => {
      const isChecked = formValue[venueId];
      const wasAssigned = this.assignedVenueIds.has(venueId);

      if (isChecked && !wasAssigned) {
        toAssign.push(venueId);
      } else if (!isChecked && wasAssigned) {
        toUnassign.push(venueId);
      }
    });

    // Create observables for all assignment/unassignment operations
    const operations: Observable<any>[] = [];

    toAssign.forEach(venueId => {
      operations.push(
        this.venueService.assignUserToVenue({
          userId: this.data.user.id,
          venueId: venueId
        })
      );
    });

    toUnassign.forEach(venueId => {
      operations.push(
        this.venueService.unassignUserFromVenue({
          userId: this.data.user.id,
          venueId: venueId
        })
      );
    });

    // If no changes, just close
    if (operations.length === 0) {
      this.snackBar.open('No changes made', 'Close', { duration: 2000 });
      this.dialogRef.close(false);
      return;
    }

    // Execute all operations in parallel
    forkJoin(operations).subscribe({
      next: () => {
        this.snackBar.open('Venue assignments updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error updating venue assignments:', error);
        this.snackBar.open('Failed to update venue assignments', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  isVenueChecked(venueId: string): boolean {
    return this.venueForm.get(venueId)?.value || false;
  }
}
