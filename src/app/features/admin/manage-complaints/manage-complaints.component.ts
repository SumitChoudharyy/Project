import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Complaint, ComplaintStatus } from '../../../models/complaint.model';
import { ComplaintService } from '../../../services/complaint.service';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PopupService } from '../../../shared/services/popup.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-complaints',
  standalone: true,
  imports: [SharedModule, LoadingSpinnerComponent],
  template: `
    <div class="manage-complaints-container">
      <div class="page-header">
        <h1>Manage Complaints</h1>
        <p>Monitor and manage customer complaints across the hotel</p>
      </div>

      <div class="stats-section">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">report_problem</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ activeComplaints }}</span>
                <span class="stat-label">Active Complaints</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ resolvedComplaints }}</span>
                <span class="stat-label">Resolved</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">schedule</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ totalComplaints }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="complaints-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>All Complaints</mat-card-title>
            <mat-card-subtitle>Manage customer complaints and update their status</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div *ngIf="isLoading" class="loading-section">
              <app-loading-spinner message="Loading complaints..."></app-loading-spinner>
            </div>

            <div *ngIf="!isLoading && complaints.length === 0" class="empty-state">
              <mat-icon>support_agent</mat-icon>
              <h3>No complaints found</h3>
              <p>There are no complaints to display at the moment</p>
            </div>

            <div *ngIf="!isLoading && complaints.length > 0" class="complaints-table-container">
              <table mat-table [dataSource]="complaints" class="complaints-table">
                <!-- Complaint ID Column -->
                <ng-container matColumnDef="complaintId">
                  <th mat-header-cell *matHeaderCellDef>Complaint ID</th>
                  <td mat-cell *matCellDef="let complaint">{{ complaint.complaintId }}</td>
                </ng-container>

                <!-- Customer ID Column -->
                <ng-container matColumnDef="customerId">
                  <th mat-header-cell *matHeaderCellDef>Customer ID</th>
                  <td mat-cell *matCellDef="let complaint">{{ complaint.customerId }}</td>
                </ng-container>

                <!-- Description Column -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let complaint">
                    <div class="description-cell">
                      <span class="description-text">{{ complaint.description }}</span>
                      <button mat-button color="primary" (click)="viewFullDescription(complaint)">
                        View Full
                      </button>
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let complaint">
                    <span class="status-chip" [ngClass]="'status-' + complaint.status.toLowerCase()">
                      {{ complaint.status | titlecase }}
                    </span>
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let complaint">{{ complaint.createdAt | date:'short' }}</td>
                </ng-container>

                <!-- Updated Date Column -->
                <ng-container matColumnDef="updatedAt">
                  <th mat-header-cell *matHeaderCellDef>Last Updated</th>
                  <td mat-cell *matCellDef="let complaint">{{ complaint.updatedAt | date:'short' }}</td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let complaint">
                    <div class="action-buttons">
                      <button mat-icon-button color="primary" 
                              (click)="updateStatus(complaint)"
                              matTooltip="Update Status">
                        <mat-icon>update</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" 
                              (click)="deleteComplaint(complaint)"
                              matTooltip="Delete Complaint">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .manage-complaints-container {
      max-width: 1200px;
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

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }

    .stat-details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 500;
      color: #333;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .complaints-section {
      margin-bottom: 24px;
    }

    .loading-section {
      padding: 40px 0;
      text-align: center;
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
      margin: 0;
    }

    .complaints-table-container {
      overflow-x: auto;
    }

    .complaints-table {
      width: 100%;
    }

    .description-cell {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .description-text {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-resolved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .stats-section {
        grid-template-columns: 1fr;
      }

      .stat-content {
        flex-direction: column;
        gap: 8px;
      }

      .stat-details {
        align-items: center;
      }
    }
  `]
})
export class ManageComplaintsComponent implements OnInit, OnDestroy {
  complaints: Complaint[] = [];
  isLoading = true;
  displayedColumns = ['complaintId', 'customerId', 'description', 'status', 'createdAt', 'updatedAt', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeComplaints(): number {
    return this.complaints.filter(c => c.status === ComplaintStatus.ACTIVE).length;
  }

  get resolvedComplaints(): number {
    return this.complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
  }

  get totalComplaints(): number {
    return this.complaints.length;
  }

  private loadComplaints(): void {
    this.isLoading = true;
    this.complaintService.getAllComplaints()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (complaints) => {
          this.complaints = complaints.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading complaints:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to load complaints. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  updateStatus(complaint: Complaint): void {
    const dialogRef = this.dialog.open(UpdateStatusDialog, {
      width: '400px',
      data: { complaint }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.complaintService.updateComplaintStatus(complaint.complaintId, result.status)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedComplaint) => {
              const index = this.complaints.findIndex(c => c.complaintId === complaint.complaintId);
              if (index !== -1) {
                this.complaints[index] = updatedComplaint;
              }
              this.snackBar.open('Complaint status updated successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            },
            error: (error) => {
              console.error('Error updating complaint status:', error);
              this.snackBar.open('Failed to update complaint status. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  deleteComplaint(complaint: Complaint): void {
    this.popupService.confirmDanger(
      `Are you sure you want to delete complaint ${complaint.complaintId}?`,
      'Delete Complaint'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.complaintService.deleteComplaint(complaint.complaintId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.complaints = this.complaints.filter(c => c.complaintId !== complaint.complaintId);
              this.snackBar.open('Complaint deleted successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            },
            error: (error) => {
              console.error('Error deleting complaint:', error);
              this.snackBar.open('Failed to delete complaint. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  viewFullDescription(complaint: Complaint): void {
    this.dialog.open(ViewDescriptionDialog, {
      width: '500px',
      data: { complaint }
    });
  }
}

// Dialog component for updating complaint status
@Component({
  selector: 'update-status-dialog',
  standalone: true,
  imports: [SharedModule],
  template: `
    <h2 mat-dialog-title>Update Complaint Status</h2>
    <mat-dialog-content>
      <p><strong>Complaint ID:</strong> {{ data.complaint.complaintId }}</p>
      <p><strong>Current Status:</strong> {{ data.complaint.status }}</p>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>New Status</mat-label>
        <mat-select [(ngModel)]="selectedStatus">
          <mat-option value="ACTIVE">Active</mat-option>
          <mat-option value="RESOLVED">Resolved</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!selectedStatus || selectedStatus === data.complaint.status"
              (click)="updateStatus()">
        Update Status
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-top: 16px;
    }
    
    mat-dialog-content p {
      margin: 8px 0;
    }
  `]
})
export class UpdateStatusDialog {
  selectedStatus: ComplaintStatus = ComplaintStatus.ACTIVE;

  constructor(
    public dialogRef: MatDialogRef<UpdateStatusDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { complaint: Complaint }
  ) {
    this.selectedStatus = data.complaint.status;
  }

  updateStatus(): void {
    this.dialogRef.close({ status: this.selectedStatus });
  }
}

// Dialog component for viewing full description
@Component({
  selector: 'view-description-dialog',
  standalone: true,
  imports: [SharedModule],
  template: `
    <h2 mat-dialog-title>Complaint Description</h2>
    <mat-dialog-content>
      <p><strong>Complaint ID:</strong> {{ data.complaint.complaintId }}</p>
      <p><strong>Customer ID:</strong> {{ data.complaint.customerId }}</p>
      <p><strong>Status:</strong> {{ data.complaint.status }}</p>
      <p><strong>Created:</strong> {{ data.complaint.createdAt | date:'medium' }}</p>
      <p><strong>Last Updated:</strong> {{ data.complaint.updatedAt | date:'medium' }}</p>
      
      <div class="description-section">
        <h3>Description:</h3>
        <p class="description-text">{{ data.complaint.description }}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .description-section {
      margin-top: 16px;
    }
    
    .description-text {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    
    mat-dialog-content p {
      margin: 8px 0;
    }
  `]
})
export class ViewDescriptionDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewDescriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { complaint: Complaint }
  ) {}
}
