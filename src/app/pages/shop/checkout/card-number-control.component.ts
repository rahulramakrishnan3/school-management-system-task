import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
  selector: 'app-card-number-control',
  template: `
    <label>
      Card number
      <input
        inputmode="numeric"
        autocomplete="cc-number"
        maxlength="19"
        placeholder="4242 4242 4242 4242"
        [value]="displayValue()"
        (input)="update($any($event.target).value)"
        (blur)="touch()"
      />
      @if (displayValue() && !valid()) { <small>Enter a card number that passes the Luhn check.</small> }
    </label>
  `,
  styles: `
    label { display: grid; gap: .4rem; color: #334155; font-size: .8rem; font-weight: 800; }
    input { padding: .8rem; border: 1px solid #cbd5e1; border-radius: .6rem; font: inherit; }
    small { color: #b91c1c; }
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CardNumberControlComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CardNumberControlComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardNumberControlComponent implements ControlValueAccessor, Validator {
  // OnPush updates this custom control only for its signal-backed input state.
  protected readonly displayValue = signal('');
  protected readonly valid = signal(false);
  private onChange: (value: string) => void = () => undefined;
  protected touch: () => void = () => undefined;

  writeValue(value: string): void { this.setValue(value ?? '', false); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.touch = fn; }
  validate(): ValidationErrors | null { return this.valid() ? null : { luhn: true }; }

  protected update(value: string): void { this.setValue(value, true); }

  private setValue(value: string, emit: boolean): void {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    this.displayValue.set(digits.replace(/(.{4})/g, '$1 ').trim());
    this.valid.set(digits.length >= 13 && this.passesLuhn(digits));
    if (emit) this.onChange(digits);
  }

  private passesLuhn(value: string): boolean {
    let sum = 0;
    let double = false;
    for (let index = value.length - 1; index >= 0; index--) {
      let digit = Number(value[index]);
      if (double && (digit *= 2) > 9) digit -= 9;
      sum += digit;
      double = !double;
    }
    return sum % 10 === 0;
  }
}
