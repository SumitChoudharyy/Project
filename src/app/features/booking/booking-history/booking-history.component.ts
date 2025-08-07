import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { Booking } from '../../../models/booking.model';
import { selectUser } from '../../../store/auth/auth.selectors';
import { BookingService } from '../../../services/booking.service';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [SharedModule, LoadingSpinnerComponent],
  template: `
    <div class="booking-history-container">
      <div class="page-header">
        <h1>My Bookings</h1>
        <p>Manage your past and upcoming reservations</p>
      </div>

      <mat-tab-group class="bookings-tabs">
        <!-- Upcoming Bookings -->
        <mat-tab label="Upcoming">
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-section">
              <app-loading-spinner message="Loading your bookings..."></app-loading-spinner>
            </div>

            <div *ngIf="!isLoading && upcomingBookings.length === 0" class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <h3>No upcoming bookings</h3>
              <p>You don't have any upcoming reservations</p>
              <button mat-raised-button color="primary" routerLink="/search">Book a Room</button>
            </div>

            <div *ngIf="!isLoading && upcomingBookings.length > 0" class="bookings-list">
              <mat-card *ngFor="let booking of upcomingBookings" class="booking-card">
                <mat-card-content>
                  <div class="booking-header">
                    <div class="booking-info">
                      <h3>Booking #{{ booking.id }}</h3>
                      <span class="status-chip" [ngClass]="'status-' + booking.status">
                        {{ booking.status | titlecase }}
                      </span>
                    </div>
                    <div class="booking-amount">
                      <span class="amount">\${{ booking.totalAmount }}</span>
                    </div>
                  </div>

                  <div class="booking-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <mat-icon>event</mat-icon>
                        <div class="detail-content">
                          <strong>Check-in</strong>
                          <span>{{ booking.checkInDate | date:'fullDate' }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <mat-icon>event</mat-icon>
                        <div class="detail-content">
                          <strong>Check-out</strong>
                          <span>{{ booking.checkOutDate | date:'fullDate' }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="detail-row">
                      <div class="detail-item">
                        <mat-icon>people</mat-icon>
                        <div class="detail-content">
                          <strong>Guests</strong>
                          <span>{{ booking.guests }} guest(s)</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <mat-icon>payment</mat-icon>
                        <div class="detail-content">
                          <strong>Payment Status</strong>
                          <span class="payment-status" [ngClass]="'payment-' + booking.paymentStatus">
                            {{ booking.paymentStatus | titlecase }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div *ngIf="booking.specialRequests" class="special-requests">
                      <mat-icon>note</mat-icon>
                      <div class="detail-content">
                        <strong>Special Requests</strong>
                        <span>{{ booking.specialRequests }}</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button color="primary" (click)="downloadInvoice(booking)">
                    <mat-icon>download</mat-icon>
                    Invoice
                  </button>
                  <button mat-button *ngIf="canModifyBooking(booking)" (click)="modifyBooking(booking)">
                    <mat-icon>edit</mat-icon>
                    Modify
                  </button>
                  <button mat-button color="warn" *ngIf="canCancelBooking(booking)" (click)="cancelBooking(booking)">
                    <mat-icon>cancel</mat-icon>
                    Cancel
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Past Bookings -->
        <mat-tab label="Past">
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-section">
              <app-loading-spinner message="Loading your booking history..."></app-loading-spinner>
            </div>

            <div *ngIf="!isLoading && pastBookings.length === 0" class="empty-state">
              <mat-icon>history</mat-icon>
              <h3>No past bookings</h3>
              <p>Your booking history will appear here</p>
            </div>

            <div *ngIf="!isLoading && pastBookings.length > 0" class="bookings-list">
              <mat-card *ngFor="let booking of pastBookings" class="booking-card past-booking">
                <mat-card-content>
                  <div class="booking-header">
                    <div class="booking-info">
                      <h3>Booking #{{ booking.id }}</h3>
                      <span class="status-chip" [ngClass]="'status-' + booking.status">
                        {{ booking.status | titlecase }}
                      </span>
                    </div>
                    <div class="booking-amount">
                      <span class="amount">\${{ booking.totalAmount }}</span>
                    </div>
                  </div>

                  <div class="booking-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <mat-icon>event</mat-icon>
                        <div class="detail-content">
                          <strong>Stay Period</strong>
                          <span>{{ booking.checkInDate | date:'shortDate' }} - {{ booking.checkOutDate | date:'shortDate' }}</span>
                        </div>
                      </div>
                      <div class="detail-item">
                        <mat-icon>people</mat-icon>
                        <div class="detail-content">
                          <strong>Guests</strong>
                          <span>{{ booking.guests }} guest(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button color="primary" (click)="downloadInvoice(booking)">
                    <mat-icon>download</mat-icon>
                    Invoice
                  </button>
                  <button mat-button (click)="viewBookingDetails(booking)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .booking-history-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 300;
      color: #333;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .bookings-tabs {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 400;
    }

    .empty-state p {
      margin: 0 0 24px 0;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .booking-card {
      transition: transform 0.2s ease;
    }

    .booking-card:hover {
      transform: translateY(-2px);
    }

    .past-booking {
      opacity: 0.8;
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .booking-info h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .booking-amount .amount {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }

    .booking-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-row {
      display: flex;
      gap: 32px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .detail-item mat-icon {
      color: #666;
      margin-top: 2px;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-content strong {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .detail-content span {
      font-size: 14px;
      color: #666;
    }

    .special-requests {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
    }

    .payment-paid {
      color: #4caf50;
      font-weight: 500;
    }

    .payment-pending {
      color: #ff9800;
      font-weight: 500;
    }

    .payment-failed {
      color: #f44336;
      font-weight: 500;
    }

    .loading-section {
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .booking-header {
        flex-direction: column;
        gap: 12px;
      }

      .detail-row {
        flex-direction: column;
        gap: 16px;
      }

      .detail-item {
        gap: 8px;
      }
    }
  `]
})
export class BookingHistoryComponent implements OnInit {
  user$: Observable<User | null>;
  allBookings: Booking[] = [];
  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  isLoading = true;

