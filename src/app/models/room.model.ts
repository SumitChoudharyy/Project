export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  description: string;
  amenities: string[];
  pricePerNight: number;
  maxOccupancy: number;
  images: string[];
  isActive: boolean;
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
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}