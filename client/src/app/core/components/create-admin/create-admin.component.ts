import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../core/utils/form.utils';
import { AuthService } from '../../../shared/service/auth.service';
import { LogoComponent } from "../../../shared/ui/logo/logo.component";
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../shared/service/user.service';

@Component({
  selector: 'app-create-admin-page',
  imports: [ReactiveFormsModule, LogoComponent],
  templateUrl: './create-admin.component.html'
})
export class CreateAdminPageComponent {

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  formUtils = FormUtils;

  form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['',[Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  async onSubmit() {
    if (this.form.valid) {
      await firstValueFrom(this.authService.register(this.form.value))
        .then(() => this.userService.checkHasUsers()) // TODO: TOAST
        .catch(console.error)
    }
  }
}
