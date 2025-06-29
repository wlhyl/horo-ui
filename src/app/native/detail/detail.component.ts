import { Component, OnInit } from '@angular/core';
import { Path } from 'src/app/type/enum/path';
import { Title } from '@angular/platform-browser';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Router } from '@angular/router'; // 导入 Router
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { degreeToDMS } from 'src/app/utils/horo-math';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    standalone: false
})
export class DetailComponent implements OnInit {
  path = Path;
  title = '星盘详情';

  horoscopeData: Horoscope | null = null;

  degreeToDMSFn = degreeToDMS;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig
  ) {
    this.titleService.setTitle(this.title);
    // 从路由的 state 获取 horoscopeData 的值
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.horoscopeData = navigation.extras.state['data'] as Horoscope;
    }
  }

  ngOnInit() {}
}
