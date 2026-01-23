export interface TicketResponse {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  eventId: string;
  eventName: string;
  eventDateTime: string;
  price: number;
  status: string;
  reservedAt: string;
  paymentExpiresAt?: string;
}

export interface ReserveTicketRequest {
  eventId: string;
}

export interface PaymentRequest {
  ticketId: string;
  paymentMethod: string;
  cardNumber: string;
  idempotencyKey: string;
}

export interface PaymentResponse {
  id: string;
  ticketId: string;
  userId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
