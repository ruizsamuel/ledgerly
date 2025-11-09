import { Component, computed, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { FormUtils } from "../../utils/form.utils";
import { AuthService } from "../../../shared/service/auth.service";
import { FormComponent } from "../../../shared/ui/components/form/form.component";
import { LoginDTO, RegisterDTO } from "../../../shared/domain/dto/auth.dto";
import { AuthHelper } from "../../../shared/ui/helpers/auth.helper";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [LogoComponent, FormComponent],
})
export class LoginComponent {

  private authService = inject(AuthService);

  private authHelper = AuthHelper;

  selectedTab = signal<'login' | 'register'>('login');

  formUtils = FormUtils;

  submitLabel = computed(() => this.selectedTab() === 'login' ? $localize`:{@@login}:Login` : $localize`:{@@register}:Register`);
  formFields = computed(() => this.selectedTab() === 'login' ? this.authHelper.loginForm() : this.authHelper.registerForm());

  handleSubmit(data: LoginDTO | RegisterDTO) {
    if (this.selectedTab() === 'login') {
      this.onLoginSubmit(data as LoginDTO);
    } else {
      this.onRegisterSubmit(data as RegisterDTO);
    }
  }

  onLoginSubmit(data: LoginDTO) {
    this.authService.login(data)
  }

  onRegisterSubmit(data: RegisterDTO) {
    this.authService.register(data)
  }
}
