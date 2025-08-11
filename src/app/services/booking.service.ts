import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Booking, BookingRequest, BookingStatus, PaymentStatus, Invoice } from '../models/booking.model';
import { Room, SearchCriteria, RoomAvailability } from '../models/room.model';
import { RoomService } from './room.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private roomService: RoomService
  ) {}

  searchRooms(criteria: SearchCriteria): Observable<Room[]> {
    // Use the room service for API integration
    return this.roomService.searchRoomsWithCriteria(criteria);
  }

  createBooking(customerId: string, bookingData: BookingRequest): Observable<Booking> {
    const url = `${this.apiBaseUrl}/bookings`;
    
    const bookingPayload = {
      customerId,
      roomId: bookingData.roomId,
      checkInDate: bookingData.checkInDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      checkOutDate: bookingData.checkOutDate.toISOString().split('T')[0],
      guests: bookingData.guests,
      specialRequests: bookingData.specialRequests || ''
    };

    return this.http.post<Booking>(url, bookingPayload).pipe(
      catchError(error => {
        console.error('Error creating booking:', error);
        return throwError(() => error.error?.message || 'Failed to create booking');
      })
    );
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    const url = `${this.apiBaseUrl}/bookings/customer/${customerId}`;
    
    return this.http.get<Booking[]>(url).pipe(
      map(bookings => bookings.map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      }))),
      catchError(error => {
        console.error('Error fetching customer bookings:', error);
        return throwError(() => error.error?.message || 'Failed to fetch bookings');
      })
    );
  }

  getAllBookings(): Observable<Booking[]> {
    const url = `${this.apiBaseUrl}/bookings`;
    
    return this.http.get<Booking[]>(url).pipe(
      map(bookings => bookings.map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      }))),
      catchError(error => {
        console.error('Error fetching all bookings:', error);
        return throwError(() => error.error?.message || 'Failed to fetch bookings');
      })
    );
  }

  getBookingById(bookingId: string): Observable<Booking> {
    const url = `${this.apiBaseUrl}/bookings/${bookingId}`;
    
    return this.http.get<Booking>(url).pipe(
      map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      catchError(error => {
        console.error('Error fetching booking:', error);
        return throwError(() => error.error?.message || 'Failed to fetch booking');
      })
    );
  }

  updateBooking(bookingId: string, updates: Partial<Booking>): Observable<Booking> {
    const url = `${this.apiBaseUrl}/bookings/${bookingId}`;
    
    // Convert dates to ISO string format for API
    const updatePayload: any = { ...updates };
    if (updates.checkInDate) {
      updatePayload.checkInDate = updates.checkInDate.toISOString().split('T')[0];
    }
    if (updates.checkOutDate) {
      updatePayload.checkOutDate = updates.checkOutDate.toISOString().split('T')[0];
    }
    
    return this.http.put<Booking>(url, updatePayload).pipe(
      map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      catchError(error => {
        console.error('Error updating booking:', error);
        return throwError(() => error.error?.message || 'Failed to update booking');
      })
    );
  }

  cancelBooking(bookingId: string, reason: string): Observable<Booking> {
    const url = `${this.apiBaseUrl}/bookings/${bookingId}/cancel`;
    
    return this.http.put<Booking>(url, { cancellationReason: reason }).pipe(
      map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      catchError(error => {
        console.error('Error cancelling booking:', error);
        return throwError(() => error.error?.message || 'Failed to cancel booking');
      })
    );
  }

  generateInvoice(bookingId: string): Observable<Invoice> {
    const url = `${this.apiBaseUrl}/bookings/${bookingId}/invoice`;
    
    return this.http.get<Invoice>(url).pipe(
      map(invoice => ({
        ...invoice,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate)
      })),
      catchError(error => {
        console.error('Error generating invoice:', error);
        return throwError(() => error.error?.message || 'Failed to generate invoice');
      })
    );
  }

  // Additional methods for admin operations
  getBookingsByStatus(status: BookingStatus): Observable<Booking[]> {
    const url = `${this.apiBaseUrl}/bookings/status/${status}`;
    
    return this.http.get<Booking[]>(url).pipe(
      map(bookings => bookings.map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      }))),
      catchError(error => {
        console.error('Error fetching bookings by status:', error);
        return throwError(() => error.error?.message || 'Failed to fetch bookings');
      })
    );
  }

  getBookingsByDateRange(startDate: Date, endDate: Date): Observable<Booking[]> {
    const url = `${this.apiBaseUrl}/bookings/date-range`;
    const params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);
    
    return this.http.get<Booking[]>(url, { params }).pipe(
      map(bookings => bookings.map(booking => ({
        ...booking,
        checkInDate: new Date(booking.checkInDate),
        checkOutDate: new Date(booking.checkOutDate),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      }))),
      catchError(error => {
        console.error('Error fetching bookings by date range:', error);
        return throwError(() => error.error?.message || 'Failed to fetch bookings');
      })
    );
  }

  // Check room availability for specific dates
  checkRoomAvailability(roomId: string, checkInDate: Date, checkOutDate: Date): Observable<boolean> {
    const url = `${this.apiBaseUrl}/bookings/check-availability`;
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkInDate', checkInDate.toISOString().split('T')[0])
      .set('checkOutDate', checkOutDate.toISOString().split('T')[0]);
    
    return this.http.get<{ available: boolean }>(url, { params }).pipe(
      map(response => response.available),
      catchError(error => {
        console.error('Error checking room availability:', error);
        return throwError(() => error.error?.message || 'Failed to check availability');
      })
    );
  }
}