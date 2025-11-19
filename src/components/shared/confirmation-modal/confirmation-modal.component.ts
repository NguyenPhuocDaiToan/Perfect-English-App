
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  confirmationService = inject(ConfirmationService);
  
  state = this.confirmationService.state;

  // Styling based on type
  iconClass = computed(() => {
    switch (this.state()?.type) {
      case 'danger': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  });

  buttonClass = computed(() => {
    switch (this.state()?.type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
      default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  });

  onConfirm() {
    this.confirmationService.accept();
  }

  onCancel() {
    this.confirmationService.reject();
  }
}
