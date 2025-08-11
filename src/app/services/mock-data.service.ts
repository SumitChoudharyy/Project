import { Injectable } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { Room, RoomType } from '../models/room.model';
import { Booking, BookingStatus, PaymentStatus } from '../models/booking.model';
import { Complaint, ComplaintCategory, Priority, ComplaintStatus } from '../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private users: User[] = [
    {
      id: '1',
      email: 'admin@hotel.com',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      address: {
        street: '123 Admin St',
        city: 'Admin City',
        state: 'AC',
        zipCode: '12345',
        country: 'USA'
      },
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      loginAttempts: 0,
      isLocked: false
    },
    {
      id: '2',
      email: 'customer@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1987654321',
      address: {
        street: '456 Customer Ave',
        city: 'Customer City',
        state: 'CC',
        zipCode: '67890',
        country: 'USA'
      },
      role: UserRole.CUSTOMER,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      loginAttempts: 0,
      isLocked: false
    },
    {
      id: '3',
      email: 'staff.billing@hotel.com',
      firstName: 'Bill',
      lastName: 'Manager',
      phoneNumber: '+1111111111',
      address: {
        street: '789 Billing Rd',
        city: 'Finance City',
        state: 'FC',
        zipCode: '24680',
        country: 'USA'
      },
      role: UserRole.STAFF,
      isActive: true,
      createdAt: new Date('2024-02-01'),
      loginAttempts: 0,
      isLocked: false
    },
    {
      id: '4',
      email: 'staff.maintenance@hotel.com',
      firstName: 'Manny',
      lastName: 'Tech',
      phoneNumber: '+2222222222',
      address: {
        street: '101 Maintenance Ln',
        city: 'Service City',
        state: 'SC',
        zipCode: '13579',
        country: 'USA'
      },
      role: UserRole.STAFF,
      isActive: true,
      createdAt: new Date('2024-03-01'),
      loginAttempts: 0,
      isLocked: false
    }
  ];

  private rooms: Room[] = [
    {
      id: '1',
      roomNumber: '101',
      type: RoomType.SINGLE,
      category: 'Standard',
      description: 'Comfortable single room with city view',
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
      pricePerNight: 150,
      maxOccupancy: 1,
      capacity: 1,
      images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'],
      isActive: true,
      available: true,
      floor: 1
    },
    {
      id: '2',
      roomNumber: '201',
      type: RoomType.DOUBLE,
      category: 'Deluxe',
      description: 'Spacious double room with balcony',
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'],
      pricePerNight: 250,
      maxOccupancy: 2,
      capacity: 2,
      images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'],
      isActive: true,
      available: true,
      floor: 2
    },
    {
      id: '3',
      roomNumber: '301',
      type: RoomType.SUITE,
      category: 'Suite',
      description: 'Luxury suite with separate living area',
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Living Area', 'Jacuzzi'],
      pricePerNight: 450,
      maxOccupancy: 4,
      capacity: 4,
      images: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'],
      isActive: true,
      available: true,
      floor: 3
    }
  ];

  private bookings: Booking[] = [
    {
      id: '1',
      customerId: '2',
      roomId: '1',
      checkInDate: new Date('2024-12-25'),
      checkOutDate: new Date('2024-12-27'),
      guests: 1,
      totalAmount: 300,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01')
    }
  ];

  private complaints: Complaint[] = [
    {
      complaintId: 'COMP001',
      customerId: '2',
      bookingId: '1',
      title: 'Room cleanliness issue',
      description: 'The room was not properly cleaned upon arrival',
      category: ComplaintCategory.ROOM,
      priority: Priority.MEDIUM,
      status: ComplaintStatus.ACTIVE,
      createdAt: '2024-12-01',
      updatedAt: '2024-12-01',
      actions: []
    },
    {
      complaintId: 'COMP002',
      customerId: '2',
      bookingId: '1',
      title: 'Incorrect billing amount',
      description: 'I was charged twice for minibar usage',
      category: ComplaintCategory.BILLING,
      priority: Priority.HIGH,
      status: ComplaintStatus.RESOLVED,
      assignedStaffId: '3',
      createdAt: '2024-12-02',
      updatedAt: '2024-12-02',
      actions: []
    }
  ];

  getUsers(): User[] {
    return [...this.users];
  }

  getRooms(): Room[] {
    return [...this.rooms];
  }

  getBookings(): Booking[] {
    return [...this.bookings];
  }

  getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  getComplaintById(complaintId: string): Complaint | null {
    return this.complaints.find(c => c.complaintId === complaintId) || null;
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  addRoom(room: Room): void {
    this.rooms.push(room);
  }

  addBooking(booking: Booking): void {
    this.bookings.push(booking);
  }

  addComplaint(complaint: Complaint): void {
    this.complaints.push(complaint);
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  }

  updateBooking(bookingId: string, updates: Partial<Booking>): Booking | null {
    const index = this.bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      this.bookings[index] = { ...this.bookings[index], ...updates };
      return this.bookings[index];
    }
    return null;
  }

  updateComplaint(complaintId: string, updates: Partial<Complaint>): Complaint | null {
    const index = this.complaints.findIndex(c => c.complaintId === complaintId);
    if (index !== -1) {
      this.complaints[index] = { ...this.complaints[index], ...updates };
      return this.complaints[index];
    }
    return null;
  }
}