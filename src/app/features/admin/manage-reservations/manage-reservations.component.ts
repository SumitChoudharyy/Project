import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { Booking, BookingStatus, PaymentStatus } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PopupService } from '../../../shared/services/popup.service';

@Component({
  selector: 'app-manage-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="manage-reservations-container">
      <div class="page-header">
        <h1>Manage Reservations</h1>
        <p>View and manage all hotel reservations</p>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="reservations-overview">
            <div class="stats-row">
              <div class="stat-item">
                <h3>{{ stats.active }}</h3>
                <p>Active Reservations</p>
              </div>
              <div class="stat-item">
                <h3>{{ stats.pending }}</h3>
                <p>Pending</p>
              </div>
              <div class="stat-item">
                <h3>{{ stats.completed }}</h3>
                <p>Completed</p>
              </div>
              <div class="stat-item">
                <h3>{{ stats.cancelled }}</h3>
                <p>Cancelled</p>
              </div>
            </div>

            <div class="actions-row">
              <button mat-raised-button color="primary" (click)="openNewReservationDialog()">
                <mat-icon>add</mat-icon>
                New Reservation
              </button>
              <button mat-stroked-button (click)="refreshReservations()" [disabled]="isLoading">
                <mat-icon>refresh</mat-icon>
                Refresh
              </button>
              <button mat-stroked-button (click)="exportToCSV()" [disabled]="filteredReservations.length === 0">
                <mat-icon>download</mat-icon>
                Export CSV
              </button>
            </div>

            <!-- Filters -->
            <div class="filters-section">
              <form [formGroup]="filterForm" class="filter-form">
                <div class="filter-row">
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="">All Statuses</mat-option>
                      <mat-option *ngFor="let status of bookingStatuses" [value]="status">
                        {{ status | titlecase }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Payment Status</mat-label>
                    <mat-select formControlName="paymentStatus">
                      <mat-option value="">All Payment Statuses</mat-option>
                      <mat-option *ngFor="let status of paymentStatuses" [value]="status">
                        {{ status | titlecase }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Start Date</mat-label>
                    <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>End Date</mat-label>
                    <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                    <mat-datepicker #endPicker></mat-datepicker>
                  </mat-form-field>

                  <button mat-raised-button color="accent" (click)="applyFilters()" [disabled]="isLoading">
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="reservations-table">
            <div *ngIf="isLoading" class="loading-section">
              <app-loading-spinner message="Loading reservations..."></app-loading-spinner>
            </div>

            <div *ngIf="!isLoading && filteredReservations.length === 0" class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <h3>No reservations found</h3>
              <p>No reservations match your current filters</p>
            </div>

            <div *ngIf="!isLoading && filteredReservations.length > 0" class="table-container">
              <!-- Bulk Actions -->
              <div class="bulk-actions" *ngIf="selectedCount > 0">
                <span class="selected-count">{{ selectedCount }} booking(s) selected</span>
                <button mat-raised-button color="accent" (click)="bulkConfirm()" 
                        [disabled]="!canBulkConfirm()">
                  <mat-icon>check_circle</mat-icon>
                  Confirm Selected
                </button>
                <button mat-raised-button color="warn" (click)="bulkCancel()">
                  <mat-icon>cancel</mat-icon>
                  Cancel Selected
                </button>
              </div>

              <table mat-table [dataSource]="filteredReservations" class="reservations-table">
                <!-- Selection Column -->
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox 
                      (change)="$event ? masterToggle() : null"
                      [checked]="isAllSelected"
                      [indeterminate]="!isAllSelected && selectedCount > 0">
                    </mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let booking">
                    <mat-checkbox 
                      (click)="$event.stopPropagation()"
                      (change)="onSelectionChange(booking.id, $event.checked)"
                      [checked]="selection.has(booking.id)"
                      [disabled]="!canSelect(booking)">
                    </mat-checkbox>
                  </td>
                </ng-container>

                <!-- Booking ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>Booking ID</th>
                  <td mat-cell *matCellDef="let booking">{{ booking.id }}</td>
                </ng-container>

                <!-- Customer Column -->
                <ng-container matColumnDef="customerId">
                  <th mat-header-cell *matHeaderCellDef>Customer ID</th>
                  <td mat-cell *matCellDef="let booking">{{ booking.customerId }}</td>
                </ng-container>

                <!-- Room Column -->
                <ng-container matColumnDef="roomId">
                  <th mat-header-cell *matHeaderCellDef>Room ID</th>
                  <td mat-cell *matCellDef="let booking">{{ booking.roomId }}</td>
                </ng-container>

                <!-- Check-in Date Column -->
                <ng-container matColumnDef="checkInDate">
                  <th mat-header-cell *matHeaderCellDef>Check-in</th>
                  <td mat-cell *matCellDef="let booking">{{ booking.checkInDate | date:'shortDate' }}</td>
                </ng-container>

                <!-- Check-out Date Column -->
                <ng-container matColumnDef="checkOutDate">
                  <th mat-header-cell *matHeaderCellDef>Check-out</th>
                  <td mat-cell *matCellDef="let booking">{{ booking.checkOutDate | date:'shortDate' }}</td>
                </ng-container>

                <!-- Guests Column -->
                <ng-container matColumnDef="guests">
                  <th mat-header-cell *matHeaderCellDef>Guests</th>
                  <td mat-cell *matCellDef="let booking">{{ booking.guests }}</td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let booking">
                    <mat-chip [ngClass]="'status-' + booking.status">
                      {{ booking.status | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Payment Status Column -->
                <ng-container matColumnDef="paymentStatus">
                  <th mat-header-cell *matHeaderCellDef>Payment</th>
                  <td mat-cell *matCellDef="let booking">
                    <mat-chip [ngClass]="'payment-' + booking.paymentStatus">
                      {{ booking.paymentStatus | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Total Amount Column -->
                <ng-container matColumnDef="totalAmount">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let booking">\${{ booking.totalAmount }}</td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let booking">
                    <div class="action-buttons">
                      <button mat-icon-button color="primary" (click)="viewBookingDetails(booking)" matTooltip="View Details">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" (click)="editBooking(booking)" matTooltip="Edit Booking">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="cancelBooking(booking)" matTooltip="Cancel Booking">
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .manage-reservations-container {
      padding: 24px;
      max-width: 1400px;
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

    .reservations-overview {
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

    .filters-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .filter-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 200px;
    }

    .reservations-table {
      margin-top: 24px;
    }

    .table-container {
      overflow-x: auto;
    }

    .reservations-table {
      width: 100%;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .bulk-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
      border: 1px solid #bbdefb;
    }

    .selected-count {
      font-weight: 500;
      color: #1976d2;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-confirmed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-checked_in {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-checked_out {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .status-cancelled {
      background-color: #ffebee;
      color: #c62828;
    }

    .payment-pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .payment-paid {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .payment-failed {
      background-color: #ffebee;
      color: #c62828;
    }

    .loading-section {
      padding: 40px 0;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
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
      color: #666;
    }

    @media (max-width: 768px) {
      .manage-reservations-container {
        padding: 16px;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .actions-row {
        flex-direction: column;
      }

      .filter-row {
        flex-direction: column;
      }

      .filter-field {
        min-width: 100%;
      }
    }
  `]
})
export class ManageReservationsComponent implements OnInit, OnDestroy {
  allReservations: Booking[] = [];
  filteredReservations: Booking[] = [];
  isLoading = false;
  displayedColumns: string[] = ['select', 'id', 'customerId', 'roomId', 'checkInDate', 'checkOutDate', 'guests', 'status', 'paymentStatus', 'totalAmount', 'actions'];
  
  filterForm: FormGroup;
  stats = {
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  };

  // Selection state
  selection = new Map<string, boolean>();
  isAllSelected = false;
  selectedCount = 0;

  bookingStatuses = Object.values(BookingStatus);
  paymentStatuses = Object.values(PaymentStatus);

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private popupService: PopupService
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      paymentStatus: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadReservations();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReservations(): void {
    this.isLoading = true;
    this.bookingService.getAllBookings().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (bookings) => {
        this.allReservations = bookings;
        this.filteredReservations = bookings;
        this.updateStats();
        this.isLoading = false;
        
        // Clear any existing selections
        this.selection.clear();
        this.selectedCount = 0;
        this.isAllSelected = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.snackBar.open('Failed to load reservations', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private updateStats(): void {
    const now = new Date();
    
    this.stats.active = this.allReservations.filter(b => 
      new Date(b.checkInDate) <= now && 
      new Date(b.checkOutDate) > now && 
      b.status === BookingStatus.CONFIRMED
    ).length;
    
    this.stats.pending = this.allReservations.filter(b => 
      b.status === BookingStatus.PENDING
    ).length;
    
    this.stats.completed = this.allReservations.filter(b => 
      b.status === BookingStatus.CHECKED_OUT
    ).length;
    
    this.stats.cancelled = this.allReservations.filter(b => 
      b.status === BookingStatus.CANCELLED
    ).length;
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredReservations = this.allReservations.filter(booking => {
      let matches = true;
      
      if (filters.status && booking.status !== filters.status) {
        matches = false;
      }
      
      if (filters.paymentStatus && booking.paymentStatus !== filters.paymentStatus) {
        matches = false;
      }
      
      if (filters.startDate && new Date(booking.checkInDate) < new Date(filters.startDate)) {
        matches = false;
      }
      
      if (filters.endDate && new Date(booking.checkOutDate) > new Date(filters.endDate)) {
        matches = false;
      }
      
      return matches;
    });

    // Clear selection when filters change
    this.selection.clear();
    this.selectedCount = 0;
    this.isAllSelected = false;
  }

  refreshReservations(): void {
    this.loadReservations();
  }

  openNewReservationDialog(): void {
    // TODO: Implement new reservation dialog
    this.snackBar.open('New reservation functionality coming soon', 'Close', { duration: 3000 });
  }

  viewBookingDetails(booking: Booking): void {
    // TODO: Implement view booking details dialog
    console.log('View booking details:', booking);
  }

  editBooking(booking: Booking): void {
    // TODO: Implement edit booking dialog
    console.log('Edit booking:', booking);
  }

  cancelBooking(booking: Booking): void {
    this.popupService.confirmDanger(
      `Are you sure you want to cancel booking #${booking.id}?`,
      'Cancel Booking'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.bookingService.cancelBooking(booking.id, 'Cancelled by admin').pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (updatedBooking) => {
            this.snackBar.open('Booking cancelled successfully', 'Close', { duration: 3000 });
            this.loadReservations(); // Refresh the list
          },
          error: (error) => {
            console.error('Error cancelling booking:', error);
            this.snackBar.open('Failed to cancel booking', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // Selection methods
  masterToggle(): void {
    if (this.isAllSelected) {
      this.selection.clear();
      this.selectedCount = 0;
    } else {
      this.filteredReservations.forEach(booking => {
        if (this.canSelect(booking)) {
          this.selection.set(booking.id, true);
        }
      });
      this.selectedCount = this.selection.size;
    }
    this.isAllSelected = !this.isAllSelected;
  }

  canSelect(booking: Booking): boolean {
    // Only allow selection of pending or confirmed bookings
    return booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;
  }

  canBulkConfirm(): boolean {
    // Check if any selected bookings can be confirmed
    return Array.from(this.selection.keys()).some(id => {
      const booking = this.filteredReservations.find(b => b.id === id);
      return booking && booking.status === BookingStatus.PENDING;
    });
  }

  bulkConfirm(): void {
    const selectedBookings = this.filteredReservations.filter(booking => 
      this.selection.has(booking.id) && booking.status === BookingStatus.PENDING
    );

    if (selectedBookings.length === 0) {
      this.snackBar.open('No pending bookings selected for confirmation', 'Close', { duration: 3000 });
      return;
    }

    this.popupService.confirmSimple(
      `Confirm ${selectedBookings.length} pending booking(s)?`,
      'Bulk Confirm Bookings'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.processBulkConfirm(selectedBookings);
      }
    });
  }

  bulkCancel(): void {
    const selectedBookings = this.filteredReservations.filter(booking => 
      this.selection.has(booking.id) && 
      (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED)
    );

    if (selectedBookings.length === 0) {
      this.snackBar.open('No cancellable bookings selected', 'Close', { duration: 3000 });
      return;
    }

    this.popupService.confirmDanger(
      `Cancel ${selectedBookings.length} booking(s)? This action cannot be undone.`,
      'Bulk Cancel Bookings'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.processBulkCancel(selectedBookings);
      }
    });
  }

  private processBulkConfirm(bookings: Booking[]): void {
    this.isLoading = true;
    let successCount = 0;
    let errorCount = 0;

    const confirmPromises = bookings.map(booking => 
      firstValueFrom(this.bookingService.updateBooking(booking.id, { 
        status: BookingStatus.CONFIRMED,
        updatedAt: new Date()
      }))
    );

    Promise.allSettled(confirmPromises).then(results => {
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          errorCount++;
        }
      });

      this.isLoading = false;
      this.selection.clear();
      this.selectedCount = 0;
      this.isAllSelected = false;

      if (successCount > 0) {
        this.snackBar.open(`${successCount} booking(s) confirmed successfully`, 'Close', { duration: 3000 });
        this.loadReservations();
      }
      
      if (errorCount > 0) {
        this.snackBar.open(`${errorCount} booking(s) failed to confirm`, 'Close', { duration: 3000 });
      }
    });
  }

  private processBulkCancel(bookings: Booking[]): void {
    this.isLoading = true;
    let successCount = 0;
    let errorCount = 0;

    const cancelPromises = bookings.map(booking => 
      firstValueFrom(this.bookingService.cancelBooking(booking.id, 'Bulk cancelled by admin'))
    );

    Promise.allSettled(cancelPromises).then(results => {
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          errorCount++;
        }
      });

      this.isLoading = false;
      this.selection.clear();
      this.selectedCount = 0;
      this.isAllSelected = false;

      if (successCount > 0) {
        this.snackBar.open(`${successCount} booking(s) cancelled successfully`, 'Close', { duration: 3000 });
        this.loadReservations();
      }
      
      if (errorCount > 0) {
        this.snackBar.open(`${errorCount} booking(s) failed to cancel`, 'Close', { duration: 3000 });
      }
    });
  }

  // Update selection count when filters change
  private updateSelectionCount(): void {
    this.selectedCount = this.selection.size;
    this.isAllSelected = this.selectedCount > 0 && 
                         this.selectedCount === this.filteredReservations.filter(b => this.canSelect(b)).length;
  }

  // Handle individual selection changes
  onSelectionChange(bookingId: string, checked: boolean): void {
    if (checked) {
      this.selection.set(bookingId, true);
    } else {
      this.selection.delete(bookingId);
    }
    this.updateSelectionCount();
  }

  exportToCSV(): void {
    if (this.filteredReservations.length === 0) {
      this.snackBar.open('No reservations to export', 'Close', { duration: 3000 });
      return;
    }

    const headers = [
      'Booking ID',
      'Customer ID',
      'Room ID',
      'Check-in Date',
      'Check-out Date',
      'Guests',
      'Status',
      'Payment Status',
      'Total Amount',
      'Special Requests',
      'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...this.filteredReservations.map(booking => [
        booking.id,
        booking.customerId,
        booking.roomId,
        booking.checkInDate.toISOString().split('T')[0],
        booking.checkOutDate.toISOString().split('T')[0],
        booking.guests,
        booking.status,
        booking.paymentStatus,
        booking.totalAmount,
        `"${(booking.specialRequests || '').replace(/"/g, '""')}"`,
        booking.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('CSV exported successfully', 'Close', { duration: 3000 });
  }
}
