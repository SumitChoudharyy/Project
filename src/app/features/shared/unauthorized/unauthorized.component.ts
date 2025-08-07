import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <div class="unauthorized-content">
            <mat-icon class="unauthorized-icon">block</mat-icon>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <div class="actions">
              <button mat-raised-button color="primary" routerLink="/">Go Home</button>
              <button mat-button routerLink="/login">Login</button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      padding: 20px;
    }

    .unauthorized-card {
      max-width: 400px;
      width: 100%;
    }

    .unauthorized-content {
      text-align: center;
      padding: 40px 20px;
    }

    .unauthorized-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0 0 16px 0;
      color: #333;
    }

    p {
      color: #666;
      margin: 0 0 32px 0;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  `]
})
export class UnauthorizedComponent {}