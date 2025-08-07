import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { User, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private mockData: MockDataService) {}

  login(credentials: LoginRequest): Observable<{ user: User; token: string }> {
    const users = this.mockData.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      return throwError(() => 'Invalid email or password').pipe(delay(1000));
    }

    if (user.isLocked) {
      return throwError(() => 'Account is locked due to multiple failed attempts').pipe(delay(1000));
    }

    // Simulate password validation (in real app, compare hashed passwords)
    if (credentials.password !== 'password123') {
      // Increment login attempts
      const updatedUser = this.mockData.updateUser(user.id, {
        loginAttempts: user.loginAttempts + 1,
        isLocked: user.loginAttempts >= 2 // Lock after 3 attempts (0, 1, 2)
      });
      
      if (updatedUser && updatedUser.isLocked) {
        return throwError(() => 'Account locked due to multiple failed attempts').pipe(delay(1000));
      }
      
      return throwError(() => 'Invalid email or password').pipe(delay(1000));
    }

    // Reset login attempts on successful login
    const updatedUser = this.mockData.updateUser(user.id, {
      loginAttempts: 0,
      lastLogin: new Date()
    });

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const userWithToken = { ...(updatedUser || user), token };
    
    return of({ 
      user: userWithToken, 
      token 
    }).pipe(delay(1000));
  }

  register(userData: RegisterRequest): Observable<User> {
    const users = this.mockData.getUsers();
    const existingUser = users.find(u => u.email === userData.email);

    if (existingUser) {
      return throwError(() => 'Email already exists').pipe(delay(1000));
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      role: UserRole.CUSTOMER,
      isActive: true,
      createdAt: new Date(),
      loginAttempts: 0,
      isLocked: false
    };

    this.mockData.addUser(newUser);
    return of(newUser).pipe(delay(1000));
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