import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { Booking, BookingStatus, PaymentStatus } from '../models/booking.model';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockBooking: Booking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
    
    // Clear localStorage before each test
    localStorage.clear();
    
    mockBooking = {
      id: 'test-booking-1',
      customerId: 'customer-1',
      roomId: 'room-1',
      checkInDate: new Date('2024-01-15'),
      checkOutDate: new Date('2024-01-17'),
      guests: 2,
      totalAmount: 200,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      specialRequests: 'Early check-in',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve a booking', (done) => {
    service.saveBooking(mockBooking);
    
    service.getBookingById(mockBooking.id).subscribe(booking => {
      expect(booking).toBeTruthy();
      expect(booking?.id).toBe(mockBooking.id);
      expect(booking?.customerId).toBe(mockBooking.customerId);
      done();
    });
  });

  it('should retrieve all bookings for a customer', (done) => {
    const booking2 = { ...mockBooking, id: 'test-booking-2', customerId: 'customer-1' };
    const booking3 = { ...mockBooking, id: 'test-booking-3', customerId: 'customer-2' };
    
    service.saveBooking(mockBooking);
    service.saveBooking(booking2);
    service.saveBooking(booking3);
    
    service.getBookingsByCustomer('customer-1').subscribe(bookings => {
      expect(bookings.length).toBe(2);
      expect(bookings.every(b => b.customerId === 'customer-1')).toBe(true);
      done();
    });
  });

  it('should generate unique IDs', () => {
    const id1 = service.generateId();
    const id2 = service.generateId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});
