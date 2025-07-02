import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../services/auth/auth.service';
import { Path } from '../type/enum/path';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: false,
})
export class UserPage implements OnInit {
  path = Path;
  title = '用户';

  user = '';
  password = '';
  error = '';

  constructor(private titleService: Title, public authService: AuthService) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    if (this.authService.isAuth) {
      this.user = this.authService.user?.name || '';
    }
  }

  login() {
    this.authService.auth(this.user, this.password).subscribe({
      next: () => {
        this.password = '';
        this.error = '';
      },
      error: (err) => {
        err.error.error
          ? (this.error = err.error.error)
          : (this.error = '登录失败');
      },
    });
  }

  logout() {
    this.authService.deleteToken();
  }
}
