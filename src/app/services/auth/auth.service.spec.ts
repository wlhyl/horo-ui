import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../../type/interface/user';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const mockToken = 'mock.jwt.token';
  const mockUser: AuthUser = {
    exp: Math.floor(Date.now() / 1000) + 1000,
    id: 1,
    name: 'user',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token getter', () => {
    it('should return empty string if no token', () => {
      expect(service.token).toBe('');
      expect((service as any)._user).toBeNull();
    });

    it('should decode and return token if valid', () => {
      localStorage.setItem('token', mockToken);
      spyOn(service as any, 'jwtDecodeFn').and.returnValue(mockUser);
      expect(service.token).toBe(mockToken);
      expect((service as any)._user).toEqual(mockUser);
    });

    it('should remove token and return empty if expired', () => {
      const expiredUser: AuthUser = {
        exp: Math.floor(Date.now() / 1000) - 1000,
        id: 1,
        name: 'user',
      };
      localStorage.setItem('token', mockToken);
      spyOn(service as any, 'jwtDecodeFn').and.returnValue(expiredUser);
      expect(service.token).toBe('');
      expect(localStorage.getItem('token')).toBeNull();
      expect((service as any)._user).toBeNull();
    });

    it('should handle decode error', () => {
      localStorage.setItem('token', mockToken);
      spyOn(service as any, 'jwtDecodeFn').and.throwError('decode error');
      expect(service.token).toBe('');
      expect(localStorage.getItem('token')).toBeNull();
      expect((service as any)._user).toBeNull();
    });
  });

  describe('user getter', () => {
    it('should return _user if exists', () => {
      (service as any)._user = mockUser;
      expect(service.user).toBe(mockUser);
    });

    it('should trigger token getter if _user is null', () => {
      spyOn(service as any, 'jwtDecodeFn').and.returnValue(mockUser);
      localStorage.setItem('token', mockToken);
      (service as any)._user = null;
      expect(service.user).toEqual(mockUser);
    });
  });

  it('isAuth should reflect token presence', () => {
    expect(service.isAuth).toBe(false);
    spyOn(service as any, 'jwtDecodeFn').and.returnValue(mockUser);
    localStorage.setItem('token', mockToken);
    expect(service.isAuth).toBe(true);
  });

  describe('auth', () => {
    it('should post login and set token/_user', () => {
      spyOn(service as any, 'jwtDecodeFn').and.returnValue(mockUser);
      service.auth('user', 'pass').subscribe(() => {
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect((service as any)._user).toEqual(mockUser);
      });
      const req = httpMock.expectOne(`${environment.admin_url}/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ token: mockToken });
    });
  });

  it('deleteToken should clear token and _user', () => {
    localStorage.setItem('token', mockToken);
    (service as any)._user = mockUser;
    service.deleteToken();
    expect(localStorage.getItem('token')).toBeNull();
    expect((service as any)._user).toBeNull();
  });
});
