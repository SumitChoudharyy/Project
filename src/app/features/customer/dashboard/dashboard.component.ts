import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { Booking } from '../../../models/booking.model';
import { selectUser } from '../../../store/auth/auth.selectors';
import { BookingService } from '../../../services/booking.service';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Shared components
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1>Welcome back, {{ (user$ | async)?.firstName }}!</h1>
          <p>Manage your bookings and explore our services</p>
        </div>
        <div class="quick-actions">
          <button mat-raised-button color="primary" routerLink="/search">
            <mat-icon>search</mat-icon>
            Search Rooms
          </button>
          <button mat-raised-button color="accent" routerLink="/bookings">
            <mat-icon>event</mat-icon>
            My Bookings
          </button>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="stats-section">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon color="primary">event</mat-icon>
                </div>
                <div class="stat-details">
                  <h3>{{ upcomingBookings.length }}</h3>
                  <p>Upcoming Bookings</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon color="accent">history</mat-icon>
                </div>
                <div class="stat-details">
                  <h3>{{ totalBookings.length }}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon color="warn">report_problem</mat-icon>
                </div>
                <div class="stat-details">
                  <h3>0</h3>
                  <p>Open Complaints</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon style="color: #4caf50;">verified_user</mat-icon>
                </div>
                <div class="stat-details">
                  <h3>Active</h3>
                  <p>Account Status</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Recent Bookings -->
      <section class="recent-bookings">
        <div class="section-header">
          <h2>Recent Bookings</h2>
          <button mat-button color="primary" routerLink="/bookings">View All</button>
        </div>

        <div *ngIf="isLoading" class="loading-section">
          <app-loading-spinner message="Loading your bookings..."></app-loading-spinner>
        </div>

        <div *ngIf="!isLoading && recentBookings.length === 0" class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <h3>No bookings yet</h3>
          <p>Start by searching for available rooms</p>
          <button mat-raised-button color="primary" routerLink="/search">Search Rooms</button>
        </div>

        <div *ngIf="!isLoading && recentBookings.length > 0" class="bookings-grid">
          <mat-card *ngFor="let booking of recentBookings" class="booking-card">
            <mat-card-content>
              <div class="booking-header">
                <h3>Booking #{{ booking.id }}</h3>
                <span class="status-chip" [ngClass]="'status-' + booking.status">
                  {{ booking.status | titlecase }}
                </span>
              </div>
              <div class="booking-details">
                <div class="detail-item">
                  <mat-icon>event</mat-icon>
                  <span>{{ booking.checkInDate | date }} - {{ booking.checkOutDate | date }}</span>
                </div>
                <div class="detail-item">
                  <mat-icon>people</mat-icon>
                  <span>{{ booking.guests }} guest(s)</span>
                </div>
                <div class="detail-item">
                  <mat-icon>attach_money</mat-icon>
                  <span>\${{ booking.totalAmount }}</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">View Details</button>
              <button mat-button *ngIf="booking.status === 'confirmed'">Modify</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <!-- Quick Links -->
      <section class="quick-links">
        <h2>Quick Links</h2>
        <div class="links-grid">
          <a mat-stroked-button routerLink="/profile" class="link-card">
            <mat-icon>person</mat-icon>
            <span>Update Profile</span>
          </a>
          <a mat-stroked-button routerLink="/complaints" class="link-card">
            <mat-icon>support</mat-icon>
            <span>Submit Complaint</span>
          </a>
          <a mat-stroked-button routerLink="/search" class="link-card">
            <mat-icon>search</mat-icon>
            <span>Search Rooms</span>
          </a>
          <a mat-stroked-button routerLink="/bookings" class="link-card">
            <mat-icon>receipt</mat-icon>
            <span>View Invoices</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .welcome-section {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-content h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 300;
    }

    .welcome-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
    }

    .stats-section {
      margin-bottom: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .stat-card {
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-details h3 {
      margin: 0;
      font-size: 28px;
      font-weight: 300;
    }

    .stat-details p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .recent-bookings {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 400;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .bookings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;
    }

    .booking-card {
      transition: transform 0.2s ease;
    }

    .booking-card:hover {
      transform: translateY(-2px);
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .booking-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .booking-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      opacity: 0.7;
    }

    .quick-links h2 {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 400;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .link-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      text-decoration: none;
      transition: transform 0.2s ease;
    }

    .link-card:hover {
      transform: translateY(-2px);
    }

    .link-card mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .loading-section {
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .welcome-section {
        flex-direction: column;
        text-align: center;
        gap: 24px;
      }

      .quick-actions {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .bookings-grid {
        grid-template-columns: 1fr;
      }

      .links-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  user$: Observable<User | null>;
  totalBookings: Booking[] = [];
  upcomingBookings: Booking[] = [];
  recentBookings: Booking[] = [];
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
          this.totalBookings = bookings;
          this.upcomingBookings = bookings.filter(b => 
            new Date(b.checkInDate) > new Date() && b.status === 'confirmed'
          );
          this.recentBookings = bookings.slice(0, 3);
          this.isLoading = false;
        });
      }
    });
  }
}