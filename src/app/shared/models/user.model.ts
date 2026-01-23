import { UserRole } from './enums';
import { VenueResponse } from './venue.model';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isRemovable: boolean;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  isRemovable: boolean;
  assignedVenues?: VenueResponse[];
  createdAt: string;
}

export interface CreatePowerUserRequest {
  email: string;
  password: string;
}
