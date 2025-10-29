
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Testimonial } from '../../models/testimonial.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipComponent {
  private dataService = inject(DataService);
  testimonials$: Observable<Testimonial[]> = this.dataService.getTestimonials();

  billingCycle = signal<'monthly' | 'yearly'>('monthly');
  openFaqIndex = signal<number | null>(null);

  toggleFaq(index: number) {
    this.openFaqIndex.update(currentIndex => (currentIndex === index ? null : index));
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
