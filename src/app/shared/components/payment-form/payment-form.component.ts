import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentInfo } from '../../../models/payment.model';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="payment-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>credit_card</mat-icon>
            Payment Information
          </mat-card-title>
          <mat-card-subtitle>Enter your credit card details to complete the booking</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Cardholder Name</mat-label>
                <input matInput formControlName="cardholderName" placeholder="Name on card">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="paymentForm.get('cardholderName')?.hasError('required')">
                  Cardholder name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="card-number-field">
                <mat-label>Card Number</mat-label>
                <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                <mat-icon matSuffix>credit_card</mat-icon>
                <mat-error *ngIf="paymentForm.get('cardNumber')?.hasError('required')">
                  Card number is required
                </mat-error>
                <mat-error *ngIf="paymentForm.get('cardNumber')?.hasError('pattern')">
                  Please enter a valid card number
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="expiry-field">
                <mat-label>Expiry Month</mat-label>
                <mat-select formControlName="expiryMonth">
                  <mat-option *ngFor="let month of expiryMonths" [value]="month">
                    {{ month }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="paymentForm.get('expiryMonth')?.hasError('required')">
                  Expiry month is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="expiry-field">
                <mat-label>Expiry Year</mat-label>
                <mat-select formControlName="expiryYear">
                  <mat-option *ngFor="let year of expiryYears" [value]="year">
                    {{ year }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="paymentForm.get('expiryYear')?.hasError('required')">
                  Expiry year is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="cvv-field">
                <mat-label>CVV</mat-label>
                <input matInput formControlName="cvv" placeholder="123" maxlength="4" type="password">
                <mat-icon matSuffix>security</mat-icon>
                <mat-error *ngIf="paymentForm.get('cvv')?.hasError('required')">
                  CVV is required
                </mat-error>
                <mat-error *ngIf="paymentForm.get('cvv')?.hasError('pattern')">
                  Please enter a valid CVV
                </mat-error>
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <div class="payment-summary">
              <h4>Payment Summary</h4>
              <div class="summary-item">
                <span>Amount:</span>
                <span>\${{ amount | number:'1.2-2' }}</span>
              </div>
              <div class="summary-item">
                <span>Processing Fee:</span>
                <span>\${{ processingFee | number:'1.2-2' }}</span>
              </div>
              <div class="summary-item total">
                <span>Total:</span>
                <span>\${{ totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="paymentForm.invalid || isSubmitting">
                <span *ngIf="!isSubmitting">Pay \${{ totalAmount | number:'1.2-2' }}</span>
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      flex: 1;
    }

    .card-number-field {
      flex: 1;
    }

    .expiry-field {
      flex: 0 0 120px;
    }

    .cvv-field {
      flex: 0 0 100px;
    }

    .payment-summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      margin: 24px 0;
    }

    .payment-summary h4 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.total {
      font-weight: 600;
      font-size: 18px;
      color: #1976d2;
      border-top: 2px solid #1976d2;
      padding-top: 16px;
      margin-top: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-header mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .payment-form-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .expiry-field,
      .cvv-field {
        flex: 1;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  isSubmitting = false;
  expiryMonths: string[] = [];
  expiryYears: string[] = [];
  amount: number = 0;
  processingFee: number = 0;
  totalAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentFormComponent>
  ) {
    this.paymentForm = this.fb.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit(): void {
    this.generateExpiryOptions();
    this.setupCardNumberFormatting();
  }

  setAmount(amount: number): void {
    this.amount = amount;
    this.processingFee = amount * 0.029 + 0.30; // 2.9% + $0.30
    this.totalAmount = this.amount + this.processingFee;
  }

  private generateExpiryOptions(): void {
    // Generate months (01-12)
    this.expiryMonths = Array.from({ length: 12 }, (_, i) => 
      String(i + 1).padStart(2, '0')
    );

    // Generate years (current year + 10 years)
    const currentYear = new Date().getFullYear();
    this.expiryYears = Array.from({ length: 10 }, (_, i) => 
      String(currentYear + i)
    );
  }

  private setupCardNumberFormatting(): void {
    const cardNumberControl = this.paymentForm.get('cardNumber');
    if (cardNumberControl) {
      cardNumberControl.valueChanges.subscribe(value => {
        if (value) {
          const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
          if (formatted !== value) {
            cardNumberControl.setValue(formatted, { emitEvent: false });
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isSubmitting = true;
      
      // Simulate payment processing
      setTimeout(() => {
        const paymentInfo: PaymentInfo = this.paymentForm.value;
        // Here you would typically send the payment info to a payment processor
        console.log('Payment info:', paymentInfo);
        
        this.isSubmitting = false;
        // Close dialog with payment info
        this.dialogRef.close({ paymentInfo });
      }, 2000);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getPaymentInfo(): PaymentInfo | null {
    if (this.paymentForm.valid) {
      return this.paymentForm.value;
    }
    return null;
  }
}
