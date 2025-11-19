
import { Injectable, signal } from '@angular/core';
import { ConfirmationOptions, ConfirmationState } from '../models/confirmation.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  state = signal<ConfirmationState | null>(null);

  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        ...options,
        resolve
      });
    });
  }

  accept() {
    const currentState = this.state();
    if (currentState) {
      currentState.resolve(true);
      this.state.set(null);
    }
  }

  reject() {
    const currentState = this.state();
    if (currentState) {
      currentState.resolve(false);
      this.state.set(null);
    }
  }
}
