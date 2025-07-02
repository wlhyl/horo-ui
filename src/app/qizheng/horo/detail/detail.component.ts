import { Component, OnInit } from '@angular/core';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { Router } from '@angular/router';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-qizheng-horo-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: false,
})
export class QizhengHoroDetailComponent implements OnInit {
  title = '星盘详情';
  horoscopeData: Horoscope | null = null;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig
  ) {
    // 从路由的 state 获取 horoscopeData 的值
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.horoscopeData = navigation.extras.state['data'] as Horoscope;
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
