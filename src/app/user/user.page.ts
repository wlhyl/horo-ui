import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonRow,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { getApiErrorMessage } from '../utils/api-error/api-error';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonInputPasswordToggle,
    IonRow,
    IonTitle,
    IonToolbar,
  ],
})
export class UserPage implements OnInit, ViewWillEnter {
  title = '用户';

  user = '';
  password = '';
  error = '';
  // signal：登录/注销在异步回调中赋值，普通字段不会标记 OnPush 视图刷新
  isAuth = signal(false);

  constructor(
    private titleService: Title,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  // 每次进入页面时重新同步登录态：isAuth getter 会校验 token 是否过期，
  // Ionic 路由会缓存页面（ngOnInit 不会重跑），必须在此刷新
  ionViewWillEnter() {
    this.isAuth.set(this.authService.isAuth);
    if (this.isAuth()) {
      this.user = this.authService.user?.name || '';
    }
  }

  login() {
    this.authService.auth(this.user, this.password).subscribe({
      next: () => {
        this.password = '';
        this.error = '';
        this.isAuth.set(true);
      },
      error: (err) => {
        this.error = '登录失败: ' + getApiErrorMessage(err);
      },
    });
  }

  logout() {
    this.authService.deleteToken();
    this.isAuth.set(false);
  }
}
