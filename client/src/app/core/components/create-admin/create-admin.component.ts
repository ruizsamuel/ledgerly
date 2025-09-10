import { Component, inject } from '@angular/core';
import { FormUtils } from '../../../core/utils/form.utils';
import { AuthService } from '../../../shared/service/auth.service';
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../shared/service/user.service';
import { FormComponent } from "../../../shared/ui/components/form/form.component";
import { RegisterDTO } from '../../../shared/domain/dto/auth.dto';
import { AuthHelper } from '../../../shared/ui/helpers/auth.helper';

@Component({
  selector: 'app-create-admin-page',
  imports: [LogoComponent, FormComponent],
  templateUrl: './create-admin.component.html'
})
export class CreateAdminPageComponent {

  private authService = inject(AuthService);
  private userService = inject(UserService);

  formUtils = FormUtils;

  authHelper = AuthHelper;

  formFields = this.authHelper.registerForm();

  async onSubmit(data: RegisterDTO) {
    await firstValueFrom(this.authService.register(data))
    .then(_response => {
      this.userService.checkHasUsers()
    })
  }
}
