import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateEventRequest,
  UpdateEventRequest,
  EventResponse,
  EventSalesResponse
} from '../../../shared/models';
import { EventStatus } from '../../../shared/models/enums';

@Injectable({
  providedIn: 'root'
})
export class AdminEventService {
  private readonly API_URL = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  createEvent(data: CreateEventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(this.API_URL, data);
  }

  updateEvent(id: string, data: UpdateEventRequest): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.API_URL}/${id}`, data);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateEventStatus(id: string, status: EventStatus): Observable<EventResponse> {
    return this.http.patch<EventResponse>(`${this.API_URL}/${id}/status`, { status });
  }

  getEventSales(id: string): Observable<EventSalesResponse> {
    return this.http.get<EventSalesResponse>(`${this.API_URL}/${id}/sales`);
  }
}
