import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TicketResponse, ReserveTicketRequest } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly API_URL = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  reserveTicket(eventId: string): Observable<TicketResponse> {
    const request: ReserveTicketRequest = { eventId };
    return this.http.post<TicketResponse>(`${this.API_URL}/reserve`, request);
  }

  getMyTickets(): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(`${this.API_URL}/my-tickets`);
  }

  getTicketById(id: string): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.API_URL}/${id}`);
  }

  cancelTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
