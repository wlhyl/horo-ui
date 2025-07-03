import { Injectable } from '@angular/core';
import { AuthUser } from '../../type/interface/user';
import { HttpClient } from '@angular/common/http';

import { jwtDecode } from 'jwt-decode';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url = environment.admin_url;
  private _user: AuthUser | null = null;
  private jwtDecodeFn = jwtDecode;

  public get user() {
    if (this._user) {
      return this._user;
    }
    this.token; // 触发token getter来解析并设置_user
    return this._user;
  }

  constructor(private http: HttpClient) {}

  public get token(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      this._user = null;
      return '';
    }

    try {
      const user = this.jwtDecodeFn<AuthUser>(token);

      if (user.exp * 1000 <= Date.now()) {
        localStorage.removeItem('token');
        this._user = null;
        return '';
      }

      this._user = user;
      return token;
    } catch (error: any) {
      // 正常情况下是不会抛出错误
      console.log(`解析jwt错误：${error}`);
      localStorage.removeItem('token');
      this._user = null;
      return '';
    }
  }

  public get isAuth(): boolean {
    return !!this.token;
  }

  /**
   *
   * @param name 用户名
   * @param password 密码
   * 认证失败抛异常
   */
  public auth(name: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.url}/login`, { name, password })
      .pipe(
        map((v) => {
          localStorage.setItem('token', v.token);
          this._user = this.jwtDecodeFn<AuthUser>(v.token); // 登录成功后立即更新_user
        })
      );
  }

  public deleteToken() {
    localStorage.removeItem('token');
    this._user = null;
  }
}
