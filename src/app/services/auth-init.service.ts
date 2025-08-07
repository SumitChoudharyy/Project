import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthInitService {
  constructor(private store: Store) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.store.dispatch(AuthActions.loginSuccess({ user, token }));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
} 