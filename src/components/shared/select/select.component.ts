import { Component, ChangeDetectionStrategy, input, signal, forwardRef, ElementRef, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class SelectComponent implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  // Inputs
  label = input<string>('');
  options = input.required<SelectOption[]>();
  multiple = input<boolean>(false);
  placeholder = input<string>('Select...');

  // Internal state
  isOpen = signal(false);
  selectedValue = signal<any | any[] | null>(null);

  // ControlValueAccessor implementation
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (this.multiple() && !Array.isArray(value)) {
      this.selectedValue.set([]);
    } else {
      this.selectedValue.set(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDropdown() {
    this.isOpen.update(open => !open);
    if (!this.isOpen()) {
        this.onTouched();
    }
  }

  selectOption(optionValue: any) {
    if (this.multiple()) {
      const currentValues = Array.isArray(this.selectedValue()) ? [...this.selectedValue() as any[]] : [];
      const index = currentValues.indexOf(optionValue);
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(optionValue);
      }
      this.selectedValue.set(currentValues);
      this.onChange(currentValues);
    } else {
      this.selectedValue.set(optionValue);
      this.onChange(optionValue);
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  isSelected(optionValue: any): boolean {
    if (this.multiple()) {
      return Array.isArray(this.selectedValue()) && (this.selectedValue() as any[]).includes(optionValue);
    }
    return this.selectedValue() === optionValue;
  }

  displayLabel = computed(() => {
    if (this.multiple()) {
      const selected = this.selectedValue() as any[];
      if (!selected || selected.length === 0) return this.placeholder();
      if (selected.length === 1) {
        const option = this.options().find(opt => opt.value === selected[0]);
        return option ? option.label : this.placeholder();
      }
      return `${selected.length} items selected`;
    } else {
      const selected = this.selectedValue();
      if (selected === null || selected === undefined) return this.placeholder();
      const option = this.options().find(opt => opt.value === selected);
      return option ? option.label : this.placeholder();
    }
  });
  
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
        this.onTouched();
    }
  }
}
