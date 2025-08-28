import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../shared/service/auth.service";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

export const authGuard: CanActivateFn = async (_route, _state) => {
  const authService = inject(AuthService);
  const response = await firstValueFrom(authService.checkStatus());

  return response ?? false;
}

export const adminGuard: CanActivateFn = async (_route, _state) => {
  const authService = inject(AuthService);
  const response = await firstValueFrom(authService.checkStatus());

  return (response ?? false) && authService.user()!.isAdmin;
}
