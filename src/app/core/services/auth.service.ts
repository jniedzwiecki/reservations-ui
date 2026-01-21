import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  DecodedToken,
  User,
  UserRole
} from '../../shared/models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.storageService.getToken();
    if (!token) {
      return false;
    }

    try {
      const decoded = this.decodeToken(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.storageService.setToken(response.token);

    const decoded = this.decodeToken(response.token);
    const user: User = {
      id: '', // Will be populated from /users/me if needed
      email: decoded.sub,
      role: decoded.role as UserRole,
      isRemovable: true,
      createdAt: new Date().toISOString()
    };

    this.storageService.setUser(user);
    this.currentUserSubject.next(user);
  }

  private loadUserFromToken(): void {
    const token = this.storageService.getToken();
    const user = this.storageService.getUser();

    if (token && user && this.isAuthenticated()) {
      this.currentUserSubject.next(user);
    } else {
      this.storageService.clear();
    }
  }

  private decodeToken(token: string): DecodedToken {
    return jwtDecode<DecodedToken>(token);
  }
}
