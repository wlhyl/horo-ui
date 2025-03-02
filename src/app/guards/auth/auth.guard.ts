import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const user = inject(AuthService);
  const router = inject(Router);

  if (user.isAuth) return true;
  else return router.parseUrl('/user');
};
