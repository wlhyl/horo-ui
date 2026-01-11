import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Path } from '../type/enum/path';
import {
  starOutline,
  playForwardOutline,
  star,
  bulbOutline,
  serverOutline,
  trashOutline,
  personOutline,
  chatboxEllipsesOutline,
  copyOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  path = Path;
  constructor(private router: Router, public authService: AuthService) {
    addIcons({
      starOutline,
      playForwardOutline,
      star,
      bulbOutline,
      serverOutline,
      trashOutline,
      personOutline,
      chatboxEllipsesOutline,
      copyOutline,
    });
  }
  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}
