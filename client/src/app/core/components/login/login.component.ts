import { Component, computed, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { FormUtils } from "../../utils/form.utils";
import { Validators } from "@angular/forms";
import { AuthService } from "../../../shared/service/auth.service";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../../shared/service/toast.service";
import { FormField } from "../../../shared/ui/types/form-field.model";
import { FormComponent } from "../../../shared/ui/components/form/form.component";
import { LoginDTO } from "../../../shared/domain/dto/login.dto";
import { NewUserDTO } from "../../../shared/domain/dto/user.dto";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [LogoComponent, FormComponent],
})
export class LoginComponent {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);


  selectedTab = signal<'login' | 'register'>('login');

  formUtils = FormUtils;

  submitLabel = computed(() => this.selectedTab() === 'login' ? $localize`:{@@login}:Login` : $localize`:{@@register}:Register`);
  formFields = computed<FormField[]>(() => this.selectedTab() === 'login' ? [
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
      label: $localize`:{@@password}:Password`,
      placeholder: $localize`:{@@password}:Password`,
      type: 'password',
      key: 'password',
      validators: [Validators.required]
    }
  ] : [
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
    },
    {
      value: '',
      label: $localize`:{@@confirmPassword}:Confirm Password`,
      placeholder: $localize`:{@@confirmPassword}:Confirm Password`,
      type: 'password',
      key: 'confirmPassword',
      validators: [Validators.required, this.formUtils.fieldMatchValidator('password')]
    }
  ]);

  handleSubmit(data: LoginDTO | NewUserDTO) {
    if (this.selectedTab() === 'login') {
      this.onLoginSubmit(data as LoginDTO);
    } else {
      this.onRegisterSubmit(data as NewUserDTO);
    }
  }

  onLoginSubmit(data: LoginDTO) {
    firstValueFrom(this.authService.login(data))
      .then(res => {if (res) this.toastService.show($localize`:{@@loginSuccess}: Login successful`, 'success')});
  }
  onRegisterSubmit(data: NewUserDTO) {
    firstValueFrom(this.authService.register(data))
      .then(res => {if (res) this.toastService.show($localize`:{@@registerSuccess}: Registration successful`, 'success')});
  }
}
