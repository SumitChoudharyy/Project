import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../../shared/shared.module';
import { Complaint, ComplaintActionType, ComplaintCategory, ComplaintStatus, Priority } from '../../../models/complaint.model';
import { ComplaintService } from '../../../services/complaint.service';
import { MockDataService } from '../../../services/mock-data.service';
import { selectUser } from '../../../store/auth/auth.selectors';
import { PopupService } from '../../../shared/services/popup.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="staff-dashboard">
      <h1>Complaint Management</h1>
      <p class="subtitle">View and manage complaints assigned to you, and pick up new ones in your category.</p>

      <mat-tab-group>
        <mat-tab label="My Complaints">
          <div class="section" *ngIf="isLoading; else myComplaintsTpl">
            <mat-spinner></mat-spinner>
          </div>
          <ng-template #myComplaintsTpl>
            <div *ngIf="assignedComplaints.length === 0" class="empty-state">No complaints assigned yet.</div>
            <div class="cards">
              <mat-card *ngFor="let c of assignedComplaints" class="complaint-card">
                <mat-card-title>#{{c.complaintId}} • {{c.title || 'No Title'}}</mat-card-title>
                <mat-card-subtitle>
                  <span class="chip status" [ngClass]="c.status">{{ c.status | titlecase }}</span>
                  <span class="chip priority {{c.priority}}">{{ c.priority | titlecase }}</span>
                  <span class="chip category">{{ c.category | titlecase }}</span>
                </mat-card-subtitle>
                <mat-card-content>
                  <p class="description">{{ c.description }}</p>
                  <div class="meta">
                    <span>Customer: {{ c.customerId }}</span>
                    <span>Submitted: {{ c.createdAt | date:'medium' }}</span>
                  </div>
                  <div class="actions-log" *ngIf="c.actions?.length">
                    <h4>Actions</h4>
                    <div class="action" *ngFor="let a of c.actions">
                      <mat-icon>history</mat-icon>
                      <div>
                        <div><strong>{{ a.type | titlecase }}</strong> • {{ a.createdAt | date:'short' }}</div>
                        <div>{{ a.message }}</div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
                <mat-divider></mat-divider>
                <mat-card-actions>
                  <button mat-stroked-button color="primary" (click)="updateStatus(c, ComplaintStatus.ACTIVE)" *ngIf="c.status === ComplaintStatus.ACTIVE">Mark Active</button>
                  <button mat-stroked-button color="accent" (click)="promptAddAction(c)">Add Action</button>
                  <button mat-raised-button color="primary" (click)="promptResolve(c)">Resolve</button>
                </mat-card-actions>
              </mat-card>
            </div>
          </ng-template>
        </mat-tab>

        <mat-tab label="Unassigned">
          <div class="section" *ngIf="isLoading; else unassignedTpl">
            <mat-spinner></mat-spinner>
          </div>
          <ng-template #unassignedTpl>
            <div *ngIf="unassignedComplaints.length === 0" class="empty-state">No unassigned complaints in your category.</div>
            <div class="cards">
              <mat-card *ngFor="let c of unassignedComplaints" class="complaint-card">
                <mat-card-title>#{{c.complaintId}} • {{c.title || 'No Title'}}</mat-card-title>
                <mat-card-subtitle>
                  <span class="chip priority {{c.priority}}">{{ c.priority | titlecase }}</span>
                  <span class="chip category">{{ c.category | titlecase }}</span>
                </mat-card-subtitle>
                <mat-card-content>
                  <p class="description">{{ c.description }}</p>
                  <div class="meta">
                    <span>Customer: {{ c.customerId }}</span>
                    <span>Submitted: {{ c.createdAt | date:'medium' }}</span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" (click)="assignToMe(c)">Assign to me</button>
                </mat-card-actions>
              </mat-card>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .staff-dashboard { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .subtitle { color: #666; margin-bottom: 16px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .complaint-card .chip { padding: 2px 10px; border-radius: 12px; font-size: 12px; margin-right: 6px; }
    .chip.priority.low { background: #f1f8e9; color: #558b2f; }
    .chip.priority.medium { background: #fff8e1; color: #f9a825; }
    .chip.priority.high { background: #ffebee; color: #c62828; }
    .chip.category { background: #f5f5f5; color: #666; }
    .chip.status.ACTIVE { background: #e3f2fd; color: #1976d2; }
    .chip.status.RESOLVED { background: #e8f5e8; color: #2e7d32; }
    .description { color: #333; }
    .meta { display: flex; gap: 12px; color: #777; font-size: 12px; margin-top: 8px; }
    .action { display: flex; gap: 8px; align-items: flex-start; margin: 6px 0; }
    .empty-state { color: #666; padding: 24px 0; }
  `]
})
export class StaffDashboardComponent implements OnInit {
  assignedComplaints: Complaint[] = [];
  unassignedComplaints: Complaint[] = [];
  isLoading = true;
  staffId: string | null = null;
  private customerNameById: Record<string, string> = {};
  
  // Make enum available in template
  ComplaintStatus = ComplaintStatus;

  constructor(
    private store: Store,
    private complaintService: ComplaintService,
    private mockData: MockDataService,
    private snackBar: MatSnackBar,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).subscribe(user => {
      if (!user) { return; }
      this.staffId = user.id;
      // build user name map
      this.mockData.getUsers().forEach(u => {
        this.customerNameById[u.id] = `${u.firstName} ${u.lastName}`;
      });
      // Map expertise from email convention for demo: billing -> BILLING, maintenance -> ROOM/SERVICE
      const category: ComplaintCategory = user.email.includes('billing') ? ComplaintCategory.BILLING : ComplaintCategory.ROOM;

      this.reloadData(category);
    });
  }

  private reloadData(category: ComplaintCategory): void {
    if (!this.staffId) { return; }
    this.isLoading = true;
    this.complaintService.getComplaintsAssignedToStaff(this.staffId).subscribe((my: Complaint[]) => {
      this.assignedComplaints = my.sort((a: Complaint, b: Complaint) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.complaintService.getComplaintsByCategoryForUnassigned(category).subscribe((unassigned: Complaint[]) => {
        this.unassignedComplaints = unassigned.sort((a: Complaint, b: Complaint) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      });
    });
  }

  getCustomerName(customerId: string): string {
    return this.customerNameById[customerId] || customerId;
  }

  assignToMe(complaint: Complaint): void {
    if (!this.staffId) { return; }
    this.complaintService.assignComplaint(complaint.complaintId, this.staffId).subscribe((updated: any) => {
      this.snackBar.open(`Assigned complaint #${updated.complaintId}`, 'Close', { duration: 3000 });
      // Re-filter lists
      const category = updated.category;
      this.reloadData(category);
    });
  }

  promptAddAction(complaint: Complaint): void {
    this.popupService.promptSimple(
      'Describe the action/communication/internal note:',
      'Add Action',
      'Enter action details...'
    ).subscribe(message => {
      if (message && this.staffId) {
        this.complaintService.addAction(complaint.complaintId, this.staffId, ComplaintActionType.STEP, message).subscribe((updated: any) => {
          this.snackBar.open('Action logged', 'Close', { duration: 2000 });
          const category = updated.category;
          this.reloadData(category);
        });
      }
    });
  }

  promptResolve(complaint: Complaint): void {
    this.popupService.promptMultiline(
      'Resolution details:',
      'Resolve Complaint',
      'Enter resolution details...'
    ).subscribe(message => {
      if (message) {
        this.complaintService.resolveComplaint(complaint.complaintId, message).subscribe((updated: any) => {
          this.snackBar.open(`Complaint #${updated.complaintId} marked resolved`, 'Close', { duration: 3000 });
          const category = updated.category;
          this.reloadData(category);
        });
      }
    });
  }

  updateStatus(complaint: Complaint, status: ComplaintStatus): void {
    this.complaintService.updateStatus(complaint.complaintId, status).subscribe((updated: any) => {
      this.snackBar.open(`Status updated to ${updated.status}`, 'Close', { duration: 2000 });
      const category = updated.category;
      this.reloadData(category);
    });
  }
}


