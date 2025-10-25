
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipComponent {

}
