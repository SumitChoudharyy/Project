import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Room } from '../../../models/room.model';
import { BookingRequest } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { selectUser } from '../../../store/auth/auth.selectors';


export interface CreateBookingData {
  room: Room;
  checkInDate?: Date;
  checkOutDate?: Date;
  guests?: number;
}

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="create-booking-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Book Room</mat-card-title>
          <mat-card-subtitle>{{ data.room.type | titlecase }} Room - {{ data.room.roomNumber }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="room-summary">
            <div class="room-image" [style.background-image]="'url(' + data.room.images[0] + ')'"></div>
            <div class="room-details">
              <h3>{{ data.room.type | titlecase }} Room</h3>
              <p>{{ data.room.description }}</p>
              <div class="room-info">
                <span><mat-icon>people</mat-icon> Up to {{ data.room.maxOccupancy }} guests</span>
                <span><mat-icon>layers</mat-icon> Floor {{ data.room.floor }}</span>
                <span><mat-icon>attach_money</mat-icon> \${{ data.room.pricePerNight }}/night</span>
              </div>
            </div>
          </div>

          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Check-in Date</mat-label>
                <input matInput [matDatepicker]="checkInPicker" formControlName="checkInDate" [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="checkInPicker"></mat-datepicker-toggle>
                <mat-datepicker #checkInPicker></mat-datepicker>
                <mat-error *ngIf="bookingForm.get('checkInDate')?.hasError('required')">
                  Check-in date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Check-out Date</mat-label>
                <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOutDate" [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
                <mat-datepicker #checkOutPicker></mat-datepicker>
                <mat-error *ngIf="bookingForm.get('checkOutDate')?.hasError('required')">
                  Check-out date is required
                </mat-error>
                <mat-error *ngIf="bookingForm.get('checkOutDate')?.hasError('dateRange')">
                  Check-out date must be after check-in date
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="guests-field">
                <mat-label>Number of Guests</mat-label>
                <mat-select formControlName="guests">
                  <mat-option *ngFor="let num of guestOptions" [value]="num">
                    {{ num }} {{ num === 1 ? 'Guest' : 'Guests' }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="bookingForm.get('guests')?.hasError('required')">
                  Number of guests is required
                </mat-error>
                <mat-error *ngIf="bookingForm.get('guests')?.hasError('maxGuests')">
                  Maximum {{ data.room.maxOccupancy }} guests allowed
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="special-requests-field">
                <mat-label>Special Requests (Optional)</mat-label>
                <textarea matInput formControlName="specialRequests" rows="3" 
                          placeholder="Any special requests or preferences..."></textarea>
              </mat-form-field>
            </div>

            <div class="booking-summary">
              <h4>Booking Summary</h4>
              <div class="summary-item">
                <span>Room Type:</span>
                <span>{{ data.room.type | titlecase }}</span>
              </div>
              <div class="summary-item">
                <span>Duration:</span>
                <span>{{ getTotalNights() }} night(s)</span>
              </div>
              <div class="summary-item">
                <span>Price per night:</span>
                <span>\${{ data.room.pricePerNight }}</span>
              </div>
              <div class="summary-item total">
                <span>Total Amount:</span>
                <span>\${{ getTotalAmount() }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="bookingForm.invalid || isSubmitting">
                <span *ngIf="!isSubmitting">Confirm Booking</span>
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-booking-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .room-summary {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .room-image {
      width: 200px;
      height: 150px;
      background-size: cover;
      background-position: center;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .room-details {
      flex: 1;
    }

    .room-details h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .room-details p {
      margin: 0 0 16px 0;
      color: #666;
      line-height: 1.5;
    }

    .room-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .room-info span {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .room-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .booking-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .date-field {
      flex: 1;
    }

    .guests-field {
      flex: 0 0 200px;
    }

    .special-requests-field {
      flex: 1;
    }

    .booking-summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .booking-summary h4 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.total {
      font-weight: 600;
      font-size: 18px;
      color: #1976d2;
      border-top: 2px solid #1976d2;
      padding-top: 16px;
      margin-top: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e9ecef;
    }

    @media (max-width: 768px) {
      .create-booking-container {
        padding: 16px;
      }

      .room-summary {
        flex-direction: column;
        text-align: center;
      }

      .room-image {
        width: 100%;
        height: 200px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .guests-field {
        flex: 1;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CreateBookingComponent implements OnInit {
  bookingForm: FormGroup;
  isSubmitting = false;
  minDate = new Date();
  guestOptions: number[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private store: Store,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialogRef: MatDialogRef<CreateBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateBookingData
  ) {
    this.bookingForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      specialRequests: ['']
    }, { validators: this.dateRangeValidator });

    // Generate guest options based on room capacity
    this.guestOptions = Array.from({ length: this.data.room.maxOccupancy }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    // Set default dates if provided
    if (this.data.checkInDate) {
      this.bookingForm.patchValue({ checkInDate: this.data.checkInDate });
    }
    if (this.data.checkOutDate) {
      this.bookingForm.patchValue({ checkOutDate: this.data.checkOutDate });
    }
    if (this.data.guests) {
      this.bookingForm.patchValue({ guests: this.data.guests });
    }

    // Add custom validator for guest capacity
    this.bookingForm.get('guests')?.addValidators(this.guestCapacityValidator.bind(this));
  }

  dateRangeValidator(group: FormGroup) {
    const checkIn = group.get('checkInDate')?.value;
    const checkOut = group.get('checkOutDate')?.value;
    
    if (checkIn && checkOut && checkOut <= checkIn) {
      group.get('checkOutDate')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    
    return null;
  }

  guestCapacityValidator(control: any) {
    const guests = control.value;
    if (guests && guests > this.data.room.maxOccupancy) {
      return { maxGuests: true };
    }
    return null;
  }

  getTotalNights(): number {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    if (checkIn && checkOut) {
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    return 0;
  }

  getTotalAmount(): number {
    const nights = this.getTotalNights();
    return nights * this.data.room.pricePerNight;
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.isSubmitting = true;
      
      this.store.select(selectUser).pipe(take(1)).subscribe(user => {
        if (!user) {
          this.snackBar.open('Please log in to create a booking', 'Close', { duration: 3000 });
          this.isSubmitting = false;
          return;
        }

        const formValue = this.bookingForm.value;
        const bookingRequest: BookingRequest = {
          roomId: this.data.room.id,
          checkInDate: formValue.checkInDate,
          checkOutDate: formValue.checkOutDate,
          guests: formValue.guests,
          specialRequests: formValue.specialRequests || undefined
        };

        this.bookingService.createBooking(user.id, bookingRequest).subscribe({
          next: (booking) => {
            this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(booking);
            this.router.navigate(['/bookings']);
          },
          error: (error) => {
            console.error('Error creating booking:', error);
            this.snackBar.open(error.message || 'Failed to create booking', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
