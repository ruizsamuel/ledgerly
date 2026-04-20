import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ToastService } from '../../shared/common/services/toast.service';
import { AuthService } from '../../shared/common/services/auth.service';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {
      if (error.error?.status === 401 || error.status === 401) {
        if (!req.url.includes('/auth/refresh')) { authService.refresh() ; return of(); }
      } else if (error.error?.status === 403 || error.status === 403) {
        toastService.show(error.error?.message ?? '(Unknown)', 'error');
        authService.logout();
      } else if (error.error?.message) {
        toastService.show(`Error ${error.error?.status ?? '(Unknown)'}: ${error.error?.message}`, 'error');
      }
      throw error;
    })
  );
};
