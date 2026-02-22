import { Component, inject } from '@angular/core';
import { FormUtils } from '../../../shared/common/utils/form.utils';
import { AuthService } from '../../services/auth.service';
import { LogoComponent } from "../../../shared/common/ui/components/logo/logo.component";
import { FormComponent } from "../../../shared/common/ui/components/form/form.component";
import { RegisterDTO } from '../../models/auth.model';
import { AuthHelper } from '../../../shared/domain/ui/helpers/auth.helper';

@Component({
  selector: 'app-create-admin-page',
  imports: [LogoComponent, FormComponent],
  templateUrl: './create-admin.component.html'
})
export class CreateAdminPageComponent {

  private authService = inject(AuthService);

  formUtils = FormUtils;

  authHelper = AuthHelper;

  formFields = this.authHelper.registerForm();

  onSubmit(data: RegisterDTO) {
    this.authService.register(data);
  }
}
