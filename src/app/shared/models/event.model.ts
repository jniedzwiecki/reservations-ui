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
  venueId: string;
  venueName: string;
  externalId?: string;
  createdAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  eventDateTime: string;
  capacity: number;
  price: number;
  status: EventStatus;
  venueId: string;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  eventDateTime?: string;
  capacity?: number;
  price?: number;
  venueId?: string;
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
