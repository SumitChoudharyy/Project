import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Room, RoomType, SearchCriteria } from '../../../models/room.model';
import { BookingService } from '../../../services/booking.service';
import { RoomService } from '../../../services/room.service';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateBookingComponent, CreateBookingData } from '../create-booking/create-booking.component';

@Component({
  selector: 'app-search-rooms',
  standalone: true,
  imports: [SharedModule, LoadingSpinnerComponent, MatDialogModule],
  template: `
    <div class="search-container">
      <!-- Search Form -->
      <mat-card class="search-form-card">
        <mat-card-header>
          <mat-card-title>Find Your Perfect Room</mat-card-title>
          <mat-card-subtitle>Search by criteria or browse all available rooms</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Check-in Date</mat-label>
                <input matInput [matDatepicker]="checkInPicker" formControlName="checkInDate" [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="checkInPicker"></mat-datepicker-toggle>
                <mat-datepicker #checkInPicker></mat-datepicker>
                <mat-error *ngIf="searchForm.get('checkInDate')?.hasError('required')">
                  Check-in date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Check-out Date</mat-label>
                <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOutDate" [min]="searchForm.get('checkInDate')?.value || minDate">
                <mat-datepicker-toggle matSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
                <mat-datepicker #checkOutPicker></mat-datepicker>
                <mat-error *ngIf="searchForm.get('checkOutDate')?.hasError('required')">
                  Check-out date is required
                </mat-error>
                <mat-error *ngIf="searchForm.get('checkOutDate')?.hasError('dateRange')">
                  Check-out date must be after check-in date
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="guests-field">
                <mat-label>Guests</mat-label>
                <mat-select formControlName="guests">
                  <mat-option [value]="1">1 Guest</mat-option>
                  <mat-option [value]="2">2 Guests</mat-option>
                  <mat-option [value]="3">3 Guests</mat-option>
                  <mat-option [value]="4">4 Guests</mat-option>
                  <mat-option [value]="5">5+ Guests</mat-option>
                </mat-select>
                <mat-error *ngIf="searchForm.get('guests')?.hasError('required')">
                  Number of guests is required
                </mat-error>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="searchForm.invalid || isSearching" class="search-button">
                <span *ngIf="!isSearching">Search</span>
                <mat-spinner *ngIf="isSearching" diameter="20"></mat-spinner>
              </button>
              <button mat-stroked-button type="button" (click)="showAllRooms()" [disabled]="isSearching" class="show-all-button">
                Show All Rooms
              </button>
            </div>

            <!-- Advanced Filters -->
            <mat-expansion-panel class="filters-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>Advanced Filters</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="filters-content">
                <div class="filter-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Room Type</mat-label>
                    <mat-select formControlName="roomType">
                      <mat-option value="">Any Type</mat-option>
                      <mat-option value="single">Single</mat-option>
                      <mat-option value="double">Double</mat-option>
                      <mat-option value="suite">Suite</mat-option>
                      <mat-option value="deluxe">Deluxe</mat-option>
                      <mat-option value="presidential">Presidential</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="filter-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Min Price</mat-label>
                    <input matInput type="number" formControlName="minPrice" placeholder="$0">
                    <span matPrefix>$</span>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Max Price</mat-label>
                    <input matInput type="number" formControlName="maxPrice" placeholder="$1000">
                    <span matPrefix>$</span>
                  </mat-form-field>
                </div>

                <div class="amenities-section">
                  <h4>Amenities</h4>
                  <div class="amenities-grid">
                    <mat-checkbox *ngFor="let amenity of availableAmenities" 
                                  [value]="amenity"
                                  (change)="onAmenityChange(amenity, $event)">
                      {{ amenity }}
                    </mat-checkbox>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Results Section -->
      <div class="results-section" *ngIf="hasSearched">
        <div class="results-header">
          <h2>Available Rooms</h2>
          <div class="results-count" *ngIf="!isSearching">
            {{ searchResults.length }} room(s) available
          </div>
          <div class="sort-options" *ngIf="searchResults.length > 0">
            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort by</mat-label>
              <mat-select [(value)]="sortBy" (selectionChange)="onSortChange()">
                <mat-option value="price-asc">Price: Low to High</mat-option>
                <mat-option value="price-desc">Price: High to Low</mat-option>
                <mat-option value="type">Room Type</mat-option>
                <mat-option value="capacity">Capacity</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div *ngIf="isSearching" class="loading-section">
          <app-loading-spinner message="Searching for available rooms..."></app-loading-spinner>
        </div>

        <div *ngIf="!isSearching && searchResults.length === 0" class="no-results">
          <mat-icon>search_off</mat-icon>
          <h3>No rooms found</h3>
          <p>Try adjusting your search criteria or dates</p>
        </div>

        <div *ngIf="!isSearching && searchResults.length > 0" class="rooms-grid">
          <mat-card *ngFor="let room of searchResults" class="room-card">
            <div class="room-image" [style.background-image]="'url(' + (room.images && room.images.length > 0 ? room.images[0] : '/assets/images/default-room.jpg') + ')'"></div>
            
            <mat-card-content class="room-content">
              <div class="room-header">
                <h3>{{ room.category | titlecase }} Room</h3>
                <div class="room-number">Room {{ room.roomNumber }}</div>
              </div>
              
              <p class="room-description">{{ room.description || 'Comfortable and well-appointed room for your stay.' }}</p>
              
              <div class="room-details">
                <div class="detail-item">
                  <mat-icon>people</mat-icon>
                  <span>Up to {{ room.capacity }} guests</span>
                </div>
                <div class="detail-item">
                  <mat-icon>layers</mat-icon>
                  <span>Floor {{ room.floor || '1' }}</span>
                </div>
              </div>

              <div class="amenities">
                <mat-chip-set>
                  <mat-chip *ngFor="let amenity of room.amenities.slice(0, 4)">
                    {{ amenity }}
                  </mat-chip>
                  <mat-chip *ngIf="room.amenities.length > 4" class="more-amenities">
                    +{{ room.amenities.length - 4 }} more
                  </mat-chip>
                </mat-chip-set>
              </div>

              <div class="price-section">
                <div class="price">
                  <span class="price-amount">\${{ room.pricePerNight }}</span>
                  <span class="price-period">per night</span>
                </div>
                <div class="total-price" *ngIf="getTotalNights() > 0">
                  Total: \${{ room.pricePerNight * getTotalNights() }} for {{ getTotalNights() }} night(s)
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="viewRoomDetails(room)">View Details</button>
              <button mat-raised-button color="primary" (click)="bookRoom(room)">Book Now</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .search-form-card {
      margin-bottom: 32px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .date-field {
      flex: 1;
    }

    .guests-field {
      flex: 0 0 150px;
    }

    .search-button {
      flex: 0 0 120px;
      height: 56px;
      margin-top: 8px;
    }

    .show-all-button {
      flex: 0 0 140px;
      height: 56px;
      margin-top: 8px;
    }

    .filters-panel {
      margin-top: 16px;
    }

    .filters-content {
      padding: 16px 0;
    }

    .filter-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
    }

    .amenities-section h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }

    .results-section {
      margin-top: 32px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .results-header h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 400;
    }

    .results-count {
      color: #666;
      font-size: 16px;
    }

    .sort-field {
      width: 200px;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    .room-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
    }

    .room-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .room-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      background-color: #f5f5f5;
      background-repeat: no-repeat;
    }

    .room-content {
      padding: 20px;
    }

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .room-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .room-number {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .room-description {
      color: #666;
      line-height: 1.5;
      margin: 0 0 16px 0;
    }

    .room-details {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #666;
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .amenities {
      margin-bottom: 20px;
    }

    .more-amenities {
      background-color: #f5f5f5 !important;
      color: #666 !important;
    }

    .price-section {
      border-top: 1px solid #eee;
      padding-top: 16px;
    }

    .price {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 4px;
    }

    .price-amount {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }

    .price-period {
      color: #666;
      font-size: 14px;
    }

    .total-price {
      font-size: 14px;
      color: #666;
    }

    .loading-section {
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .search-button,
      .show-all-button {
        flex: 1;
        margin-top: 16px;
      }

      .results-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .rooms-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SearchRoomsComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: Room[] = [];
  isSearching = false;
  hasSearched = false;
  sortBy = 'price-asc';
  minDate = new Date();
  
  availableAmenities = ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Living Area', 'Jacuzzi'];
  selectedAmenities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      roomType: [''],
      minPrice: [''],
      maxPrice: [''],
      amenities: [[]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.searchForm.patchValue({
      checkInDate: today,
      checkOutDate: tomorrow
    });

    // Load all rooms initially to show available options
    this.loadAllRooms();
  }

  private loadAllRooms(): void {
    this.isSearching = true;
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.searchResults = rooms;
        this.sortResults();
        this.isSearching = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  showAllRooms(): void {
    // Reset form filters
    this.searchForm.patchValue({
      roomType: '',
      minPrice: '',
      maxPrice: '',
      amenities: []
    });
    this.selectedAmenities = [];
    
    // Load all rooms
    this.loadAllRooms();
  }

  dateRangeValidator(group: FormGroup) {
    const checkIn = group.get('checkInDate')?.value;
    const checkOut = group.get('checkOutDate')?.value;
    
    if (checkIn && checkOut && checkOut <= checkIn) {
      group.get('checkOutDate')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    
    return null;
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.isSearching = true;
      this.hasSearched = true;
      
      // Call getAllRooms API to get all rooms
      this.roomService.getAllRooms().subscribe({
        next: (rooms) => {
          // Apply client-side filtering based on form criteria
          this.searchResults = this.filterRooms(rooms);
          this.sortResults();
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error fetching rooms:', error);
          this.searchResults = [];
          this.isSearching = false;
        }
      });
    }
  }

  private filterRooms(rooms: Room[]): Room[] {
    const formValue = this.searchForm.value;
    
    return rooms.filter(room => {
      // Filter by room type
      if (formValue.roomType && room.category !== formValue.roomType) {
        return false;
      }
      
      // Filter by price range
      if (formValue.minPrice && room.pricePerNight < formValue.minPrice) {
        return false;
      }
      if (formValue.maxPrice && room.pricePerNight > formValue.maxPrice) {
        return false;
      }
      
      // Filter by amenities
      if (this.selectedAmenities.length > 0) {
        const hasAllAmenities = this.selectedAmenities.every(amenity => 
          room.amenities?.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }
      
      // Filter by guest capacity
      if (formValue.guests && room.capacity < formValue.guests) {
        return false;
      }
      
      return true;
    });
  }

  onAmenityChange(amenity: string, event: any): void {
    if (event.checked) {
      this.selectedAmenities.push(amenity);
    } else {
      const index = this.selectedAmenities.indexOf(amenity);
      if (index > -1) {
        this.selectedAmenities.splice(index, 1);
      }
    }
  }

  onSortChange(): void {
    this.sortResults();
  }

  private sortResults(): void {
    switch (this.sortBy) {
      case 'price-asc':
        this.searchResults.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price-desc':
        this.searchResults.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'type':
        this.searchResults.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'capacity':
        this.searchResults.sort((a, b) => b.capacity - a.capacity);
        break;
    }
  }

  getTotalNights(): number {
    const checkIn = this.searchForm.get('checkInDate')?.value;
    const checkOut = this.searchForm.get('checkOutDate')?.value;
    
    if (checkIn && checkOut) {
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    return 0;
  }

  viewRoomDetails(room: Room): void {
    // TODO: Navigate to room details page
    console.log('View details for room:', room);
  }

  bookRoom(room: Room): void {
    const dialogData: CreateBookingData = {
      room,
      checkInDate: this.searchForm.get('checkInDate')?.value,
      checkOutDate: this.searchForm.get('checkOutDate')?.value,
      guests: this.searchForm.get('guests')?.value
    };

    const dialogRef = this.dialog.open(CreateBookingComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Booking created:', result);
        // The dialog will handle navigation to bookings page
      }
    });
  }
}