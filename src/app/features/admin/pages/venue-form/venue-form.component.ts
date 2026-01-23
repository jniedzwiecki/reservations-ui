import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VenueService } from '../../services/venue.service';
import { CreateVenueRequest, UpdateVenueRequest } from '../../../../shared/models/venue.model';

@Component({
  selector: 'app-venue-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './venue-form.component.html',
  styleUrls: ['./venue-form.component.scss']
})
export class VenueFormComponent implements OnInit {
  venueForm: FormGroup;
  isEditMode = false;
  venueId: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.venueForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      description: ['', [Validators.maxLength(1000)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(100000)]]
    });
  }

  ngOnInit(): void {
    this.venueId = this.route.snapshot.paramMap.get('id');
    if (this.venueId) {
      this.isEditMode = true;
      this.loadVenue();
    }
  }

  loadVenue(): void {
    if (!this.venueId) return;

    this.loading = true;
    this.venueService.getVenueById(this.venueId).subscribe({
      next: (venue) => {
        this.venueForm.patchValue({
          name: venue.name,
          address: venue.address,
          description: venue.description || '',
          capacity: venue.capacity
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading venue:', error);
        this.snackBar.open('Failed to load venue', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/admin/venues']);
      }
    });
  }

  onSubmit(): void {
    if (this.venueForm.invalid) {
      Object.keys(this.venueForm.controls).forEach(key => {
        this.venueForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.venueId) {
      const updateRequest: UpdateVenueRequest = this.venueForm.value;
      this.venueService.updateVenue(this.venueId, updateRequest).subscribe({
        next: () => {
          this.snackBar.open('Venue updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/venues']);
        },
        error: (error) => {
          console.error('Error updating venue:', error);
          const errorMessage = error.error?.message || 'Failed to update venue';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      const createRequest: CreateVenueRequest = this.venueForm.value;
      this.venueService.createVenue(createRequest).subscribe({
        next: () => {
          this.snackBar.open('Venue created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/venues']);
        },
        error: (error) => {
          console.error('Error creating venue:', error);
          const errorMessage = error.error?.message || 'Failed to create venue';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/venues']);
  }

  hasError(field: string, error: string): boolean {
    const control = this.venueForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.venueForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${this.getFieldLabel(field)} must be at least ${minLength} characters`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `${this.getFieldLabel(field)} must not exceed ${maxLength} characters`;
    }
    if (control.hasError('min')) {
      const min = control.getError('min').min;
      return `${this.getFieldLabel(field)} must be at least ${min}`;
    }
    if (control.hasError('max')) {
      const max = control.getError('max').max;
      return `${this.getFieldLabel(field)} must not exceed ${max}`;
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Venue name',
      address: 'Address',
      description: 'Description',
      capacity: 'Capacity'
    };
    return labels[field] || field;
  }
}
