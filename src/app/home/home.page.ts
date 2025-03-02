import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Path } from '../type/enum/path';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  path = Path;
  constructor(private router: Router, public authService: AuthService) {}
  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}
