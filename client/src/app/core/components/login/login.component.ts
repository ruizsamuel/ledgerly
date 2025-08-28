import { Component, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { FormUtils } from "../../utils/form.utils";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../shared/service/auth.service";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../../shared/service/toast.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [LogoComponent, ReactiveFormsModule],
})
export class LoginComponent {

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);


  selectedTab = signal<'login' | 'register'>('login');

  formUtils = FormUtils;

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  registerForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, this.formUtils.fieldMatchValidator('password')]]
  });

  onLoginSubmit() {
    if (this.loginForm.valid) {
      firstValueFrom(this.authService.login(this.loginForm.value))
        .then(_res => {this.toastService.show($localize`:{@@loginSuccess}: Login successful`, 'success')});
    }
  }
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      firstValueFrom(this.authService.register(this.registerForm.value))
        .then(_res => {this.toastService.show($localize`:{@@registerSuccess}: Registration successful`, 'success')});
    }
  }
}
