import { Component, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/logo/logo.component";
import { FormUtils } from "../../utils/form.utils";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../shared/service/auth.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [LogoComponent, ReactiveFormsModule],
})
export class LoginComponent {

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);


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
        .then(/*TODO: TOAST*/)
        .catch(err => { console.error('Login failed', err); /*TODO: TOAST*/ });
    }
  }
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      firstValueFrom(this.authService.register(this.registerForm.value))
        .then(/*TODO: TOAST*/)
        .catch(err => { console.error('Registration failed', err); /*TODO: TOAST*/ });
    }
  }
}
