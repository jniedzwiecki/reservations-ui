import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentMethod } from '../../models/enums';
import { PaymentRequest } from '../../models/ticket.model';

export interface PaymentDialogData {
  ticketId: string;
  amount: number;
  eventName: string;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  paymentForm: FormGroup;
  processing = false;
  errorMessage = '';
  PaymentMethod = PaymentMethod;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: [PaymentMethod.CREDIT_CARD, Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.processing = true;
    this.errorMessage = '';

    const request: PaymentRequest = {
      ticketId: this.data.ticketId,
      paymentMethod: this.paymentForm.value.paymentMethod,
      cardNumber: this.paymentForm.value.cardNumber,
      idempotencyKey: this.paymentService.generateIdempotencyKey()
    };

    this.paymentService.processPayment(request).subscribe({
      next: (response) => {
        console.log('Payment response received:', response);
        this.processing = false;
        if (response.status === 'COMPLETED') {
          this.dialogRef.close({ success: true, payment: response });
        } else {
          this.errorMessage = response.failureReason || 'Payment failed. Please try again.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.processing = false;
        // Extract error message from HttpErrorResponse
        this.errorMessage = error.error?.message || error.message || 'Payment failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  useTestCard(success: boolean): void {
    const testCard = success ? '4111111111111111' : '4000000000000002';
    this.paymentForm.patchValue({ cardNumber: testCard });
  }
}
