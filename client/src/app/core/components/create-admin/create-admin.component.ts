import { Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormUtils } from '../../../core/utils/form.utils';
import { AuthService } from '../../../shared/service/auth.service';
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../shared/service/user.service';
import { FormField } from '../../../shared/ui/types/form-field.model';
import { NewUserDTO } from '../../../shared/domain/dto/user.dto';
import { FormComponent } from "../../../shared/ui/components/form/form.component";

@Component({
  selector: 'app-create-admin-page',
  imports: [LogoComponent, FormComponent],
  templateUrl: './create-admin.component.html'
})
export class CreateAdminPageComponent {

  private authService = inject(AuthService);
  private userService = inject(UserService);

  formUtils = FormUtils;

  formFields: FormField[] = [
    {
      value: '',
      label: $localize`:{@@email}:Email`,
      placeholder: $localize`:{@@email}:Email`,
      type: 'email',
      key: 'email',
      validators: [Validators.required, Validators.email]
    },
    {
      value: '',
      label: $localize`:{@@name}:Name`,
      placeholder: $localize`:{@@name}:Name`,
      type: 'text',
      key: 'name',
      validators: [Validators.required, Validators.minLength(3)]
    },
    {
      value: '',
      label: $localize`:{@@password}:Password`,
      placeholder: $localize`:{@@password}:Password`,
      type: 'password',
      key: 'password',
      validators: [Validators.required, Validators.minLength(8)]
    }
  ];

  async onSubmit(data: NewUserDTO) {
    await firstValueFrom(this.authService.register(data))
    .then(_response => {
      this.userService.checkHasUsers()
    })
  }
}
