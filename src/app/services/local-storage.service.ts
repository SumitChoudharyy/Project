import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly BOOKINGS_KEY = 'hotel_bookings';
  private readonly USERS_KEY = 'hotel_users';

  constructor() {}

  // Booking methods
  saveBooking(booking: Booking): void {
    const bookings = this.getBookingsFromStorage();
    const existingIndex = bookings.findIndex(b => b.id === booking.id);
    
    if (existingIndex >= 0) {
      bookings[existingIndex] = booking;
    } else {
      bookings.push(booking);
    }
    
    this.saveBookingsToStorage(bookings);
  }

  getBookings(): Observable<Booking[]> {
    const bookings = this.getBookingsFromStorage();
    return of(bookings.map(booking => ({
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      paymentDate: booking.paymentDate ? new Date(booking.paymentDate) : undefined
    })));
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    const bookings = this.getBookingsFromStorage();
    const customerBookings = bookings.filter(b => b.customerId === customerId);
    
    return of(customerBookings.map(booking => ({
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      paymentDate: booking.paymentDate ? new Date(booking.paymentDate) : undefined
    })));
  }

  getBookingById(bookingId: string): Observable<Booking | null> {
    const bookings = this.getBookingsFromStorage();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return of(null);
    }
    
    return of({
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      paymentDate: booking.paymentDate ? new Date(booking.paymentDate) : undefined
    });
  }

  updateBooking(bookingId: string, updates: Partial<Booking>): Observable<Booking> {
    const bookings = this.getBookingsFromStorage();
    const index = bookings.findIndex(b => b.id === bookingId);
    
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    bookings[index] = {
      ...bookings[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveBookingsToStorage(bookings);
    return of(bookings[index]);
  }

  deleteBooking(bookingId: string): Observable<boolean> {
    const bookings = this.getBookingsFromStorage();
    const filteredBookings = bookings.filter(b => b.id !== bookingId);
    
    if (filteredBookings.length < bookings.length) {
      this.saveBookingsToStorage(filteredBookings);
      return of(true);
    }
    
    return of(false);
  }

  // User methods
  saveUser(user: any): void {
    const users = this.getUsersFromStorage();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.saveUsersToStorage(users);
  }

  getUserById(userId: string): any {
    const users = this.getUsersFromStorage();
    return users.find(u => u.id === userId) || null;
  }

  // Private helper methods
  private getBookingsFromStorage(): Booking[] {
    try {
      const stored = localStorage.getItem(this.BOOKINGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading bookings from localStorage:', error);
      return [];
    }
  }

  private saveBookingsToStorage(bookings: Booking[]): void {
    try {
      localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (error) {
      console.error('Error saving bookings to localStorage:', error);
    }
  }

  private getUsersFromStorage(): any[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  private saveUsersToStorage(users: any[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  // Generate unique ID
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
