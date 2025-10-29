import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SaveButtonState = 'idle' | 'loading' | 'success';

@Component({
  selector: 'app-save-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveButtonComponent {
  state = input<SaveButtonState>('idle');
  isDisabled = input<boolean>(false);
  idleLabel = input<string>('Save Changes');
  loadingLabel = input<string>('Saving...');

  buttonClasses = computed(() => {
    const baseClasses = 'relative flex w-full justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
    
    if (this.isDisabled() && this.state() === 'idle') {
      return `${baseClasses} bg-primary-400 cursor-not-allowed`;
    }

    switch (this.state()) {
      case 'loading':
        return `${baseClasses} bg-primary-500 cursor-wait`;
      case 'success':
        return `${baseClasses} bg-green-500`;
      case 'idle':
      default:
        return `${baseClasses} bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600`;
    }
  });

  isButtonDisabled = computed(() => {
    return this.isDisabled() || this.state() !== 'idle';
  });
}
