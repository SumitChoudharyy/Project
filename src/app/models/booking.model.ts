export interface Booking {
  id: string;
  customerId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
  refundAmount?: number;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface BookingRequest {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  specialRequests?: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  amount: number;
  tax: number;
  totalAmount: number;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}