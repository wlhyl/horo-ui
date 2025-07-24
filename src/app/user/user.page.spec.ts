import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPage } from './user.page';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Path } from '../type/enum/path';
import { AuthUser } from '../type/interface/user';

describe('UserPage', () => {
  let component: UserPage;
  let fixture: ComponentFixture<UserPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockAuthUser: AuthUser;
  let isAuthSpy: jasmine.Spy;
  let userSpy: jasmine.Spy;

  beforeEach(() => {
    // 创建 AuthService 和 Title 服务的模拟对象
    mockAuthService = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['auth', 'deleteToken'],
      ['isAuth', 'user']
    );
    isAuthSpy = Object.getOwnPropertyDescriptor(mockAuthService, 'isAuth')!
      .get as jasmine.Spy;
    userSpy = Object.getOwnPropertyDescriptor(mockAuthService, 'user')!
      .get as jasmine.Spy;
    isAuthSpy.and.returnValue(false);
    userSpy.and.returnValue(null);

    mockTitleService = jasmine.createSpyObj<Title>('Title', ['setTitle']);

    mockAuthUser = {
      id: 1,
      name: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 1000,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Title, useValue: mockTitleService },
      ],
    });

    fixture = TestBed.createComponent(UserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set the page title', () => {
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('用户');
    });

    it('should have correct path enum', () => {
      expect(component.path).toBe(Path);
    });

    it('should set user name if user is authenticated', () => {
      // 设置模拟的认证状态和用户数据
      isAuthSpy.and.returnValue(true);
      userSpy.and.returnValue(mockAuthUser);

      component.ngOnInit();

      expect(component.user).toBe('testuser');
    });

    it('should not set user name if user is not authenticated', () => {
      isAuthSpy.and.returnValue(false);

      component.ngOnInit();

      expect(component.user).toBe('');
    });
  });

  describe('login', () => {
    it('should call authService.auth with user credentials', () => {
      // 设置组件的用户和密码
      component.user = 'testuser';
      component.password = 'testpass';

      // 模拟成功的认证响应
      mockAuthService.auth.and.returnValue(of(undefined));

      component.login();

      expect(mockAuthService.auth).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('should clear password and error on successful login', () => {
      component.user = 'testuser';
      component.password = 'testpass';
      component.error = 'some error';

      // 模拟成功的认证响应
      mockAuthService.auth.and.returnValue(of(undefined));

      component.login();

      expect(component.password).toBe('');
      expect(component.error).toBe('');
    });

    it('should set error message on login failure', () => {
      component.user = 'testuser';
      component.password = 'wrongpass';

      // 模拟失败的认证响应
      const errorResponse = new HttpErrorResponse({
        error: { error: 'Invalid credentials' },
        status: 401,
        statusText: 'Unauthorized',
      });
      mockAuthService.auth.and.returnValue(throwError(() => errorResponse));

      component.login();

      expect(component.error).toBe('Invalid credentials');
    });

    it('should set generic error message when error.error is not available', () => {
      component.user = 'testuser';
      component.password = 'wrongpass';

      // 模拟失败的认证响应，但没有具体的错误信息
      const errorResponse = new HttpErrorResponse({
        error: null, // 模拟 error 属性为 null
        status: 500,
        statusText: 'Internal Server Error',
      });
      mockAuthService.auth.and.returnValue(throwError(() => errorResponse));

      component.login();

      expect(component.error).toBe('登录失败');
    });

    it('should handle error without error property in response', () => {
      component.user = 'testuser';
      component.password = 'wrongpass';

      // 模拟一个没有 error 属性的错误对象
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
      });
      mockAuthService.auth.and.returnValue(throwError(() => errorResponse));

      component.login();

      expect(component.error).toBe('登录失败');
    });
  });

  describe('logout', () => {
    it('should call authService.deleteToken', () => {
      component.logout();

      expect(mockAuthService.deleteToken).toHaveBeenCalled();
    });
  });
});
