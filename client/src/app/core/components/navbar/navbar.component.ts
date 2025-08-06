import { Component, inject } from "@angular/core";
import { LogoComponent } from "../../../shared/ui/logo/logo.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../shared/service/auth.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  imports: [LogoComponent, RouterLink, RouterLinkActive],
})
export class NavbarComponent {
  authService = inject(AuthService);
}
