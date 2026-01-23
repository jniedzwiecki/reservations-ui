import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  VenueResponse,
  CreateVenueRequest,
  UpdateVenueRequest,
  AssignVenueRequest
} from '../../../shared/models/venue.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private apiUrl = `${environment.apiUrl}/venues`;

  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<VenueResponse[]> {
    return this.http.get<VenueResponse[]>(this.apiUrl);
  }

  getVenueById(id: string): Observable<VenueResponse> {
    return this.http.get<VenueResponse>(`${this.apiUrl}/${id}`);
  }

  createVenue(request: CreateVenueRequest): Observable<VenueResponse> {
    return this.http.post<VenueResponse>(this.apiUrl, request);
  }

  updateVenue(id: string, request: UpdateVenueRequest): Observable<VenueResponse> {
    return this.http.put<VenueResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteVenue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignUserToVenue(request: AssignVenueRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assignments`, request);
  }

  unassignUserFromVenue(request: AssignVenueRequest): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}/assignments`, { body: request });
  }
}
