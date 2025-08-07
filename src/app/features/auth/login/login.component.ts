import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { login, clearError } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError, selectUser } from '../../../store/auth/auth.selectors';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || (isLoading$ | async)" class="full-width">
                <span *ngIf="!(isLoading$ | async)">Sign In</span>
                <mat-spinner *ngIf="isLoading$ | async" diameter="20"></mat-spinner>
              </button>
            </div>
          </form>

          <div class="demo-credentials" *ngIf="showDemoCredentials">
            <mat-divider class="mt-3 mb-2"></mat-divider>
            <h4>Demo Credentials:</h4>
            <div class="demo-section">
              <strong>Admin:</strong> admin&#64;hotel.com / password123
              <button mat-stroked-button size="small" (click)="fillDemoCredentials('admin')" class="demo-button">Fill</button>
            </div>
            <div class="demo-section">
              <strong>Customer:</strong> customer&#64;email.com / password123
              <button mat-stroked-button size="small" (click)="fillDemoCredentials('customer')" class="demo-button">Fill</button>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <div class="card-footer">
            <p>Don't have an account? <a routerLink="/register">Sign up here</a></p>
            <button mat-button (click)="showDemoCredentials = !showDemoCredentials" color="accent">
              {{ showDemoCredentials ? 'Hide' : 'Show' }} Demo Credentials
            </button>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    .form-actions {
      margin-top: 16px;
    }

    .card-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .demo-credentials {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .demo-credentials h4 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .demo-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .demo-button {
      min-width: 50px;
      height: 24px;
      line-height: 24px;
    }

    a {
      color: #1976d2;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  showDemoCredentials = false;
  isLoading$ = this.store.select(selectAuthLoading);
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Clear any previous errors
    this.store.dispatch(clearError());

    // Listen for auth errors
    this.store.select(selectAuthError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.snackBar.open(error, 'Close', { duration: 5000 });
        }
      });

    // Redirect if already authenticated
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.redirectBasedOnRole(user.role);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.store.dispatch(login({ credentials: this.loginForm.value }));
    }
  }

  fillDemoCredentials(type: 'admin' | 'customer'): void {
    const credentials = {
      admin: { email: 'admin@hotel.com', password: 'password123' },
      customer: { email: 'customer@email.com', password: 'password123' }
    };

    this.loginForm.patchValue(credentials[type]);
  }

  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'staff':
        this.router.navigate(['/staff']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}