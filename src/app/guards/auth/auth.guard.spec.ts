import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from 'src/app/services/auth/auth.service';

describe('authGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', [], ['isAuth']);
    routerMock = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      Object.defineProperty(authServiceMock, 'isAuth', { get: () => true });
    });

    it('should return true', () => {
      const result = executeGuard({} as any, [] as any);
      expect(result).toBe(true);
    });

    it('should not call router.parseUrl', () => {
      executeGuard({} as any, [] as any);
      expect(routerMock.parseUrl).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      Object.defineProperty(authServiceMock, 'isAuth', { get: () => false });
    });

    it('should call router.parseUrl with "/user"', () => {
      executeGuard({} as any, [] as any);
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/user');
    });

    it('should return the result of router.parseUrl', () => {
      const parseUrlResult = '/user' as any;
      routerMock.parseUrl.and.returnValue(parseUrlResult);

      const result = executeGuard({} as any, [] as any);
      expect(result).toBe(parseUrlResult);
    });
  });
});
