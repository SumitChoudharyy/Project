import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/user.model';
import { Complaint, ComplaintCategory, Priority } from '../../../models/complaint.model';
import { selectUser } from '../../../store/auth/auth.selectors';
import { ComplaintService } from '../../../services/complaint.service';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [SharedModule, LoadingSpinnerComponent],
  template: `
    <div class="complaints-container">
      <div class="page-header">
        <h1>Support & Complaints</h1>
        <p>We're here to help. Submit your concerns and track their resolution.</p>
      </div>

      <mat-tab-group class="complaints-tabs">
        <!-- Submit New Complaint -->
        <mat-tab label="Submit Complaint">
          <div class="tab-content">
            <mat-card class="complaint-form-card">
              <mat-card-header>
                <mat-card-title>Register a New Complaint</mat-card-title>
                <mat-card-subtitle>Please provide detailed information about your concern</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <form [formGroup]="complaintForm" (ngSubmit)="onSubmit()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Category</mat-label>
                      <mat-select formControlName="category">
                        <mat-option value="room">Room Issues</mat-option>
                        <mat-option value="service">Service Quality</mat-option>
                        <mat-option value="billing">Billing & Payment</mat-option>
                        <mat-option value="amenities">Amenities</mat-option>
                        <mat-option value="staff">Staff Behavior</mat-option>
                        <mat-option value="other">Other</mat-option>
                      </mat-select>
                      <mat-error *ngIf="complaintForm.get('category')?.hasError('required')">
                        Please select a category
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Priority</mat-label>
                      <mat-select formControlName="priority">
                        <mat-option value="low">Low</mat-option>
                        <mat-option value="medium">Medium</mat-option>
                        <mat-option value="high">High</mat-option>
                        <mat-option value="urgent">Urgent</mat-option>
                      </mat-select>
                      <mat-error *ngIf="complaintForm.get('priority')?.hasError('required')">
                        Please select priority level
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Title</mat-label>
                    <input matInput formControlName="title" placeholder="Brief description of the issue">
                    <mat-error *ngIf="complaintForm.get('title')?.hasError('required')">
                      Title is required
                    </mat-error>
                    <mat-error *ngIf="complaintForm.get('title')?.hasError('minlength')">
                      Title must be at least 5 characters long
                    </mat-error>
                    <mat-error *ngIf="complaintForm.get('title')?.hasError('maxlength')">
                      Title cannot exceed 100 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" 
                              placeholder="Please provide detailed information about your complaint..."
                              rows="6"></textarea>
                    <mat-hint>{{ complaintForm.get('description')?.value?.length || 0 }}/1000 characters</mat-hint>
                    <mat-error *ngIf="complaintForm.get('description')?.hasError('required')">
                      Description is required
                    </mat-error>
                    <mat-error *ngIf="complaintForm.get('description')?.hasError('minlength')">
                      Description must be at least 20 characters long
                    </mat-error>
                    <mat-error *ngIf="complaintForm.get('description')?.hasError('maxlength')">
                      Description cannot exceed 1000 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Related Booking ID (Optional)</mat-label>
                    <input matInput formControlName="bookingId" placeholder="Enter booking ID if applicable">
                    <mat-hint>Leave empty if not related to a specific booking</mat-hint>
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-button type="button" (click)="resetForm()">Clear Form</button>
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="complaintForm.invalid || isSubmitting">
                      <span *ngIf="!isSubmitting">Submit Complaint</span>
                      <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Track Complaints -->
        <mat-tab label="Track Status">
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-section">
              <app-loading-spinner message="Loading your complaints..."></app-loading-spinner>
            </div>

            <div *ngIf="!isLoading && complaints.length === 0" class="empty-state">
              <mat-icon>support_agent</mat-icon>
              <h3>No complaints submitted</h3>
              <p>You haven't submitted any complaints yet</p>
              <button mat-raised-button color="primary" (click)="switchToSubmitTab()">Submit Your First Complaint</button>
            </div>

            <div *ngIf="!isLoading && complaints.length > 0" class="complaints-list">
              <mat-card *ngFor="let complaint of complaints" class="complaint-card">
                <mat-card-content>
                  <div class="complaint-header">
                    <div class="complaint-info">
                      <h3>{{ complaint.title }}</h3>
                      <div class="complaint-meta">
                        <span class="complaint-id">ID: {{ complaint.id }}</span>
                        <span class="complaint-date">{{ complaint.createdAt | date:'mediumDate' }}</span>
                      </div>
                    </div>
                    <div class="complaint-status">
                      <div class="status-chips">
                        <span class="status-chip" [ngClass]="'status-' + complaint.status">
                          {{ complaint.status | titlecase }}
                        </span>
                        <span class="priority-chip" [ngClass]="'priority-' + complaint.priority">
                          {{ complaint.priority | titlecase }}
                        </span>
                      </div>
                      <span class="category-chip">{{ complaint.category | titlecase }}</span>
                    </div>
                  </div>

                  <div class="complaint-details">
                    <p class="complaint-description">{{ complaint.description }}</p>
                    
                    <div class="complaint-timeline" *ngIf="complaint.status !== 'open'">
                      <div class="timeline-item">
                        <mat-icon>create</mat-icon>
                        <div class="timeline-content">
                          <strong>Complaint Submitted</strong>
                          <span>{{ complaint.createdAt | date:'medium' }}</span>
                        </div>
                      </div>
                      
                      <div class="timeline-item" *ngIf="complaint.assignedStaffId">
                        <mat-icon>assignment_ind</mat-icon>
                        <div class="timeline-content">
                          <strong>Assigned to Staff</strong>
                          <span>{{ complaint.updatedAt | date:'medium' }}</span>
                        </div>
                      </div>

                      <div class="timeline-item" *ngIf="complaint.status === 'resolved' && complaint.resolution">
                        <mat-icon>check_circle</mat-icon>
                        <div class="timeline-content">
                          <strong>Resolved</strong>
                          <span>{{ complaint.resolvedAt | date:'medium' }}</span>
                          <p class="resolution-text">{{ complaint.resolution }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions *ngIf="complaint.status === 'open'">
                  <button mat-button color="primary" (click)="editComplaint(complaint)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-button color="warn" (click)="cancelComplaint(complaint)">
                    <mat-icon>cancel</mat-icon>
                    Cancel
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
    .complaints-container {
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

    .complaints-tabs {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .complaint-form-card {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
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

    .complaints-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .complaint-card {
      transition: transform 0.2s ease;
    }

    .complaint-card:hover {
      transform: translateY(-2px);
    }

    .complaint-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .complaint-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .complaint-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
    }

    .complaint-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .status-chips {
      display: flex;
      gap: 8px;
    }

    .status-chip, .priority-chip, .category-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-open {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-in_progress {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-resolved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-closed {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .priority-low {
      background-color: #f1f8e9;
      color: #558b2f;
    }

    .priority-medium {
      background-color: #fff8e1;
      color: #f9a825;
    }

    .priority-high {
      background-color: #ffebee;
      color: #c62828;
    }

    .priority-urgent {
      background-color: #ffebee;
      color: #c62828;
      border: 2px solid #c62828;
    }

    .category-chip {
      background-color: #f5f5f5;
      color: #666;
    }

    .complaint-description {
      color: #333;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    .complaint-timeline {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-item mat-icon {
      color: #1976d2;
      margin-top: 2px;
    }

    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .timeline-content strong {
      color: #333;
      font-size: 14px;
    }

    .timeline-content span {
      color: #666;
      font-size: 12px;
    }

    .resolution-text {
      color: #333;
      font-size: 14px;
      margin: 8px 0 0 0;
      padding: 8px;
      background: white;
      border-radius: 4px;
    }

    .loading-section {
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .complaint-header {
        flex-direction: column;
        gap: 12px;
      }

      .complaint-status {
        align-items: flex-start;
      }

      .status-chips {
        flex-wrap: wrap;
      }
    }
  `]
})
export class ComplaintsComponent implements OnInit {
  complaintForm: FormGroup;
  user$ = this.store.select(selectUser);
  complaints: Complaint[] = [];
  isLoading = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private complaintService: ComplaintService,
    private snackBar: MatSnackBar
  ) {
    this.complaintForm = this.fb.group({
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(1000)
      ]],
      bookingId: ['']
    });
  }

  ngOnInit(): void {
    this.loadComplaints();
  }

  private loadComplaints(): void {
    this.user$.subscribe(user => {
      if (user) {
        this.complaintService.getComplaintsByCustomer(user.id).subscribe(complaints => {
          this.complaints = complaints.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.isLoading = false;
        });
      }
    });
  }

  onSubmit(): void {
    if (this.complaintForm.valid) {
      this.isSubmitting = true;
      
      this.user$.subscribe(user => {
        if (user) {
          const complaintData = {
            ...this.complaintForm.value,
            category: this.complaintForm.value.category as ComplaintCategory,
            priority: this.complaintForm.value.priority as Priority
          };

          this.complaintService.createComplaint(user.id, complaintData).subscribe({
            next: (complaint) => {
              this.complaints.unshift(complaint);
              this.resetForm();
              this.isSubmitting = false;
              this.snackBar.open('Complaint submitted successfully!', 'Close', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
            },
            error: (error) => {
              console.error('Error submitting complaint:', error);
              this.isSubmitting = false;
              this.snackBar.open('Failed to submit complaint. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
        }
      });
    }
  }

  resetForm(): void {
    this.complaintForm.reset({
      priority: 'medium'
    });
  }

  switchToSubmitTab(): void {
    // This would be implemented with ViewChild to access the tab group
    console.log('Switch to submit tab');
  }

  editComplaint(complaint: Complaint): void {
    console.log('Edit complaint:', complaint);
    // TODO: Implement edit functionality
    this.snackBar.open('Edit functionality coming soon!', 'Close', { duration: 3000 });
  }

  cancelComplaint(complaint: Complaint): void {
    console.log('Cancel complaint:', complaint);
    // TODO: Implement cancel functionality
    this.snackBar.open('Cancel functionality coming soon!', 'Close', { duration: 3000 });
  }
}