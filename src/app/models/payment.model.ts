export interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  amount: number;
  timestamp: Date;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentInfo: PaymentInfo;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}
