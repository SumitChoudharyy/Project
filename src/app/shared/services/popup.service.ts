import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationPopupComponent, ConfirmationData } from '../components/confirmation-popup/confirmation-popup.component';
import { PromptPopupComponent, PromptData } from '../components/prompt-popup/prompt-popup.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private dialog: MatDialog) { }

  /**
   * Shows a confirmation dialog
   * @param data Configuration for the confirmation dialog
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirm(data: ConfirmationData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      width: '450px',
      data: data,
      disableClose: true
    });

    return dialogRef.afterClosed();
  }

  /**
   * Shows a simple confirmation dialog with default styling
   * @param message The message to display
   * @param title Optional title (defaults to 'Confirm')
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirmSimple(message: string, title: string = 'Confirm'): Observable<boolean> {
    return this.confirm({
      title: title,
      message: message,
      type: 'info'
    });
  }

  /**
   * Shows a warning confirmation dialog
   * @param message The message to display
   * @param title Optional title (defaults to 'Warning')
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirmWarning(message: string, title: string = 'Warning'): Observable<boolean> {
    return this.confirm({
      title: title,
      message: message,
      type: 'warning'
    });
  }

  /**
   * Shows a danger confirmation dialog
   * @param message The message to display
   * @param title Optional title (defaults to 'Danger')
   * @returns Observable<boolean> - true if confirmed, false if cancelled
   */
  confirmDanger(message: string, title: string = 'Danger'): Observable<boolean> {
    return this.confirm({
      title: title,
      message: message,
      type: 'danger'
    });
  }

  /**
   * Shows a prompt dialog for user input
   * @param data Configuration for the prompt dialog
   * @returns Observable<string | null> - the input value or null if cancelled
   */
  prompt(data: PromptData): Observable<string | null> {
    const dialogRef = this.dialog.open(PromptPopupComponent, {
      width: '500px',
      data: data,
      disableClose: true
    });

    return dialogRef.afterClosed();
  }

  /**
   * Shows a simple prompt dialog
   * @param message The message to display
   * @param title Optional title (defaults to 'Input Required')
   * @param placeholder Optional placeholder text
   * @param defaultValue Optional default value
   * @returns Observable<string | null> - the input value or null if cancelled
   */
  promptSimple(
    message: string, 
    title: string = 'Input Required', 
    placeholder?: string, 
    defaultValue?: string
  ): Observable<string | null> {
    return this.prompt({
      title: title,
      message: message,
      placeholder: placeholder,
      defaultValue: defaultValue,
      required: true
    });
  }

  /**
   * Shows a multiline prompt dialog
   * @param message The message to display
   * @param title Optional title (defaults to 'Input Required')
   * @param placeholder Optional placeholder text
   * @param defaultValue Optional default value
   * @returns Observable<string | null> - the input value or null if cancelled
   */
  promptMultiline(
    message: string, 
    title: string = 'Input Required', 
    placeholder?: string, 
    defaultValue?: string
  ): Observable<string | null> {
    return this.prompt({
      title: title,
      message: message,
      placeholder: placeholder,
      defaultValue: defaultValue,
      multiline: true,
      required: true
    });
  }
}
