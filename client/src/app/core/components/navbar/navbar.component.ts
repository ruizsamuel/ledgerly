import { Component, inject } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../shared/service/auth.service";
import { AvatarPipe } from "../../../shared/ui/pipes/avatar.pipe";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  imports: [LogoComponent, RouterLink, RouterLinkActive, AvatarPipe],
})
export class NavbarComponent {
  authService = inject(AuthService);
}
