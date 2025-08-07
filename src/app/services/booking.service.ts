import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Booking, BookingRequest, BookingStatus, PaymentStatus, Invoice } from '../models/booking.model';
import { Room, SearchCriteria, RoomAvailability } from '../models/room.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private mockData: MockDataService) {}

  searchRooms(criteria: SearchCriteria): Observable<Room[]> {
    let rooms = this.mockData.getRooms().filter(room => room.isActive);

    // Filter by room type
    if (criteria.roomType) {
      rooms = rooms.filter(room => room.type === criteria.roomType);
    }

    // Filter by max occupancy
    rooms = rooms.filter(room => room.maxOccupancy >= criteria.guests);

    // Filter by price range
    if (criteria.minPrice) {
      rooms = rooms.filter(room => room.pricePerNight >= criteria.minPrice!);
    }
    if (criteria.maxPrice) {
      rooms = rooms.filter(room => room.pricePerNight <= criteria.maxPrice!);
    }

    // Filter by amenities
    if (criteria.amenities && criteria.amenities.length > 0) {
      rooms = rooms.filter(room => 
        criteria.amenities!.every(amenity => room.amenities.includes(amenity))
      );
    }

    return of(rooms).pipe(delay(1000));
  }

  createBooking(customerId: string, bookingData: BookingRequest): Observable<Booking> {
    const bookings = this.mockData.getBookings();
    const rooms = this.mockData.getRooms();
    const room = rooms.find(r => r.id === bookingData.roomId);

    if (!room) {
      return throwError(() => 'Room not found').pipe(delay(500));
    }

    // Check availability (simplified)
    const conflictingBooking = bookings.find(b => 
      b.roomId === bookingData.roomId &&
      b.status !== BookingStatus.CANCELLED &&
      (
        (bookingData.checkInDate >= b.checkInDate && bookingData.checkInDate < b.checkOutDate) ||
        (bookingData.checkOutDate > b.checkInDate && bookingData.checkOutDate <= b.checkOutDate)
      )
    );

    if (conflictingBooking) {
      return throwError(() => 'Room not available for selected dates').pipe(delay(500));
    }

    const nights = Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.pricePerNight;

    const newBooking: Booking = {
      id: (bookings.length + 1).toString(),
      customerId,
      roomId: bookingData.roomId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      guests: bookingData.guests,
      totalAmount,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      specialRequests: bookingData.specialRequests,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockData.addBooking(newBooking);
    return of(newBooking).pipe(delay(1000));
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    const bookings = this.mockData.getBookings().filter(b => b.customerId === customerId);
    return of(bookings).pipe(delay(500));
  }

  updateBooking(bookingId: string, updates: Partial<Booking>): Observable<Booking> {
    const updatedBooking = this.mockData.updateBooking(bookingId, {
      ...updates,
      updatedAt: new Date()
    });

    if (updatedBooking) {
      return of(updatedBooking).pipe(delay(500));
    }
    return throwError(() => 'Booking not found').pipe(delay(500));
  }

  cancelBooking(bookingId: string, reason: string): Observable<Booking> {
    const bookings = this.mockData.getBookings();
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return throwError(() => 'Booking not found').pipe(delay(500));
    }

    // Calculate refund (simplified policy)
    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let refundPercentage = 0;
    if (daysUntilCheckIn >= 7) {
      refundPercentage = 1; // 100% refund
    } else if (daysUntilCheckIn >= 3) {
      refundPercentage = 0.5; // 50% refund
    }

    const refundAmount = booking.totalAmount * refundPercentage;

    const updatedBooking = this.mockData.updateBooking(bookingId, {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
      refundAmount,
      updatedAt: new Date()
    });

    if (updatedBooking) {
      return of(updatedBooking).pipe(delay(1000));
    }
    return throwError(() => 'Failed to cancel booking').pipe(delay(500));
  }

  generateInvoice(bookingId: string): Observable<Invoice> {
    const bookings = this.mockData.getBookings();
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return throwError(() => 'Booking not found').pipe(delay(500));
    }

    const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const rooms = this.mockData.getRooms();
    const room = rooms.find(r => r.id === booking.roomId);
    const roomName = room ? `${room.type.toUpperCase()} - Room ${room.roomNumber}` : 'Room';

    const subtotal = booking.totalAmount;
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + tax;

    const invoice: Invoice = {
      id: `INV-${booking.id}`,
      bookingId: booking.id,
      amount: subtotal,
      tax,
      totalAmount,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      items: [
        {
          description: `${roomName} (${nights} nights)`,
          quantity: nights,
          rate: room?.pricePerNight || 0,
          amount: subtotal
        }
      ]
    };

    return of(invoice).pipe(delay(1000));
  }
}