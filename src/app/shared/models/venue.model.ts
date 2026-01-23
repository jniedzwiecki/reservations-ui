export interface VenueResponse {
  id: string;
  name: string;
  address: string;
  description?: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  description?: string;
  capacity: number;
}

export interface UpdateVenueRequest {
  name?: string;
  address?: string;
  description?: string;
  capacity?: number;
}

export interface AssignVenueRequest {
  userId: string;
  venueId: string;
}
