import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-manage-rooms',
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
    <div class="manage-rooms-container">
      <div class="page-header">
        <h1>Manage Rooms</h1>
        <p>View and manage all hotel rooms</p>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="rooms-overview">
            <div class="stats-row">
              <div class="stat-item">
                <h3>25</h3>
                <p>Total Rooms</p>
              </div>
              <div class="stat-item">
                <h3>18</h3>
                <p>Available</p>
              </div>
              <div class="stat-item">
                <h3>7</h3>
                <p>Occupied</p>
              </div>
            </div>

            <div class="actions-row">
              <button mat-raised-button color="primary">
                <mat-icon>add</mat-icon>
                Add New Room
              </button>
              <button mat-stroked-button>
                <mat-icon>refresh</mat-icon>
                Refresh
              </button>
            </div>
          </div>

          <div class="rooms-table">
            <h3>Room List</h3>
            <p>Room management functionality will be implemented here.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .manage-rooms-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
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

    .rooms-overview {
      margin-bottom: 24px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .stat-item h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 500;
      color: #1976d2;
    }

    .stat-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .actions-row {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .actions-row button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rooms-table {
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .rooms-table h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .rooms-table p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .manage-rooms-container {
        padding: 16px;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .actions-row {
        flex-direction: column;
      }
    }
  `]
})
export class ManageRoomsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
} 