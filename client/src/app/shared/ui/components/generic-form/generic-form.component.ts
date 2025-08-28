import { Component, effect, input, OnInit, output } from "@angular/core";
import { FormUtils } from "../../../../core/utils/form.utils";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { FormField } from "../../types/form-field.model";

@Component({
  selector: 'app-generic-form',
  templateUrl: './generic-form.component.html',
  imports: [ReactiveFormsModule],
})
export class GenericFormComponent<T> {

  formUtils = FormUtils;

  formGroup = input.required<FormGroup>();
  fields = input.required<FormField[]>();
  title = input.required<string>();
  submitButtonText = input<string>('Submit');
  initialData = input<T | null>(null);

  formSubmit = output<T>();
  formCancel = output<void>();

  constructor() {
    effect(() => {
      const data = this.initialData();
      const form = this.formGroup();

      if (data && form) {
        const fieldsToUpdate: Partial<T> = {};
        this.fields().forEach(field => {
          const value = (data as any)[field.key];
          if (value !== undefined && form.contains(field.key)) {
            (fieldsToUpdate as any)[field.key] = value;
          }
        });
        form.patchValue(fieldsToUpdate);
      }
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
