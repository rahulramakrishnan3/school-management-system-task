import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldConfig } from './dynamic-form.types';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent {
  // OnPush scopes configuration-driven form updates to input and control-state changes.
  readonly formGroup = input.required<FormGroup>();
  readonly config = input.required<readonly DynamicFieldConfig[]>();

  protected visible(field: DynamicFieldConfig): boolean {
    if (!field.visibleWhen) return true;
    return this.formGroup().get(field.visibleWhen.field)?.value === field.visibleWhen.equals;
  }

  protected invalid(field: DynamicFieldConfig): boolean {
    const control = this.formGroup().get(field.key);
    return Boolean(control?.touched && control.invalid);
  }
}
