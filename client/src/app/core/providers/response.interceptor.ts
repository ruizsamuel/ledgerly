import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../../shared/service/toast.service';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {
      if (error.error?.message) {
        toastService.show(`Error ${error.error?.status ?? '(Unknown)'}: ${error.error?.message}`, 'error');
      }
      throw error;
    })
  );
};
