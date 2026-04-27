import { Component, effect, inject, input, OnInit, output, signal } from "@angular/core";
import { FormUtils } from "../../../utils/form.utils";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { FormConfig } from "../../models/form-config.model";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class FormComponent<T> implements OnInit {
  private fb = inject(FormBuilder);
  formUtils = FormUtils;

  readonly fields = input.required<FormConfig>();
  title = input.required<string>();

  submitButtonText = input<string>('Submit');
  description = input<string | null>(null);
  cancellable = input<boolean>(true);
  loadingTime = input<number>(2000);

  formSubmit = output<T>();
  formCancel = output<void>();

  formGroup!: FormGroup;
  isLoading = signal(false);

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        setTimeout(() => this.isLoading.set(false), this.loadingTime());
      }
    });
  }

  ngOnInit(): void {
    const group: { [key: string]: any } = {};
    this.fields().forEach(field => {
      group[field.key] = [
        field.value ?? (field.type === 'checkbox' ? false : ''),
        field.validators ?? []
      ];
    });
    this.formGroup = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value as T);
      this.formGroup.reset();
    }
  }

  onCancel(): void {
    this.formGroup.reset();
    this.formCancel.emit();
  }
}
