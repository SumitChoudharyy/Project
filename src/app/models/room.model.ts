export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  category: string; // API field
  description: string;
  amenities: string[];
  pricePerNight: number;
  maxOccupancy: number;
  capacity: number; // API field
  images: string[];
  isActive: boolean;
  available: boolean; // API field
  floor: number;
}

export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  SUITE = 'suite',
  DELUXE = 'deluxe',
  PRESIDENTIAL = 'presidential'
}

export interface RoomAvailability {
  roomId: string;
  date: Date;
  isAvailable: boolean;
  price: number;
}

export interface SearchCriteria {
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  roomType?: RoomType;
  category?: string; // API field
  minPrice?: number;
  maxPrice?: number;
  capacity?: number; // API field
  amenities?: string[];
}

// API-specific interfaces
export interface RoomApiRequest {
  roomNumber: string;
  category: string;
  pricePerNight: number;
  capacity: number;
  available: boolean;
  amenities: string[];
}

export interface RoomApiResponse {
  id: number;
  roomNumber: string;
  category: string;
  pricePerNight: number;
  capacity: number;
  available: boolean;
  amenities: string[];
}

export interface RoomSearchParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  checkIn: string; // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
}