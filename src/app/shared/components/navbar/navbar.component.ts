import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole } from '../../../models/user.model';
import { selectUser, selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-content">
        <div class="logo-section" (click)="navigateHome()">
          <mat-icon>hotel</mat-icon>
          <span class="logo-text">Hotel Booking</span>
        </div>

        <nav class="nav-links" *ngIf="isAuthenticated$ | async">
          <ng-container *ngIf="(user$ | async)?.role === 'customer'">
            <a mat-button routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a mat-button routerLink="/search" routerLinkActive="active">Search Rooms</a>
            <a mat-button routerLink="/bookings" routerLinkActive="active">My Bookings</a>
            <a mat-button routerLink="/complaints" routerLinkActive="active">Complaints</a>
          </ng-container>
          
          <ng-container *ngIf="(user$ | async)?.role === 'admin'">
            <a mat-button routerLink="/admin" routerLinkActive="active">Dashboard</a>
            <a mat-button routerLink="/admin/rooms" routerLinkActive="active">Rooms</a>
            <a mat-button routerLink="/admin/reservations" routerLinkActive="active">Reservations</a>
            <a mat-button routerLink="/admin/customers" routerLinkActive="active">Customers</a>
          </ng-container>
        </nav>

        <div class="user-section">
          <ng-container *ngIf="isAuthenticated$ | async; else loginSection">
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
              <mat-icon>account_circle</mat-icon>
              <span>{{ (user$ | async)?.firstName }} {{ (user$ | async)?.lastName }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </ng-container>
          
          <ng-template #loginSection>
            <a mat-button routerLink="/login">Login</a>
            <a mat-raised-button color="accent" routerLink="/register">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .logo-section {
      display: flex;
      align-items: center;
      cursor: pointer;
      gap: 8px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 500;
    }

    .nav-links {
      display: flex;
      gap: 16px;
    }

    .nav-links a.active {
      background-color: rgba(255,255,255,0.1);
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .logo-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {}

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.store.dispatch(logout());
    this.router.navigate(['/']);
  }
}