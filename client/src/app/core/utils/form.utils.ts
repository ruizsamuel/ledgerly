import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FormUtils {
  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return $localize`:{@@requiredField}:This field is required`;

        case 'minlength':
          return $localize`:{@@minlengthRequired}:Minimum of required charactes: ${errors['minlength'].requiredLength}`;

        case 'maxlength':
          return $localize`:{@@maxlengthAllowed}:Maximum of allowed characters: ${errors['maxlength'].requiredLength}`;

        case 'email':
          return $localize`:{@@incorrectEmailFormat}:Incorrect email format`;

        case 'valuesMismatch':
          return $localize`:{@@valuesMismatch}:Values do not match`;

        case 'valuesEqual':
          return $localize`:{@@valuesEqual}:Values must be different`;
        //TODO: Add min case
      }
    }

    return null;
  }

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return (
      !!form.controls[fieldName].errors && form.controls[fieldName].touched
    );
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  static isValidFieldInArray(formArray: FormArray, index: number) {
    return (
      formArray.controls[index].errors && formArray.controls[index].touched
    );
  }

  static getFieldErrorInArray(
    formArray: FormArray,
    index: number
  ): string | null {
    if (formArray.controls.length === 0) return null;

    const errors = formArray.controls[index].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  static fieldMatchValidator(otherFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const parent = control.parent;

      if (!parent || !(parent instanceof FormGroup)) {
        return null;
      }

      const otherValue = parent.get(otherFieldName)?.value;
      const thisValue = control.value;

      return otherValue === thisValue ? null : { valuesMismatch: true };
    };
  }

  static fieldNotEqualValidator(otherFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const parent = control.parent;

      if (!parent || !(parent instanceof FormGroup)) {
        return null;
      }

      const otherValue = parent.get(otherFieldName)?.value;
      const thisValue = control.value;

      return otherValue !== thisValue ? null : { valuesEqual: true };
    };
  }
}
