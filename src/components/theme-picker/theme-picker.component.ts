import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePickerComponent {
  themeService = inject(ThemeService);
  isPickerOpen = signal(false);

  selectTheme(themeName: string) {
    this.themeService.setTheme(themeName);
    this.isPickerOpen.set(false);
  }
}
