import { Component, effect, inject, input, output, signal } from "@angular/core";
import { FormUtils } from "../../../../core/utils/form.utils";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { FormField } from "../../types/form-field.model";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  imports: [ReactiveFormsModule],
})
export class FormComponent<T> {

  private fb = inject(FormBuilder);

  formUtils = FormUtils;

  fields = input.required<FormField[]>();
  title = input.required<string>();
  submitButtonText = input<string>('Submit');
  description = input<string | null>(null);
  cancellable = input<boolean>(true);

  formSubmit = output<T>();
  formCancel = output<void>();

  formGroup = signal<FormGroup>(this.fb.group({}));
  isLoading = signal(false);

  constructor() {
    effect(() => {
      const group: { [key: string]: any } = {};
      this.fields().forEach(field => {
        group[field.key] = [
          { value: field.value, disabled: field.disabled ?? false },
          field.validators ?? []
        ];
      });
      this.formGroup.set(this.fb.group(group));
    });
  }

  onSubmit(): void {
    if (this.formGroup().valid) {
      this.formSubmit.emit(this.formGroup().value as T);
      this.formGroup().reset();
    }
  }

  onCancel(): void {
    this.formGroup().reset();
    this.formCancel.emit();
  }
}
