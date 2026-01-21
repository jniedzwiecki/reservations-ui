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
}

export interface ReserveTicketRequest {
  eventId: string;
}
