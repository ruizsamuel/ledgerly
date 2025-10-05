import { Component, HostListener, inject, signal } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../shared/service/auth.service";
import { AvatarPipe } from "../../../shared/ui/pipes/avatar.pipe";
import { ModalService } from "../../../shared/service/modal.service";
import { FormComponent } from "../../../shared/ui/components/form/form.component";
import { AuthHelper } from "../../../shared/ui/helpers/auth.helper";
import { ChangePasswordDTO } from "../../../shared/domain/dto/auth.dto";
import { firstValueFrom } from "rxjs";
import { ToastService } from "../../../shared/service/toast.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  imports: [LogoComponent, RouterLink, RouterLinkActive, AvatarPipe],
})
export class NavbarComponent {
  authService = inject(AuthService);
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
    // TODO: Implement change profile functionality
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
