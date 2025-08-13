import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil, startWith, map } from 'rxjs';
import { Room } from '../../../models/room.model';
import { User } from '../../../models/user.model';
import { BookingRequest } from '../../../models/booking.model';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-new-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="new-reservation-dialog">
      <h2 mat-dialog-title>Create New Reservation</h2>
      
      <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Customer Email</mat-label>
              <input 
                type="email" 
                matInput 
                formControlName="customerEmail" 
                placeholder="Enter customer email"
                [matAutocomplete]="customerAuto">
              <mat-autocomplete #customerAuto="matAutocomplete" (optionSelected)="onCustomerSelected($event)">
                <mat-option *ngFor="let customer of filteredCustomers$ | async" [value]="customer.email">
                  {{ customer.firstName }} {{ customer.lastName }} ({{ customer.email }})
                </mat-option>
              </mat-autocomplete>
              <mat-error *ngIf="reservationForm.get('customerEmail')?.hasError('required')">
                Customer email is required
              </mat-error>
              <mat-error *ngIf="reservationForm.get('customerEmail')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Room</mat-label>
              <mat-select formControlName="roomId" required>
                <mat-option *ngFor="let room of availableRooms" [value]="room.id">
                  {{ room.roomNumber }} - {{ room.category }} ({{ room.capacity }} guests) - ${{ room.pricePerNight }}/night
                </mat-option>
              </mat-select>
              <mat-error *ngIf="reservationForm.get('roomId')?.hasError('required')">
                Room selection is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Check-in Date</mat-label>
              <input matInput [matDatepicker]="checkInPicker" formControlName="checkInDate" required>
              <mat-datepicker-toggle matSuffix [for]="checkInPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkInPicker></mat-datepicker>
              <mat-error *ngIf="reservationForm.get('checkInDate')?.hasError('required')">
                Check-in date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Check-out Date</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOutDate" required>
              <mat-datepicker-toggle matSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkOutPicker></mat-datepicker>
              <mat-error *ngIf="reservationForm.get('checkOutDate')?.hasError('required')">
                Check-out date is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Number of Guests</mat-label>
              <input type="number" matInput formControlName="guests" min="1" required>
              <mat-error *ngIf="reservationForm.get('guests')?.hasError('required')">
                Number of guests is required
              </mat-error>
              <mat-error *ngIf="reservationForm.get('guests')?.hasError('min')">
                At least 1 guest is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Special Requests</mat-label>
              <textarea matInput formControlName="specialRequests" rows="3" placeholder="Any special requests or notes"></textarea>
            </mat-form-field>
          </div>

          <div class="booking-summary" *ngIf="selectedRoom && reservationForm.get('checkInDate')?.value && reservationForm.get('checkOutDate')?.value">
            <h4>Booking Summary</h4>
            <div class="summary-item">
              <span>Room:</span>
              <span>{{ selectedRoom.roomNumber }} - {{ selectedRoom.category }}</span>
            </div>
            <div class="summary-item">
              <span>Duration:</span>
              <span>{{ getDurationDays() }} nights</span>
            </div>
            <div class="summary-item">
              <span>Total Amount:</span>
              <span class="total-amount">${{ calculateTotalAmount() }}</span>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button type="button" mat-button mat-dialog-close>Cancel</button>
          <button 
            type="submit" 
            mat-raised-button 
            color="primary" 
            [disabled]="reservationForm.invalid || isSubmitting">
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <span *ngIf="!isSubmitting">Create Reservation</span>
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .new-reservation-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      flex: 1;
    }

    .booking-summary {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .booking-summary h4 {
      margin: 0 0 16px 0;
      color: #1976d2;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .total-amount {
      font-weight: bold;
      color: #1976d2;
      font-size: 18px;
    }

    @media (max-width: 600px) {
      .new-reservation-dialog {
        min-width: 100%;
        max-width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class NewReservationDialogComponent implements OnInit {
  reservationForm: FormGroup;
  availableRooms: Room[] = [];
  customers: User[] = [];
  filteredCustomers$: Observable<User[]>;
  selectedRoom: Room | null = null;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewReservationDialogComponent>,
    private roomService: RoomService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reservationForm = this.fb.group({
      customerEmail: ['', [Validators.required, Validators.email]],
      roomId: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      specialRequests: ['']
    });

    // Set up customer email autocomplete
    this.filteredCustomers$ = this.reservationForm.get('customerEmail')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCustomers(value))
    );
  }

  ngOnInit(): void {
    this.loadAvailableRooms();
    this.loadCustomers();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableRooms(): void {
    this.roomService.getAvailableRooms().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (rooms: Room[]) => {
        this.availableRooms = rooms;
        // If we have a selected room, update it
        if (this.selectedRoom) {
          this.updateSelectedRoom();
        }
      },
      error: (error: any) => {
        console.error('Error loading available rooms:', error);
        this.snackBar.open('Failed to load available rooms', 'Close', { duration: 3000 });
      }
    });
  }

  private updateSelectedRoom(): void {
    const roomId = this.reservationForm.get('roomId')!.value;
    this.selectedRoom = this.availableRooms.find(room => room.id === roomId) || null;
  }

  private loadCustomers(): void {
    // For now, we'll use mock customer data. In a real app, you'd have a user service
    this.customers = [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        role: 'customer' as any,
        isActive: true,
        createdAt: new Date(),
        loginAttempts: 0,
        isLocked: false
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1234567891',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        role: 'customer' as any,
        isActive: true,
        createdAt: new Date(),
        loginAttempts: 0,
        isLocked: false
      },
      {
        id: '3',
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        phoneNumber: '+1234567892',
        address: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        role: 'customer' as any,
        isActive: true,
        createdAt: new Date(),
        loginAttempts: 0,
        isLocked: false
      }
    ];
  }

  private setupFormListeners(): void {
    // Listen for room selection changes
    this.reservationForm.get('roomId')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(roomId => {
      this.selectedRoom = this.availableRooms.find(room => room.id === roomId) || null;
    });

    // Listen for date changes to validate check-out is after check-in
    this.reservationForm.get('checkInDate')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.validateDates();
    });

    this.reservationForm.get('checkOutDate')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.validateDates();
    });
  }

  private validateDates(): void {
    const checkIn = this.reservationForm.get('checkInDate')!.value;
    const checkOut = this.reservationForm.get('checkOutDate')!.value;

    if (checkIn && checkOut && checkIn >= checkOut) {
      this.reservationForm.get('checkOutDate')!.setErrors({ invalidDateRange: true });
    } else {
      this.reservationForm.get('checkOutDate')!.setErrors(null);
    }
  }

  private filterCustomers(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.customers.filter(customer => 
      customer.email.toLowerCase().includes(filterValue) ||
      customer.firstName.toLowerCase().includes(filterValue) ||
      customer.lastName.toLowerCase().includes(filterValue)
    );
  }

  onCustomerSelected(event: any): void {
    const selectedCustomer = this.customers.find(c => c.email === event.option.value);
    if (selectedCustomer) {
      // You could store the selected customer ID for later use
      console.log('Selected customer:', selectedCustomer);
    }
  }

  getDurationDays(): number {
    const checkIn = this.reservationForm.get('checkInDate')!.value;
    const checkOut = this.reservationForm.get('checkOutDate')!.value;
    
    if (checkIn && checkOut) {
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  calculateTotalAmount(): number {
    if (!this.selectedRoom) return 0;
    
    const duration = this.getDurationDays();
    return this.selectedRoom.pricePerNight * duration;
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.reservationForm.value;

    // Find the selected customer
    const selectedCustomer = this.customers.find(c => c.email === formValue.customerEmail);
    if (!selectedCustomer) {
      this.snackBar.open('Please select a valid customer', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    // Validate room capacity
    const selectedRoom = this.availableRooms.find(r => r.id === formValue.roomId);
    if (selectedRoom && formValue.guests > selectedRoom.capacity) {
      this.snackBar.open(`Room capacity is ${selectedRoom.capacity} guests. Please select a different room or reduce guest count.`, 'Close', { duration: 5000 });
      this.isSubmitting = false;
      return;
    }

    // Validate dates
    const checkIn = new Date(formValue.checkInDate);
    const checkOut = new Date(formValue.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      this.snackBar.open('Check-in date cannot be in the past', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    if (checkOut <= checkIn) {
      this.snackBar.open('Check-out date must be after check-in date', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    const bookingRequest: BookingRequest = {
      roomId: formValue.roomId,
      checkInDate: formValue.checkInDate,
      checkOutDate: formValue.checkOutDate,
      guests: formValue.guests,
      specialRequests: formValue.specialRequests
    };

    this.bookingService.createBooking(selectedCustomer.id, bookingRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (booking: any) => {
        this.snackBar.open('Reservation created successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(booking);
      },
      error: (error: any) => {
        console.error('Error creating reservation:', error);
        this.snackBar.open('Failed to create reservation. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }
}
