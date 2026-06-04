import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Router } from '@angular/router';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';

@Component({
  selector: 'app-historical-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: false,
})
export class DetailComponent implements OnInit {
  title = '古代星盘详情';

  horoscopeData: Horoscope | null = null;

  degreeToDMSFn = degreeToDMS;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig,
  ) {
    this.titleService.setTitle(this.title);
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state) {
      this.horoscopeData = navigation.extras.state['data'] as Horoscope;
    }
  }

  ngOnInit() {}
}
