import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentRequest, PaymentResponse } from '../../shared/models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Remove the /api suffix from environment.apiUrl, change port to 8081, then add /api/payments
  private readonly paymentApiUrl = `${environment.apiUrl.replace('/api', '').replace('8080', '8081')}/api/payments`;

  constructor(private http: HttpClient) {}

  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.paymentApiUrl, request);
  }

  getPayment(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.paymentApiUrl}/${paymentId}`);
  }

  getPaymentByTicket(ticketId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.paymentApiUrl}/ticket/${ticketId}`);
  }

  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  getTimeRemaining(expiresAt: string | undefined): {
    minutes: number;
    seconds: number;
    expired: boolean;
  } {
    if (!expiresAt) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    // Parse the timestamp and ensure it's treated as UTC if no timezone is specified
    let expiryDate: Date;
    const hasTimezone = expiresAt.includes('Z') || expiresAt.includes('+') || /\d{2}:\d{2}:\d{2}[+-]\d{2}/.test(expiresAt);

    if (hasTimezone) {
      // Already has timezone info
      expiryDate = new Date(expiresAt);
    } else {
      // No timezone info - append 'Z' to treat as UTC
      expiryDate = new Date(expiresAt + 'Z');
    }

    const now = new Date();
    const nowTime = now.getTime();
    const expiry = expiryDate.getTime();
    const diff = expiry - nowTime;

    if (diff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return { minutes, seconds, expired: false };
  }
}
