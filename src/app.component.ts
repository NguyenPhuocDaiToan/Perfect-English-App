import { Component, ChangeDetectionStrategy, inject, signal, Renderer2 } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ThemePickerComponent } from './components/theme-picker/theme-picker.component';
import { WhatsAppButtonComponent } from './components/shared/whatsapp-button/whatsapp-button.component';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ThemePickerComponent, WhatsAppButtonComponent, CommonModule],
  host: {
    '[class.h-full]': 'isAdminRoute()',
    '[class.block]': 'isAdminRoute()',
  }
})
export class AppComponent {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  themeService = inject(ThemeService);
  isAdminRoute = signal(false);

  constructor() {
    // Eagerly instantiate AuthService to run its constructor which calls checkAuthStatus()
    inject(AuthService); 
    
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      if (this.isAdminRoute()) {
        this.renderer.addClass(this.document.body, 'overflow-hidden');
      } else {
        this.renderer.removeClass(this.document.body, 'overflow-hidden');
      }
    });
  }
}