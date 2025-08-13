import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Booking, BookingRequest, BookingStatus, PaymentStatus, Invoice } from '../models/booking.model';
import { Room, SearchCriteria, RoomAvailability } from '../models/room.model';
import { RoomService } from './room.service';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private roomService: RoomService,
    private localStorageService: LocalStorageService
  ) {}

  searchRooms(criteria: SearchCriteria): Observable<Room[]> {
    // Use the room service for API integration
    return this.roomService.searchRoomsWithCriteria(criteria);
  }

  createBooking(customerId: string, bookingData: BookingRequest): Observable<Booking> {
    // Try API first, fallback to local storage
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
        console.log('API failed, using local storage for booking');
        // Create booking in local storage
        const newBooking: Booking = {
          id: this.localStorageService.generateId(),
          customerId,
          roomId: bookingData.roomId,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          guests: bookingData.guests,
          totalAmount: 0, // Will be calculated based on room price
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          specialRequests: bookingData.specialRequests,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.localStorageService.saveBooking(newBooking);
        return of(newBooking);
      })
    );
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    // Try API first, fallback to local storage
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
        console.log('API failed, using local storage for customer bookings');
        return this.localStorageService.getBookingsByCustomer(customerId);
      })
    );
  }

  getAllBookings(): Observable<Booking[]> {
    // Try API first, fallback to local storage
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
        console.log('API failed, using local storage for all bookings');
        return this.localStorageService.getBookings();
      })
    );
  }

  getBookingById(bookingId: string): Observable<Booking> {
    // Try API first, fallback to local storage
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
        console.log('API failed, using local storage for booking');
        return this.localStorageService.getBookingById(bookingId).pipe(
          map(booking => {
            if (!booking) {
              throw new Error('Booking not found');
            }
            return booking;
          })
        );
      })
    );
  }

  updateBooking(bookingId: string, updates: Partial<Booking>): Observable<Booking> {
    // Try API first, fallback to local storage
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
        console.log('API failed, using local storage for updating booking');
        return this.localStorageService.updateBooking(bookingId, updates);
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
        console.log('API failed, using local storage for room availability');
        // For local storage, we'll assume room is available
        return of(true);
      })
    );
  }

  // Process payment and update booking
  processPayment(bookingId: string, amount: number, transactionId: string): Observable<Booking> {
    const updates = {
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      totalAmount: amount,
      paymentTransactionId: transactionId,
      paymentDate: new Date()
    };

    return this.updateBooking(bookingId, updates);
  }
}