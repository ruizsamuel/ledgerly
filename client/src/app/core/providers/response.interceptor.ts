import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../../shared/service/toast.service';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {
      if (error.error?.message) {
        toastService.show(error.error?.message, 'error');
      }
      throw error;
    })
  );
};
