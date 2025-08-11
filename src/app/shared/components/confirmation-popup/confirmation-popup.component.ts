import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'danger';
}

@Component({
  selector: 'app-confirmation-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title [class]="'title-' + (data.type || 'info')">
        {{ data.title }}
      </h2>
      
      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button 
                [mat-dialog-close]="false"
                class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                [color]="getConfirmButtonColor()"
                [mat-dialog-close]="true"
                class="confirm-btn">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
    }
    
    .title-warning {
      color: #f57c00;
    }
    
    .title-danger {
      color: #d32f2f;
    }
    
    .title-info {
      color: #1976d2;
    }
    
    .message {
      margin: 16px 0;
      line-height: 1.5;
      color: #333;
    }
    
    .cancel-btn {
      margin-right: 8px;
    }
    
    .confirm-btn {
      min-width: 80px;
    }
    
    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class ConfirmationPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationData
  ) {}

  getConfirmButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }
}
