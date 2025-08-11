import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  constructor(
    private mockData: MockDataService,
    private http: HttpClient
  ) {}

  login(credentials: LoginRequest): Observable<{ user: User; token: string }> {
    return this.http.post<{ 
      status: string; 
      message: string; 
      role: string; 
      userId?: string; 
      name?: string; 
      email?: string; 
      phone?: string; 
      address?: string 
    }>(`${this.apiBaseUrl}/login`, credentials).pipe(
      map((response) => {
        const roleFromResponse = (response?.role as UserRole) || 'none';
        const allowedRoles: UserRole[] = [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.STAFF];

        if (!allowedRoles.includes(roleFromResponse as UserRole)) {
          const message = response?.message || 'Invalid credentials';
          throw new Error(message);
        }

        let firstName = '';
        let lastName = '';
        let email = '';
        let phoneNumber = '';
        let address = { street: '', city: '', state: '', zipCode: '', country: '' };

        // Handle different response types based on user role
        if (roleFromResponse === UserRole.CUSTOMER) {
          // Customer users have full profile information
          if (response.name) {
            const nameParts = response.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          if (response.address) {
            const addressParts = response.address.split(',').map(part => part.trim());
            address = {
              street: addressParts[0] || '',
              city: addressParts[1] || '',
              state: addressParts[2] || '',
              zipCode: addressParts[3] || '',
              country: ''
            };
          }
          
          email = response.email || '';
          phoneNumber = response.phone || '';
        } else {
          // Admin and Staff users - use default values or generate from role
          firstName = roleFromResponse === UserRole.ADMIN ? 'Admin' : 'Staff';
          lastName = 'User';
          email = `${roleFromResponse}@hotel.com`;
          phoneNumber = '';
          address = { street: '', city: '', state: '', zipCode: '', country: '' };
        }

        const user: User = {
          id: response.userId || `user-${Date.now()}`,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          address: address,
          role: roleFromResponse as UserRole,
          isActive: true,
          createdAt: new Date(),
          loginAttempts: 0,
          isLocked: false,
          token: 'token-' + Math.random().toString(36).substring(2, 9) // Generate a token since API doesn't provide one
        };
        return { user, token: user.token! };
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    // Map frontend form model to backend API payload shape
    const address = `${userData.address.street}, ${userData.address.city}, ${userData.address.state} ${userData.address.zipCode}`;
    const payload = {
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      phone: userData.phoneNumber,
      address
    };

    return this.http.post<any>(`${this.apiBaseUrl}/register`, payload).pipe(
      // The backend response shape is unknown; construct a minimal User for store
      map((response: any) => {
        const idFromResponse = response?.id ?? response?.userId ?? response?.data?.id;
        const roleFromResponse: UserRole =
          (response?.role as UserRole) || (response?.data?.role as UserRole) || UserRole.CUSTOMER;

        const createdAt: Date = response?.createdAt ? new Date(response.createdAt) : new Date();

        const user: User = {
          id: idFromResponse ? String(idFromResponse) : Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          role: roleFromResponse,
          isActive: true,
          createdAt,
          loginAttempts: 0,
          isLocked: false
        };
        return user;
      })
    );
  }

  updateProfile(userId: string, userData: Partial<User>): Observable<User> {
    const updatedUser = this.mockData.updateUser(userId, userData);
    if (updatedUser) {
      return of(updatedUser).pipe(delay(500));
    }
    return throwError(() => 'User not found').pipe(delay(500));
  }

  logout(): Observable<void> {
    return of(void 0);
  }
}