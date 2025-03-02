import {Injectable} from "@angular/core";
import {AuthUser} from "../../type/interface/user";
import {HttpClient} from "@angular/common/http";

import {jwtDecode} from "jwt-decode";
import {map} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private readonly url = environment.admin_url;
  private _user: AuthUser = {
    id: 0,
    name: "",
    exp: 0,
  };


  public get user() {
    return this._user;
  }

  private _token = "";

  constructor(private http: HttpClient) {
  }

  public get token(): string {
    // token 未过期
    if (this._token !== "" && this._user.exp > Date.now()
      / 1000.0)
      return this._token;

    // token 过期
    if (this._token !== "" && this._user.exp <= Date.now() / 1000) {
      this._token = "";
      localStorage.removeItem("token");
      return "";
    }


    // 以下是 this._token===""
    const token = localStorage.getItem("token");

    if (token === null) return "";

    // _token === "", localstorage !== null 发生在第一次加载页面或更新了token
    try {
      const user = jwtDecode<AuthUser>(token);

      // 获取当前时间戳
      if (user.exp <= Date.now() / 1000) {
        // token 过期
        localStorage.removeItem("token");
        return "";
      }

      this._user = user;
      this._token = token;
      return token;
    } catch (error: any) {
      // 正常情况下是不会抛出错误
      console.log(`解析jwt错误：${error}`);
      localStorage.removeItem("token");
      return "";
    }
  }

  public get isAuth(): boolean {
    // 根据token过期时间判断token是否有效 在get token中已经判断
    return this.token !== "";
  }

  /**
   *
   * @param name 用户名
   * @param password 密码
   * 认证失败抛异常
   */
  public auth(name: string, password: string) {
    return this.http
      .post<{ token: string }>(
        `${this.url}/login`,
        {name, password},
      )
      .pipe(
        map((v) => {
          console.log(v)
          this._token = "";
          localStorage.setItem("token", v.token);
          // return  v;
        })
      );
  }

  public deleteToken() {
    this._token = "";
    localStorage.removeItem("token");
  }
}
