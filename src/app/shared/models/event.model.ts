import { EventStatus } from './enums';

export interface EventResponse {
  id: string;
  name: string;
  description: string;
  eventDateTime: string;
  capacity: number;
  price: number;
  status: string;
  availableTickets: number;
  createdAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  eventDateTime: string;
  capacity: number;
  price: number;
  status: EventStatus;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  eventDateTime?: string;
  capacity?: number;
  price?: number;
}

export interface UpdateEventStatusRequest {
  status: EventStatus;
}

export interface EventSalesResponse {
  eventId: string;
  eventName: string;
  capacity: number;
  ticketsSold: number;
  availableTickets: number;
  revenue: number;
  occupancyRate: number;
}
