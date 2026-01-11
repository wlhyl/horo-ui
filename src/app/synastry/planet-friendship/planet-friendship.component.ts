import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-planet-friendship',
  templateUrl: './planet-friendship.component.html',
  styleUrls: ['./planet-friendship.component.scss'],
  standalone: false,
})
export class PlanetFriendshipComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('行星友谊');
  }
}
