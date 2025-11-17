import { Validators } from "@angular/forms";
import { User } from "../../domain/models/user.model";
import { FormConfig } from "../types/form-config.model";
import { TableConfig } from "../types/table-config.model";

export class UserHelper {
  static createEditForm(user: User | null): FormConfig {
    return [
      {
        key: 'name',
        label: $localize`:@@name:Name`,
        type: 'text',
        value: user ? user.name : '',
        validators: [Validators.required, Validators.minLength(3)]
      },
      {
        key: 'email',
        label: $localize`:@@email:Email`,
        type: 'email',
        value: user ? user.email : '',
        validators: [Validators.required, Validators.email]
      },
      {
        key: 'password',
        label: $localize`:@@password:Password`,
        type: 'password',
        value: '',
        validators: user ? [] : [Validators.required, Validators.minLength(8)],
        disabled: user ? true : false
      },
      {
        key: 'isAdmin',
        label: $localize`:@@isAdmin:Is Admin`,
        type: 'checkbox',
        value: user ? user.isAdmin : false
      }
    ];
  }

  static table(): TableConfig<User> {
    return {
      fields: ['name', 'email', 'isAdmin'],
      labels: {
        name: $localize`:{@@name}:Name`,
        email: $localize`:{@@email}:Email`,
        isAdmin: $localize`:{@@isAdmin}:Is Admin`,
      },
      avatars: ['name'],
      formats: {
        isAdmin: 'boolean'
      },
    };
  }
}
