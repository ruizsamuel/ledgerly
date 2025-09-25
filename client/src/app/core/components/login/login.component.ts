import { Component, computed, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { FormUtils } from "../../utils/form.utils";
import { AuthService } from "../../../shared/service/auth.service";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../../shared/service/toast.service";
import { FormComponent } from "../../../shared/ui/components/form/form.component";
import { LoginDTO, RegisterDTO } from "../../../shared/domain/dto/auth.dto";
import { AuthHelper } from "../../../shared/ui/helpers/auth.helper";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [LogoComponent, FormComponent],
})
export class LoginComponent {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

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
    firstValueFrom(this.authService.login(data))
      .then(res => {
        if (res) this.toastService.show($localize`:{@@loginSuccess}: Login successful`, 'success')
        this.router.navigate(['/dashboard']);
      });
  }
  onRegisterSubmit(data: RegisterDTO) {
    firstValueFrom(this.authService.register(data))
      .then(res => {
        if (res) this.toastService.show($localize`:{@@registerSuccess}: Registration successful`, 'success')
        this.router.navigate(['/dashboard']);
      });
  }
}
