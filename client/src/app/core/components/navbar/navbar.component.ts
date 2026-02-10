import { Component, HostListener, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../shared/service/auth.service";
import { AvatarPipe } from "../../../shared/ui/pipes/avatar.pipe";
import { ModalService } from "../../../shared/service/modal.service";
import { FormComponent } from "../../../shared/ui/components/form/form.component";
import { AuthHelper } from "../../../shared/ui/helpers/auth.helper";
import { ChangePasswordDTO } from "../../../shared/domain/dto/auth.dto";
import { ToastService } from "../../../shared/service/toast.service";
import { UserService } from "../../../shared/service/user.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  imports: [LogoComponent, RouterLink, RouterLinkActive, AvatarPipe],
})
export class NavbarComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  modalService = inject(ModalService);
  toastService = inject(ToastService);

  authHelper = AuthHelper;

  showMenu = signal(false);
  showProfileMenu = signal(false);

  private wasInside = false;

  handleChangePassword() {
    this.modalService.open({
      component: FormComponent<ChangePasswordDTO>,
      inputs: {
        title: $localize`:{@@changePassword}:Change Password`,
        fields: this.authHelper.changePasswordForm(),
        submitButtonText: $localize`:{@@changePassword}:Change Password`
      },
      outputs: {
        formSubmit: async (data: ChangePasswordDTO) => {
          await firstValueFrom(this.authService.changePassword(data))
            .then(res => {
              if (res.message) this.toastService.show(res.message, 'success');
            })
            .finally(() => this.modalService.close());
        },
        formCancel: () => this.modalService.close()
      }
    });
  }

  handleChangeProfile() {
    this.modalService.open({
      component: FormComponent,
      inputs: {
        title: $localize`:{@@editProfile}:Edit Profile`,
        fields: this.authHelper.profileForm(this.authService.user()!),
        submitButtonText: $localize`:{@@saveChanges}:Save Changes`
      },
      outputs: {
        formSubmit: async (data) => {
          await firstValueFrom(this.userService.updateEntityByToken(data))
            .then(res => {
              this.authService.refresh();
              if (res.message) this.toastService.show(res.message, 'success');
              this.modalService.close();
            })
        },
        formCancel: () => this.modalService.close()
      }
    });
  }

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside) {
      this.showMenu.set(false);
      this.showProfileMenu.set(false);
    }
    this.wasInside = false;
  }
}
