import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { 
  Room, 
  RoomType, 
  RoomApiRequest, 
  RoomApiResponse, 
  RoomSearchParams,
  SearchCriteria 
} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly apiBaseUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  // API Integration Methods

  /**
   * Get all rooms from API
   */
  getAllRooms(): Observable<Room[]> {
    console.log('Fetching all rooms from API');
    return this.http.get<RoomApiResponse[]>(`${this.apiBaseUrl}/all`).pipe(
      map(rooms => {
        console.log('All rooms fetched successfully:', rooms.length, 'rooms');
        return rooms.map(room => this.mapApiResponseToRoom(room));
      }),
      catchError(error => {
        console.error('Error fetching all rooms:', error);
        if (error.status === 0) {
          return throwError(() => 'Unable to connect to server. Please check your connection.');
        } else {
          return throwError(() => 'Failed to fetch rooms. Please try again.');
        }
      })
    );
  }

  /**
   * Get available rooms from API
   */
  getAvailableRooms(): Observable<Room[]> {
    return this.http.get<RoomApiResponse[]>(`${this.apiBaseUrl}/available`).pipe(
      map(rooms => rooms.map(room => this.mapApiResponseToRoom(room))),
      catchError(error => {
        console.error('Error fetching available rooms:', error);
        return throwError(() => 'Failed to fetch available rooms');
      })
    );
  }

  /**
   * Filter rooms by category from API
   */
  getRoomsByCategory(category: string): Observable<Room[]> {
    return this.http.get<RoomApiResponse[]>(`${this.apiBaseUrl}/filter/${category}`).pipe(
      map(rooms => rooms.map(room => this.mapApiResponseToRoom(room))),
      catchError(error => {
        console.error('Error filtering rooms by category:', error);
        return throwError(() => 'Failed to filter rooms');
      })
    );
  }

  /**
   * Advanced room search from API
   */
  searchRooms(params: RoomSearchParams): Observable<Room[]> {
    console.log('Searching rooms with params:', params);
    let httpParams = new HttpParams()
      .set('checkIn', params.checkIn)
      .set('checkOut', params.checkOut);

    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.minPrice) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.capacity) {
      httpParams = httpParams.set('capacity', params.capacity.toString());
    }

    return this.http.get<RoomApiResponse[]>(`${this.apiBaseUrl}/search`, { params: httpParams }).pipe(
      map(rooms => {
        console.log('Room search completed successfully:', rooms.length, 'rooms found');
        return rooms.map(room => this.mapApiResponseToRoom(room));
      }),
      catchError(error => {
        console.error('Error searching rooms:', error);
        if (error.status === 0) {
          return throwError(() => 'Unable to connect to server. Please check your connection.');
        } else if (error.status === 400) {
          return throwError(() => 'Invalid search parameters provided.');
        } else {
          return throwError(() => 'Failed to search rooms. Please try again.');
        }
      })
    );
  }

  /**
   * Add new room (Admin only)
   */
  addRoom(roomData: RoomApiRequest): Observable<Room> {
    console.log('Adding room with data:', roomData);
    return this.http.post<RoomApiResponse>(`${this.apiBaseUrl}/add`, roomData).pipe(
      map(room => {
        console.log('Room added successfully:', room);
        return this.mapApiResponseToRoom(room);
      }),
      catchError(error => {
        console.error('Error adding room:', error);
        if (error.status === 401) {
          return throwError(() => 'Unauthorized: Admin access required');
        } else if (error.status === 400) {
          return throwError(() => 'Invalid room data provided');
        } else {
          return throwError(() => 'Failed to add room. Please try again.');
        }
      })
    );
  }

  /**
   * Update room (Admin only)
   */
  updateRoom(id: string, roomData: RoomApiRequest): Observable<Room> {
    const roomId = parseInt(id);
    console.log('Updating room with ID:', id, '(converted to integer:', roomId, ')', 'and data:', roomData);
    return this.http.put<RoomApiResponse>(`${this.apiBaseUrl}/update/${roomId}`, roomData).pipe(
      map(room => {
        console.log('Room updated successfully:', room);
        return this.mapApiResponseToRoom(room);
      }),
      catchError(error => {
        console.error('Error updating room:', error);
        if (error.status === 401) {
          return throwError(() => 'Unauthorized: Admin access required');
        } else if (error.status === 404) {
          return throwError(() => 'Room not found');
        } else if (error.status === 400) {
          return throwError(() => 'Invalid room data provided');
        } else {
          return throwError(() => 'Failed to update room. Please try again.');
        }
      })
    );
  }

  /**
   * Delete room (Admin only)
   */
  deleteRoom(id: string): Observable<void> {
    const roomId = parseInt(id);
    console.log('Deleting room with ID:', id, '(converted to integer:', roomId, ')');
    
    return this.http.delete<void>(`${this.apiBaseUrl}/delete/${roomId}`).pipe(
      map(() => {
        console.log('Room deleted successfully');
        return;
      }),
      catchError(error => {
        console.error('Error deleting room:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        if (error.status === 401) {
          return throwError(() => 'Unauthorized: Admin access required');
        } else if (error.status === 404) {
          return throwError(() => 'Room not found');
        } else if (error.status === 500) {
          return throwError(() => 'Server error: Please try again later or contact support');
        } else {
          return throwError(() => `Failed to delete room (Status: ${error.status}). Please try again.`);
        }
      })
    );
  }

  /**
   * Get room by ID
   */
  getRoomById(id: string): Observable<Room | null> {
    // Since the API doesn't have a get by ID endpoint, we'll get all rooms and filter
    return this.getAllRooms().pipe(
      map(rooms => rooms.find(room => room.id === id) || null),
      catchError(error => {
        console.error('Error fetching room by ID:', error);
        return throwError(() => 'Failed to fetch room');
      })
    );
  }

  // Backward Compatibility Methods

  /**
   * Search rooms with existing SearchCriteria (maintains backward compatibility)
   */
  searchRoomsWithCriteria(criteria: SearchCriteria): Observable<Room[]> {
    // Convert SearchCriteria to RoomSearchParams
    const searchParams: RoomSearchParams = {
      checkIn: criteria.checkInDate.toISOString().split('T')[0],
      checkOut: criteria.checkOutDate.toISOString().split('T')[0],
      capacity: criteria.guests
    };

    if (criteria.roomType) {
      // Map RoomType to category
      searchParams.category = this.mapRoomTypeToCategory(criteria.roomType);
    }
    if (criteria.minPrice) {
      searchParams.minPrice = criteria.minPrice;
    }
    if (criteria.maxPrice) {
      searchParams.maxPrice = criteria.maxPrice;
    }

    return this.searchRooms(searchParams);
  }

  /**
   * Get rooms by type (maintains backward compatibility)
   */
  getRoomsByType(type: RoomType): Observable<Room[]> {
    const category = this.mapRoomTypeToCategory(type);
    return this.getRoomsByCategory(category);
  }

  // Helper Methods

  /**
   * Map API response to Room model
   */
  private mapApiResponseToRoom(apiRoom: RoomApiResponse): Room {
    return {
      id: apiRoom.id.toString(),
      roomNumber: apiRoom.roomNumber,
      type: this.mapCategoryToRoomType(apiRoom.category),
      category: apiRoom.category,
      description: `${apiRoom.category} room with ${apiRoom.capacity} person capacity`,
      amenities: apiRoom.amenities,
      pricePerNight: apiRoom.pricePerNight,
      maxOccupancy: apiRoom.capacity,
      capacity: apiRoom.capacity,
      images: [], // API doesn't provide images
      isActive: true,
      available: apiRoom.available,
      floor: parseInt(apiRoom.roomNumber.charAt(0)) || 1
    };
  }

  /**
   * Map RoomType enum to API category string
   */
  private mapRoomTypeToCategory(roomType: RoomType): string {
    const categoryMap: Record<RoomType, string> = {
      [RoomType.SINGLE]: 'Standard',
      [RoomType.DOUBLE]: 'Standard',
      [RoomType.SUITE]: 'Suite',
      [RoomType.DELUXE]: 'Deluxe',
      [RoomType.PRESIDENTIAL]: 'Presidential'
    };
    return categoryMap[roomType] || 'Standard';
  }

  /**
   * Map API category string to RoomType enum
   */
  private mapCategoryToRoomType(category: string): RoomType {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('suite')) return RoomType.SUITE;
    if (categoryLower.includes('deluxe')) return RoomType.DELUXE;
    if (categoryLower.includes('presidential')) return RoomType.PRESIDENTIAL;
    if (categoryLower.includes('standard')) return RoomType.SINGLE;
    return RoomType.SINGLE; // Default fallback
  }

  /**
   * Get room statistics
   */
  getRoomStats(): Observable<{ total: number; available: number; occupied: number }> {
    return this.getAllRooms().pipe(
      map(rooms => {
        const total = rooms.length;
        const available = rooms.filter(room => room.available).length;
        const occupied = total - available;
        return { total, available, occupied };
      }),
      catchError(error => {
        console.error('Error fetching room stats:', error);
        return of({ total: 0, available: 0, occupied: 0 });
      })
    );
  }
}
