import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const url = environment.admin_url;

  if (!req.url.includes(url)) return next(req);

  if (req.url.includes('login')) return next(req);

  const authService = inject(AuthService);

  if (!authService.isAuth) return next(req);

  const request = req.clone({ setHeaders: { token: authService.token } });
  return next(request);
};
