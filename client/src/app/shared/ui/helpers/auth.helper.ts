import { Validators } from "@angular/forms";
import { FormConfig } from "../types/form-config.model";
import { FormUtils } from "../../../core/utils/form.utils";
import { User } from "../../domain/models/user.model";


export class AuthHelper {
  static loginForm(): FormConfig {
    return [
      {
        key: 'email',
        value: '',
        label: $localize`:{@@email}:Email`,
        placeholder: $localize`:{@@email}:Email`,
        type: 'email',
        validators: [Validators.required, Validators.email]
      },
      {
        key: 'password',
        value: '',
        label: $localize`:{@@password}:Password`,
        placeholder: $localize`:{@@password}:Password`,
        type: 'password',
        validators: [Validators.required]
      }
    ];
  }
  static registerForm(): FormConfig {
    return [
      {
        key: 'email',
        value: '',
        label: $localize`:{@@email}:Email`,
        placeholder: $localize`:{@@email}:Email`,
        type: 'email',
        validators: [Validators.required, Validators.email]
      },
      {
        key: 'name',
        value: '',
        label: $localize`:{@@name}:Name`,
        placeholder: $localize`:{@@name}:Name`,
        type: 'text',
        validators: [Validators.required, Validators.minLength(3)]
      },
      {
        key: 'password',
        value: '',
        label: $localize`:{@@password}:Password`,
        placeholder: $localize`:{@@password}:Password`,
        type: 'password',
        validators: [Validators.required, Validators.minLength(8)]
      },
      {
        key: 'confirmPassword',
        value: '',
        label: $localize`:{@@confirmPassword}:Confirm Password`,
        placeholder: $localize`:{@@confirmPassword}:Confirm Password`,
        type: 'password',
        validators: [Validators.required, FormUtils.fieldMatchValidator('password')]
      }
    ];
  }

  static changePasswordForm(): FormConfig {
    return [
      {
        key: 'currentPassword',
        value: '',
        label: $localize`:{@@currentPassword}:Current Password`,
        placeholder: $localize`:{@@currentPassword}:Current Password`,
        type: 'password',
        validators: [Validators.required]
      },
      {
        key: 'newPassword',
        value: '',
        label: $localize`:{@@newPassword}:New Password`,
        placeholder: $localize`:{@@newPassword}:New Password`,
        type: 'password',
        validators: [Validators.required, Validators.minLength(8)]
      },
      {
        key: 'confirmNewPassword',
        value: '',
        label: $localize`:{@@confirmNewPassword}:Confirm New Password`,
        placeholder: $localize`:{@@confirmNewPassword}:Confirm New Password`,
        type: 'password',
        validators: [Validators.required, FormUtils.fieldMatchValidator('newPassword')]
      }
    ];
  }

  static profileForm(user: User): FormConfig {
    return [
      {
        key: 'email',
        value: user.email,
        label: $localize`:{@@email}:Email`,
        placeholder: $localize`:{@@email}:Email`,
        type: 'email',
        validators: [Validators.required, Validators.email]
      },
      {
        key: 'name',
        value: user.name,
        label: $localize`:{@@name}:Name`,
        placeholder: $localize`:{@@name}:Name`,
        type: 'text',
        validators: [Validators.required, Validators.minLength(3)]
      }
    ];
  }
}
