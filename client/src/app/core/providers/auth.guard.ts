import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../shared/service/auth.service";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

export const authGuard: CanActivateFn = async (_route, _state) => {
  const authService = inject(AuthService);
  const response = await firstValueFrom(authService.checkStatus());

  if (response.status !== 200) {
    //TODO: Show toast with response.message only if user is not null (first time loading the app)
    console.error(response.message);
  }

  return response.content ?? false;
}

export const adminGuard: CanActivateFn = async (_route, _state) => {
  const authService = inject(AuthService);
  const response = await firstValueFrom(authService.checkStatus());

  if (response.status !== 200) {
    //TODO: Show toast with response.message
    console.error(response.message);
  }

  return (response.content ?? false) && authService.user()!.isAdmin;
}
