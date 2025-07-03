import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { caretForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: false,
})
export class AboutPage implements OnInit {
  title = '说明';

  constructor(private titleService: Title) {
    addIcons({
      caretForwardOutline,
    });
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
