import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { register, clearError } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join our hotel booking platform</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Personal Information -->
            <div class="form-section">
              <h3>Personal Information</h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" placeholder="Enter first name">
                  <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('firstName')?.hasError('pattern')">
                    Only letters are allowed
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" placeholder="Enter last name">
                  <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('lastName')?.hasError('pattern')">
                    Only letters are allowed
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="Enter your email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
                <mat-icon matSuffix>phone</mat-icon>
                <mat-error *ngIf="registerForm.get('phoneNumber')?.hasError('required')">
                  Phone number is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('phoneNumber')?.hasError('pattern')">
                  Please enter a valid phone number
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Address Information -->
            <div class="form-section">
              <h3>Address Information</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Street Address</mat-label>
                <input matInput formControlName="street" placeholder="Enter street address">
                <mat-error *ngIf="addressGroup.get('street')?.hasError('required')">
                  Street address is required
                </mat-error>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" placeholder="Enter city">
                  <mat-error *ngIf="addressGroup.get('city')?.hasError('required')">
                    City is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>State</mat-label>
                  <input matInput formControlName="state" placeholder="Enter state">
                  <mat-error *ngIf="addressGroup.get('state')?.hasError('required')">
                    State is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>ZIP Code</mat-label>
                  <input matInput formControlName="zipCode" placeholder="Enter ZIP code">
                  <mat-error *ngIf="addressGroup.get('zipCode')?.hasError('required')">
                    ZIP code is required
                  </mat-error>
                  <mat-error *ngIf="addressGroup.get('zipCode')?.hasError('pattern')">
                    Please enter a valid 6-digit ZIP code
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Password Information -->
            <div class="form-section">
              <h3>Password</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter password">
                <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                  Password must contain at least one uppercase letter, one lowercase letter, and one number
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm Password</mat-label>
                <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm password">
                <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                  <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Please confirm your password
                </mat-error>
                <mat-error *ngIf="registerForm.hasError('passwordMismatch') && !registerForm.get('confirmPassword')?.hasError('required')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!isFormFilled || (isLoading$ | async)" class="full-width">
                <span *ngIf="!(isLoading$ | async)">Create Account</span>
                <mat-spinner *ngIf="isLoading$ | async" diameter="20"></mat-spinner>
              </button>
              <div class="api-error" *ngIf="(error$ | async) as error">{{ error }}</div>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <div class="card-footer">
            <p>Already have an account? <a routerLink="/login">Sign in here</a></p>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 600px;
      padding: 24px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
      font-weight: 500;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      margin-top: 24px;
    }

    .card-footer {
      display: flex;
      justify-content: center;
      text-align: center;
    }

    a {
      color: #1976d2;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }

    .api-error {
      color: #d32f2f;
      margin-top: 8px;
      font-size: 12px;
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  addressGroup: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  get isFormFilled(): boolean {
    const controls = this.registerForm.controls;
    const nonEmpty = (key: string) => !!(controls[key]?.value ?? '').toString().trim();
    return (
      nonEmpty('firstName') &&
      nonEmpty('lastName') &&
      nonEmpty('email') &&
      nonEmpty('phoneNumber') &&
      nonEmpty('password') &&
      nonEmpty('confirmPassword') &&
      nonEmpty('street') &&
      nonEmpty('city') &&
      nonEmpty('state') &&
      nonEmpty('zipCode')
    );
  }
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.addressGroup = this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required],
      address: this.addressGroup,
      // Flatten address fields for easier form handling
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Clear any previous errors
    this.store.dispatch(clearError());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const userData = {
        ...formValue,
        address: {
          street: formValue.street,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          country: ''
        }
      };

      this.store.dispatch(register({ userData }));
    }
  }
}