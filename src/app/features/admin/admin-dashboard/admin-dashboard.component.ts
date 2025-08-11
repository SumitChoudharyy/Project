import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { Complaint, ComplaintCategory, ComplaintStatus, Priority } from '../../../models/complaint.model';
import { ComplaintService } from '../../../services/complaint.service';
import { MockDataService } from '../../../services/mock-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { selectUser } from '../../../store/auth/auth.selectors';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

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
    MatProgressSpinnerModule,
    MatSelectModule
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

      <div class="complaints-section">
        <h2>All Complaints</h2>
        <div *ngIf="isLoadingComplaints" class="loading"><mat-spinner></mat-spinner></div>
        <div *ngIf="!isLoadingComplaints && complaints.length === 0" class="empty-state">No complaints yet.</div>

        <div class="table-wrapper" *ngIf="!isLoadingComplaints && complaints.length > 0">
          <table mat-table [dataSource]="complaints" class="mat-elevation-z1">
            <!-- ID -->
            <ng-container matColumnDef="complaintId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let c">{{ c.complaintId }}</td>
            </ng-container>

            <!-- Customer -->
            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let c">{{ getUserName(c.customerId) }}</td>
            </ng-container>

            <!-- Date -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let c">{{ c.createdAt | date:'medium' }}</td>
            </ng-container>

            <!-- Category -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let c">{{ c.category | titlecase }}</td>
            </ng-container>

            <!-- Priority -->
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Priority</th>
              <td mat-cell *matCellDef="let c">
                <span class="chip priority {{c.priority}}">{{ c.priority | titlecase }}</span>
              </td>
            </ng-container>

            <!-- Assigned -->
            <ng-container matColumnDef="assigned">
              <th mat-header-cell *matHeaderCellDef>Assigned</th>
              <td mat-cell *matCellDef="let c">{{ getAssignedName(c.assignedStaffId) }}</td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <mat-select [value]="c.status" (selectionChange)="onChangeStatus(c, $event.value)" class="status-select">
                  <mat-option *ngFor="let s of statusOptions" [value]="s">{{ s | titlecase }}</mat-option>
                </mat-select>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
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

    .complaints-section { margin-top: 32px; }
    .table-wrapper { overflow: auto; }
    table { width: 100%; }
    .loading { padding: 24px 0; display: flex; justify-content: center; }
    .empty-state { color: #666; padding: 16px 0; }
    .chip.priority.low { background: #f1f8e9; color: #558b2f; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .chip.priority.medium { background: #fff8e1; color: #f9a825; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .chip.priority.high { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .chip.priority.urgent { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 12px; border: 1px solid #c62828; }
    .status-select { min-width: 150px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  complaints: Complaint[] = [];
  isLoadingComplaints = true;
  displayedColumns: string[] = ['complaintId', 'customer', 'date', 'category', 'priority', 'assigned', 'status'];
  statusOptions = Object.values(ComplaintStatus);
  private userMap: Record<string, string> = {};

  constructor(
    private store: Store,
    private complaintService: ComplaintService,
    private mockData: MockDataService,
    private snackBar: MatSnackBar
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Build user map once
    this.mockData.getUsers().forEach(u => {
      this.userMap[u.id] = `${u.firstName} ${u.lastName}`;
    });

    this.loadComplaints();
  }

  private loadComplaints(): void {
    this.isLoadingComplaints = true;
    this.complaintService.getAllComplaints().subscribe(list => {
      this.complaints = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.isLoadingComplaints = false;
    });
  }

  getUserName(userId: string): string { return this.userMap[userId] || userId; }
  getAssignedName(staffId?: string): string { return staffId ? (this.userMap[staffId] || staffId) : '—'; }

  onChangeStatus(complaint: Complaint, status: ComplaintStatus): void {
    if (complaint.status === status) { return; }
    this.complaintService.updateStatus(complaint.complaintId, status).subscribe({
      next: (updated) => {
        // Update local row
        const idx = this.complaints.findIndex(c => c.complaintId === updated.complaintId);
        if (idx !== -1) { this.complaints[idx] = updated; }
        this.snackBar.open(`Status for #${updated.complaintId} set to ${updated.status}`, 'Close', { duration: 2500 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }
} 