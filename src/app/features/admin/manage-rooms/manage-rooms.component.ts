import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { Room, RoomApiRequest } from '../../../models/room.model';
import { RoomService } from '../../../services/room.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PopupService } from '../../../shared/services/popup.service';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    LoadingSpinnerComponent
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
                <h3>{{ roomStats.total }}</h3>
                <p>Total Rooms</p>
              </div>
              <div class="stat-item">
                <h3>{{ roomStats.available }}</h3>
                <p>Available</p>
              </div>
              <div class="stat-item">
                <h3>{{ roomStats.occupied }}</h3>
                <p>Occupied</p>
              </div>
            </div>

            <div class="actions-row">
              <button mat-raised-button color="primary" (click)="openAddRoomDialog()">
                <mat-icon>add</mat-icon>
                Add New Room
              </button>
              <button mat-stroked-button (click)="loadRooms()">
                <mat-icon>refresh</mat-icon>
                Refresh
              </button>
            </div>
          </div>

          <div class="rooms-table">
            <h3>Room List</h3>
            
            <div *ngIf="isLoading" class="loading-section">
              <app-loading-spinner></app-loading-spinner>
            </div>

            <div *ngIf="!isLoading && rooms.length === 0" class="no-rooms">
              <p>No rooms found. Add your first room to get started.</p>
            </div>

            <div *ngIf="!isLoading && rooms.length > 0" class="table-container">
              <table mat-table [dataSource]="rooms" class="rooms-table">
                <!-- Room Number Column -->
                <ng-container matColumnDef="roomNumber">
                  <th mat-header-cell *matHeaderCellDef>Room Number</th>
                  <td mat-cell *matCellDef="let room">{{ room.roomNumber }}</td>
                </ng-container>

                <!-- Room ID Column -->
                <ng-container matColumnDef="roomId">
                  <th mat-header-cell *matHeaderCellDef>Room ID</th>
                  <td mat-cell *matCellDef="let room">{{ room.id }}</td>
                </ng-container>

                <!-- Category Column -->
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let room">{{ room.category }}</td>
                </ng-container>

                <!-- Price Column -->
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Price/Night</th>
                  <td mat-cell *matCellDef="let room">{{ room.pricePerNight }}</td>
                </ng-container>

                <!-- Capacity Column -->
                <ng-container matColumnDef="capacity">
                  <th mat-header-cell *matHeaderCellDef>Capacity</th>
                  <td mat-cell *matCellDef="let room">{{ room.capacity }} guests</td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let room">
                    <span class="status-badge" [class.available]="room.available" [class.occupied]="!room.available">
                      {{ room.available ? 'Available' : 'Occupied' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Amenities Column -->
                <ng-container matColumnDef="amenities">
                  <th mat-header-cell *matHeaderCellDef>Amenities</th>
                  <td mat-cell *matCellDef="let room">
                    <div class="amenities-chips">
                      <mat-chip *ngFor="let amenity of room.amenities.slice(0, 3)" class="amenity-chip">
                        {{ amenity }}
                      </mat-chip>
                      <span *ngIf="room.amenities.length > 3" class="more-amenities">
                        +{{ room.amenities.length - 3 }} more
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let room">
                    <button mat-icon-button color="primary" (click)="editRoom(room)" matTooltip="Edit Room">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteRoom(room)" matTooltip="Delete Room">
                      <mat-icon>delete</mat-icon>
                    </button>
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

    <!-- Add/Edit Room Dialog -->
    <div class="dialog-container" *ngIf="showDialog">
      <div class="dialog-overlay" (click)="closeDialog()"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>{{ isEditing ? 'Edit Room' : 'Add New Room' }}</h2>
          <button mat-icon-button (click)="closeDialog()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="roomForm" (ngSubmit)="onSubmit()" class="room-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Room Number</mat-label>
              <input matInput formControlName="roomNumber" placeholder="e.g., 101">
              <mat-error *ngIf="roomForm.get('roomNumber')?.hasError('required')">
                Room number is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="Standard">Standard</mat-option>
                <mat-option value="Deluxe">Deluxe</mat-option>
                <mat-option value="Suite">Suite</mat-option>
                <mat-option value="Executive">Executive</mat-option>
                <mat-option value="Presidential">Presidential</mat-option>
              </mat-select>
              <mat-error *ngIf="roomForm.get('category')?.hasError('required')">
                Category is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Price per Night</mat-label>
              <input matInput type="number" formControlName="pricePerNight" placeholder="0.00">
              <span matPrefix>$</span>
              <mat-error *ngIf="roomForm.get('pricePerNight')?.hasError('required')">
                Price is required
              </mat-error>
              <mat-error *ngIf="roomForm.get('pricePerNight')?.hasError('min')">
                Price must be positive
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Capacity</mat-label>
              <input matInput type="number" formControlName="capacity" placeholder="1">
              <mat-error *ngIf="roomForm.get('capacity')?.hasError('required')">
                Capacity is required
              </mat-error>
              <mat-error *ngIf="roomForm.get('capacity')?.hasError('min')">
                Capacity must be at least 1
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-checkbox formControlName="available" class="availability-checkbox">
              Room is available
            </mat-checkbox>
          </div>

          <div class="form-section">
            <h4>Amenities</h4>
            <div class="amenities-grid">
              <mat-checkbox 
                *ngFor="let amenity of availableAmenities" 
                [value]="amenity"
                (change)="onAmenityChange($event, amenity)"
                [checked]="selectedAmenities.includes(amenity)"
                class="amenity-checkbox">
                {{ amenity }}
              </mat-checkbox>
            </div>
          </div>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeDialog()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="roomForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">{{ isEditing ? 'Update' : 'Add' }} Room</span>
              <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            </button>
          </div>
        </form>
      </div>
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
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-item h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #1976d2;
    }

    .stat-item p {
      margin: 0;
      color: #666;
    }

    .actions-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .rooms-table h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
    }

    .loading-section {
      padding: 40px 0;
      text-align: center;
    }

    .no-rooms {
      text-align: center;
      padding: 40px 0;
      color: #666;
    }

    .table-container {
      overflow-x: auto;
    }

    .rooms-table {
      width: 100%;
      margin-top: 16px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.available {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.occupied {
      background: #ffebee;
      color: #c62828;
    }

    .amenities-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .amenity-chip {
      font-size: 11px;
      height: 24px;
    }

    .more-amenities {
      font-size: 11px;
      color: #666;
      margin-left: 4px;
    }

    /* Dialog Styles */
    .dialog-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }

    .dialog-content {
      position: relative;
      background: white;
      border-radius: 8px;
      padding: 0;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 24px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .room-form {
      padding: 0 24px 24px 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      width: 100%;
    }

    .availability-checkbox {
      margin-bottom: 16px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .amenity-checkbox {
      display: block;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .amenities-grid {
        grid-template-columns: 1fr;
      }

      .dialog-content {
        width: 95%;
        margin: 20px;
      }
    }
  `]
})
export class ManageRoomsComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  isLoading = false;
  roomStats = { total: 0, available: 0, occupied: 0 };
  
  // Dialog state
  showDialog = false;
  isEditing = false;
  editingRoomId: string | null = null;
  isSubmitting = false;
  
  // Form
  roomForm: FormGroup;
  selectedAmenities: string[] = [];
  
  // Available amenities
  availableAmenities = [
    'WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 
    'Room Service', 'Work Desk', 'Safe', 'Coffee Maker',
    'Living Area', 'Kitchen', 'Ocean View', 'Mountain View'
  ];
  
  // Table columns
  displayedColumns = ['roomNumber', 'roomId', 'category', 'price', 'capacity', 'status', 'amenities', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private popupService: PopupService
  ) {
    this.roomForm = this.fb.group({
      roomNumber: ['', Validators.required],
      category: ['Standard', Validators.required],
      pricePerNight: [0, [Validators.required, Validators.min(0.01)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      available: [true]
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRooms(): void {
    this.isLoading = true;
    console.log('Loading rooms from API...');
    this.roomService.getAllRooms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          console.log('Rooms loaded successfully:', rooms.length, 'rooms');
          this.rooms = rooms;
          this.loadRoomStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading rooms:', error);
          let errorMessage = 'An unexpected error occurred';
          
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(
            `Failed to load rooms: ${errorMessage}`, 
            'Close', 
            { duration: 5000 }
          );
          this.isLoading = false;
        }
      });
  }

  loadRoomStats(): void {
    this.roomService.getRoomStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.roomStats = stats;
        },
        error: (error) => {
          console.error('Error loading room stats:', error);
        }
      });
  }

  openAddRoomDialog(): void {
    this.isEditing = false;
    this.editingRoomId = null;
    this.selectedAmenities = [];
    this.roomForm.reset({
      roomNumber: '',
      category: 'Standard',
      pricePerNight: 0,
      capacity: 1,
      available: true
    });
    this.showDialog = true;
  }

  editRoom(room: Room): void {
    this.isEditing = true;
    this.editingRoomId = room.id; // Store room ID instead of room number
    this.selectedAmenities = [...room.amenities];
    
    this.roomForm.patchValue({
      roomNumber: room.roomNumber,
      category: room.category,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      available: room.available
    });
    
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.roomForm.reset();
    this.selectedAmenities = [];
  }

  onAmenityChange(event: any, amenity: string): void {
    if (event.checked) {
      this.selectedAmenities.push(amenity);
    } else {
      const index = this.selectedAmenities.indexOf(amenity);
      if (index > -1) {
        this.selectedAmenities.splice(index, 1);
      }
    }
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      this.isSubmitting = true;
      
      const roomData: RoomApiRequest = {
        roomNumber: this.roomForm.value.roomNumber,
        category: this.roomForm.value.category,
        pricePerNight: this.roomForm.value.pricePerNight,
        capacity: this.roomForm.value.capacity,
        available: this.roomForm.value.available,
        amenities: this.selectedAmenities
      };

      console.log('Submitting room data:', roomData);

      const operation = this.isEditing 
        ? this.roomService.updateRoom(this.editingRoomId!, roomData)
        : this.roomService.addRoom(roomData);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open(
            `Room ${this.isEditing ? 'updated' : 'added'} successfully`, 
            'Close', 
            { duration: 3000 }
          );
          this.closeDialog();
          this.loadRooms();
        },
        error: (error) => {
          console.error('Error saving room:', error);
          let errorMessage = 'An unexpected error occurred';
          
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(
            `Failed to ${this.isEditing ? 'update' : 'add'} room: ${errorMessage}`, 
            'Close', 
            { duration: 5000 }
          );
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteRoom(room: Room): void {
    this.popupService.confirmDanger(
      `Are you sure you want to delete room ${room.roomNumber}?`,
      'Delete Room'
    ).subscribe(confirmed => {
      if (confirmed) {
        console.log('=== DELETE ROOM DEBUG INFO ===');
        console.log('Room object:', room);
        console.log('Room ID (for API):', room.id);
        console.log('Room Number (display):', room.roomNumber);
        console.log('API endpoint will be:', `/api/rooms/delete/${room.id}`);
        console.log('================================');
        
        this.roomService.deleteRoom(room.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Room deleted successfully', 'Close', { duration: 3000 });
              this.loadRooms();
            },
            error: (error) => {
              console.error('Error deleting room:', error);
              let errorMessage = 'An unexpected error occurred';
              
              if (typeof error === 'string') {
                errorMessage = error;
              } else if (error?.message) {
                errorMessage = error.message;
              }
              
              this.snackBar.open(
                `Failed to delete room: ${errorMessage}`, 
                'Close', 
                { duration: 5000 }
              );
            }
          });
      }
    });
  }
} 