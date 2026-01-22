import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
          // Don't redirect if this is an auth endpoint (login/register)
          // Let the component handle the error
          if (!req.url.includes('/auth/')) {
            router.navigate(['/auth/login']);
            errorMessage = 'Session expired. Please login again.';
          } else {
            errorMessage = 'Invalid credentials. Please try again.';
          }
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }

      // Log error for debugging
      console.error('HTTP Error:', errorMessage, error);

      return throwError(() => new Error(errorMessage));
    })
  );
};