  constructor(
    private store: Store,
    private bookingService: BookingService
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.user$.subscribe(user => {
      if (user) {
        this.bookingService.getBookingsByCustomer(user.id).subscribe(bookings => {
          this.allBookings = bookings;
          this.categorizeBookings();
          this.isLoading = false;
        });
      }
    });
  }

  private categorizeBookings(): void {
    const now = new Date();
    
    this.upcomingBookings = this.allBookings.filter(booking => 
      new Date(booking.checkInDate) > now && booking.status !== 'cancelled'
    );
    
    this.pastBookings = this.allBookings.filter(booking => 
      new Date(booking.checkOutDate) <= now || booking.status === 'cancelled'
    );
  }

  canModifyBooking(booking: Booking): boolean {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const timeDiff = checkInDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 2 && booking.status === 'confirmed';
  }

  canCancelBooking(booking: Booking): boolean {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const timeDiff = checkInDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 1 && booking.status === 'confirmed';
  }

  modifyBooking(booking: Booking): void {
    console.log('Modify booking:', booking);
    // TODO: Navigate to modify booking page
  }

  cancelBooking(booking: Booking): void {
    console.log('Cancel booking:', booking);
    // TODO: Open cancel booking dialog
  }

  downloadInvoice(booking: Booking): void {
    this.bookingService.generateInvoice(booking.id).subscribe(invoice => {
      console.log('Generated invoice:', invoice);
      // TODO: Generate and download PDF invoice
    });
  }

  viewBookingDetails(booking: Booking): void {
    console.log('View booking details:', booking);
    // TODO: Navigate to booking details page
  }
}