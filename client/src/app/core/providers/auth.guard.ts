import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../shared/service/auth.service";
import { effect, inject } from "@angular/core";

export const authGuard: CanActivateFn = async (_route, _state) => {
  const authService = inject(AuthService);

  if (authService.authStatus() !== 'authenticated') {
    authService.refresh();
    await new Promise<void>((resolve) => {
      const stop = effect(() => {
        if (authService.authStatus() !== 'checking' && authService.user()) {
          resolve();
          stop.destroy();
        }
      });
    });
  }

  return authService.authStatus() === 'authenticated';
}

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);

  return (authGuard(route, state)) && !!authService.user()?.isAdmin;
}
