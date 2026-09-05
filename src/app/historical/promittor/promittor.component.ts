import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Horoscope } from 'src/app/type/interface/response-data';

@Component({
  selector: 'app-historical-promittor',
  templateUrl: './promittor.component.html',
  styleUrls: ['./promittor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HistoricalPromittorComponent {
  title = '承诺星盘';

  horoscoData: Horoscope | null = null;

  constructor(
    private titleService: Title,
    private router: Router,
  ) {
    this.titleService.setTitle(this.title);
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state) {
      this.horoscoData = navigation.extras.state['data'] as Horoscope;
    }
  }

  ngOnInit() {}
}
