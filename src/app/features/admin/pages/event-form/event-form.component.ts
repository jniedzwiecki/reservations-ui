import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AdminEventService } from '../../services/admin-event.service';
import { EventService } from '../../../customer/services/event.service';
import { CreateEventRequest, UpdateEventRequest } from '../../../../shared/models';
import { EventStatus } from '../../../../shared/models/enums';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  eventId: string | null = null;

  eventStatuses = [
    { value: EventStatus.DRAFT, label: 'Draft' },
    { value: EventStatus.PUBLISHED, label: 'Published' },
    { value: EventStatus.CANCELLED, label: 'Cancelled' },
    { value: EventStatus.COMPLETED, label: 'Completed' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminEventService: AdminEventService,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      eventDateTime: ['', Validators.required],
      eventTime: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1), Validators.max(10000)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      status: [EventStatus.DRAFT, Validators.required]
    });
  }

  checkEditMode(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEventData();
    }
  }

  loadEventData(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        const eventDate = new Date(event.eventDateTime);
        const timeString = eventDate.toTimeString().substring(0, 5);

        this.eventForm.patchValue({
          name: event.name,
          description: event.description,
          eventDateTime: eventDate,
          eventTime: timeString,
          capacity: event.capacity,
          price: event.price,
          status: event.status
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load event data.';
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.eventForm.value;
    const eventDateTime = this.combineDateTime(formValue.eventDateTime, formValue.eventTime);

    if (this.isEditMode && this.eventId) {
      const updateData: UpdateEventRequest = {
        name: formValue.name,
        description: formValue.description,
        eventDateTime: eventDateTime,
        capacity: formValue.capacity,
        price: formValue.price
      };

      this.adminEventService.updateEvent(this.eventId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/admin/events']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Failed to update event.';
        }
      });
    } else {
      const createData: CreateEventRequest = {
        name: formValue.name,
        description: formValue.description,
        eventDateTime: eventDateTime,
        capacity: formValue.capacity,
        price: formValue.price,
        status: formValue.status
      };

      this.adminEventService.createEvent(createData).subscribe({
        next: () => {
          this.router.navigate(['/admin/events']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Failed to create event.';
        }
      });
    }
  }

  combineDateTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':');
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours, 10));
    combinedDate.setMinutes(parseInt(minutes, 10));
    combinedDate.setSeconds(0);
    combinedDate.setMilliseconds(0);
    return combinedDate.toISOString();
  }

  onCancel(): void {
    this.router.navigate(['/admin/events']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;

    return '';
  }
}
