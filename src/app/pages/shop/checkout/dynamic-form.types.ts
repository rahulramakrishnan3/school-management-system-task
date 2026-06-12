export interface FieldValidation {
  readonly type: 'required' | 'email' | 'minLength';
  readonly value?: number;
}

export interface VisibleWhen {
  readonly field: string;
  readonly equals: string | boolean;
}

export interface DynamicFieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'email' | 'tel';
  readonly placeholder?: string;
  readonly validations?: readonly FieldValidation[];
  readonly visibleWhen?: VisibleWhen;
}
