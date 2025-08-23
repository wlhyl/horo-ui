import { Component, OnInit } from '@angular/core';
import { Path } from 'src/app/type/enum/path';
import { Title } from '@angular/platform-browser';
import { HoroscopeComparison } from 'src/app/type/interface/response-data';
import { Router } from '@angular/router';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: false,
})
export class DetailComponent implements OnInit {
  path = Path;
  title = '比较盘详情';

  compareData: HoroscopeComparison | null = null;

  degreeToDMSFn = degreeToDMS;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig
  ) {
    this.titleService.setTitle(this.title);
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state) {
      this.compareData = navigation.extras.state['data'] as HoroscopeComparison;
    }
  }

  ngOnInit() {}
}
