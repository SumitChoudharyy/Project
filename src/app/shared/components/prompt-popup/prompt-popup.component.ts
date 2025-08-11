import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PromptData {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  multiline?: boolean;
  required?: boolean;
}

@Component({
  selector: 'app-prompt-popup',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule
  ],
  template: `
    <div class="prompt-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ data.placeholder || 'Enter value' }}</mat-label>
          <textarea 
            *ngIf="data.multiline"
            matInput 
            [(ngModel)]="inputValue"
            [placeholder]="data.placeholder || 'Enter value'"
            [required]="data.required || false"
            rows="4"
            cdkTextareaAutosize
            cdkAutosizeMinRows="3"
            cdkAutosizeMaxRows="8">
          </textarea>
          <input 
            *ngIf="!data.multiline"
            matInput 
            [(ngModel)]="inputValue"
            [placeholder]="data.placeholder || 'Enter value'"
            [required]="data.required || false">
        </mat-form-field>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button 
                [mat-dialog-close]="null"
                class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                color="primary"
                [disabled]="(data.required || false) && !inputValue.trim()"
                [mat-dialog-close]="inputValue"
                class="confirm-btn">
          {{ data.confirmText || 'OK' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .prompt-dialog {
      min-width: 450px;
    }
    
    .message {
      margin: 16px 0;
      line-height: 1.5;
      color: #333;
    }
    
    .full-width {
      width: 100%;
      margin-top: 16px;
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
export class PromptPopupComponent {
  inputValue: string = '';

  constructor(
    public dialogRef: MatDialogRef<PromptPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptData
  ) {
    this.inputValue = data.defaultValue || '';
  }
}
