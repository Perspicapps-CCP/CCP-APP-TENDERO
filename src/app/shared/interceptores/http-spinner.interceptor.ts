import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { inject } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';

export const httpSpinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  spinnerService.show();

  return next(req).pipe(
    finalize(() => {
      spinnerService.hide();
    }),
  );
};
