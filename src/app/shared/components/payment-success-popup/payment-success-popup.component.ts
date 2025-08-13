import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface PaymentSuccessData {
  bookingId: string;
  amount: number;
  transactionId: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
}

@Component({
  selector: 'app-payment-success-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="payment-success-container">
      <div class="success-icon">
        <mat-icon>check_circle</mat-icon>
      </div>
      
      <h2>Payment Successful!</h2>
      <p class="success-message">Your booking has been confirmed and payment processed successfully.</p>
      
      <mat-divider></mat-divider>
      
      <div class="booking-details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <span class="label">Booking ID:</span>
          <span class="value">{{ data.bookingId }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Room Type:</span>
          <span class="value">{{ data.roomType }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-in:</span>
          <span class="value">{{ data.checkInDate | date:'mediumDate' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Check-out:</span>
          <span class="value">{{ data.checkOutDate | date:'mediumDate' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount Paid:</span>
          <span class="value amount">\${{ data.amount | number:'1.2-2' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction ID:</span>
          <span class="value transaction-id">{{ data.transactionId }}</span>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="next-steps">
        <h3>What's Next?</h3>
        <ul>
          <li>You will receive a confirmation email shortly</li>
          <li>Check-in at the hotel on your arrival date</li>
          <li>Present your booking ID and photo ID at check-in</li>
        </ul>
      </div>
      
      <div class="actions">
        <button mat-raised-button color="primary" (click)="viewBookings()">
          <mat-icon>event</mat-icon>
          View My Bookings
        </button>
        <button mat-stroked-button (click)="close()">
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-success-container {
      text-align: center;
      padding: 24px;
      max-width: 500px;
    }

    .success-icon {
      margin-bottom: 16px;
    }

    .success-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }

    h2 {
      margin: 0 0 8px 0;
      color: #4caf50;
      font-size: 24px;
      font-weight: 500;
    }

    .success-message {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 16px;
    }

    .booking-details {
      text-align: left;
      margin: 24px 0;
    }

    .booking-details h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
      font-weight: 400;
    }

    .value.amount {
      color: #4caf50;
      font-weight: 600;
      font-size: 18px;
    }

    .value.transaction-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }

    .next-steps {
      text-align: left;
      margin: 24px 0;
    }

    .next-steps h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .next-steps ul {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }

    .next-steps li {
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
    }

    .actions button {
      min-width: 120px;
    }

    @media (max-width: 768px) {
      .payment-success-container {
        padding: 16px;
      }

      .actions {
        flex-direction: column;
        align-items: center;
      }

      .actions button {
        width: 100%;
        max-width: 200px;
      }
    }
  `]
})
export class PaymentSuccessPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentSuccessPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentSuccessData
  ) {}

  viewBookings(): void {
    this.dialogRef.close({ action: 'viewBookings' });
  }

  close(): void {
    this.dialogRef.close();
  }
}
