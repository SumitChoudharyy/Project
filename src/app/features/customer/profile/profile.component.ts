import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/user.model';
import { selectUser } from '../../../store/auth/auth.selectors';
import { updateProfile } from '../../../store/auth/auth.actions';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="profile-container">
      <div class="page-header">
        <h1>My Profile</h1>
        <p>Update your personal information and preferences</p>
      </div>

      <div class="profile-content">
        <mat-card class="profile-card">
          <mat-card-header>
            <mat-card-title>Personal Information</mat-card-title>
            <mat-card-subtitle>Keep your information up to date</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <!-- Personal Details -->
              <div class="form-section">
                <h3>Basic Information</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" placeholder="Enter first name">
                    <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                    <mat-error *ngIf="profileForm.get('firstName')?.hasError('pattern')">
                      Only letters are allowed
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" placeholder="Enter last name">
                    <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                    <mat-error *ngIf="profileForm.get('lastName')?.hasError('pattern')">
                      Only letters are allowed
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="Enter your email">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
                  <mat-icon matSuffix>phone</mat-icon>
                  <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                    Phone number is required
                  </mat-error>
                  <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('pattern')">
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
                      Please enter a valid ZIP code
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Country</mat-label>
                    <mat-select formControlName="country">
                      <mat-option value="USA">United States</mat-option>
                      <mat-option value="Canada">Canada</mat-option>
                      <mat-option value="UK">United Kingdom</mat-option>
                      <mat-option value="Australia">Australia</mat-option>
                    </mat-select>
                    <mat-error *ngIf="addressGroup.get('country')?.hasError('required')">
                      Country is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Account Information -->
              <div class="form-section">
                <h3>Account Information</h3>
                
                <div class="account-info">
                  <div class="info-item">
                    <strong>Account Status:</strong>
                    <span class="status-active">Active</span>
                  </div>
                  <div class="info-item">
                    <strong>Member Since:</strong>
                    <span>{{ (user$ | async)?.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Last Login:</strong>
                    <span>{{ (user$ | async)?.lastLogin ? ((user$ | async)?.lastLogin | date:'medium') : 'Never' }}</span>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="resetForm()">Reset</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isUpdating">
                  <span *ngIf="!isUpdating">Update Profile</span>
                  <mat-spinner *ngIf="isUpdating" diameter="20"></mat-spinner>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Security Section -->
        <mat-card class="security-card">
          <mat-card-header>
            <mat-card-title>Security Settings</mat-card-title>
            <mat-card-subtitle>Manage your account security</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="security-actions">
              <div class="security-item">
                <div class="security-info">
                  <h4>Password</h4>
                  <p>Update your password to keep your account secure</p>
                </div>
                <button mat-stroked-button color="primary" (click)="changePassword()">
                  Change Password
                </button>
              </div>

              <mat-divider></mat-divider>

              <div class="security-item">
                <div class="security-info">
                  <h4>Account Deletion</h4>
                  <p>Permanently delete your account and all associated data</p>
                </div>
                <button mat-stroked-button color="warn" (click)="deleteAccount()">
                  Delete Account
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 300;
      color: #333;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-card, .security-card {
      padding: 24px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 20px 0;
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

    .account-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-item strong {
      color: #333;
    }

    .status-active {
      color: #4caf50;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }

    .security-actions {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .security-info h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }

    .security-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .security-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .security-item button {
        align-self: stretch;
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  addressGroup: FormGroup;
  user$ = this.store.select(selectUser);
  isUpdating = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.addressGroup = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['USA', Validators.required]
    });

    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      address: this.addressGroup,
      // Flatten address fields for easier form handling
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['USA', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load current user data into form
    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            zipCode: user.address.zipCode,
            country: user.address.country
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isUpdating = true;
      
      const formValue = this.profileForm.value;
      const userData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        address: {
          street: formValue.street,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          country: formValue.country
        }
      };

      this.store.dispatch(updateProfile({ userData }));
      
      // Simulate API call delay
      setTimeout(() => {
        this.isUpdating = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1500);
    }
  }

  resetForm(): void {
    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            zipCode: user.address.zipCode,
            country: user.address.country
          });
        }
      });
    
    this.snackBar.open('Form reset to original values', 'Close', { duration: 2000 });
  }

  changePassword(): void {
    // TODO: Open change password dialog
    this.snackBar.open('Change password feature coming soon!', 'Close', { duration: 3000 });
  }

  deleteAccount(): void {
    // TODO: Open delete account confirmation dialog
    this.snackBar.open('Account deletion feature coming soon!', 'Close', { duration: 3000 });
  }
}