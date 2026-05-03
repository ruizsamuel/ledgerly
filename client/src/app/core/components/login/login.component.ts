import { Component, computed, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/common/ui/components/logo/logo.component";
import { FormUtils } from "../../../shared/common/utils/form.utils";
import { AuthService } from "../../../shared/common/services/auth.service";
import { FormComponent } from "../../../shared/common/ui/components/form/form.component";
import { LoginDTO, RegisterDTO } from "../../../shared/common/models/auth.model";
import { AuthHelper } from "../../../shared/domain/ui/helpers/auth.helper";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [LogoComponent, FormComponent],
})
export class LoginComponent {

  private authService = inject(AuthService);

  private authHelper = AuthHelper;

  selectedTab = signal<'login' | 'register'>('login');
  useDemoCredentials = signal(false);

  formUtils = FormUtils;

  submitLabel = computed(() => this.selectedTab() === 'login' ? $localize`:{@@login}:Login` : $localize`:{@@register}:Register`);
  formFields = computed(() => {
    if (this.selectedTab() === 'login') {
      return this.authHelper.loginForm(this.useDemoCredentials() ? {
        email: 'demo@ledgerly.local',
        password: 'demo'
      } : undefined);
    }

    return this.authHelper.registerForm();
  });

  fillDemoCredentials() {
    this.selectedTab.set('login');
    this.useDemoCredentials.set(true);
  }

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
