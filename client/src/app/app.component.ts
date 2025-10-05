import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './shared/service/user.service';
import { AuthService } from './shared/service/auth.service';
import { CreateAdminPageComponent } from './core/components/create-admin/create-admin.component';
import { LoadingComponent } from './shared/ui/components/loading/loading.component';
import { LoginComponent } from './core/components/login/login.component';
import { ToastComponent } from './core/components/toast/toast.component';
import { ModalComponent } from './core/components/modal/modal.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';


@Component({
  selector: 'app-root',
  imports: [CreateAdminPageComponent, LoadingComponent, LoginComponent, ToastComponent, ModalComponent, RouterOutlet, NavbarComponent],
  template: `
    <app-toast />
    <app-modal />
    @if (loading()) {
      <app-loading class="flex justify-center align-middle w-screen h-screen"/>
    }
    @else {
      @if (!hasUsers()) {
        <app-create-admin-page></app-create-admin-page>
      }
      @else if (authStatus() === 'checking') {
        <app-loading class="flex justify-center align-middle w-screen h-screen"/>
      }
      @else if (authStatus() === 'unauthenticated') {
        <app-login></app-login>
      }
      @else if (authStatus() === 'authenticated') {
        <app-navbar/>
        <router-outlet />
        <div class="lg:hidden mt-30"></div>
      }
    }
  `
})
export class AppComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  loading = signal<boolean>(true);

  authStatus = this.authService.authStatus;
  hasUsers = this.userService.hasUsers;

  async ngOnInit() {
    await this.userService.checkHasUsers();
    this.loading.set(false);
  }
}
