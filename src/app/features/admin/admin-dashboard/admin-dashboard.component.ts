import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { selectUser } from '../../../store/auth/auth.selectors';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-dashboard-container">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {{ (user$ | async)?.firstName }}!</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">hotel</mat-icon>
              </div>
              <div class="stat-details">
                <h3>25</h3>
                <p>Total Rooms</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">event</mat-icon>
              </div>
              <div class="stat-details">
                <h3>12</h3>
                <p>Active Bookings</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="warn">people</mat-icon>
              </div>
              <div class="stat-details">
                <h3>8</h3>
                <p>Total Customers</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #4caf50;">attach_money</mat-icon>
              </div>
              <div class="stat-details">
                <h3>$15,420</h3>
                <p>Revenue</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/admin/rooms">
            <mat-icon>hotel</mat-icon>
            Manage Rooms
          </button>
          <button mat-raised-button color="accent" routerLink="/admin/reservations">
            <mat-icon>event</mat-icon>
            View Reservations
          </button>
          <button mat-raised-button color="warn" routerLink="/admin/customers">
            <mat-icon>people</mat-icon>
            Manage Customers
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 500;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      padding: 24px;
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
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 500;
    }

    .stat-details p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .quick-actions {
      margin-top: 32px;
    }

    .quick-actions h2 {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 400;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .actions-grid button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      height: auto;
    }

    @media (max-width: 768px) {
      .admin-dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user$: Observable<User | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {}
} 