import { Component, OnInit } from '@angular/core';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { Router } from '@angular/router';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { chevronDown, chevronUp } from 'ionicons/icons';

@Component({
  selector: 'app-qizheng-horo-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: false,
})
export class QizhengHoroDetailComponent implements OnInit {
  title = '星盘详情';
  horoscopeData: Horoscope | null = null;

  // 控制三个表格的展开/折叠状态，默认都为折叠状态
  isNativeTransformedStarsCollapsed = true;
  isProcessTransformedStarsCollapsed = true;
  isLunarMansionsCollapsed = true;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig
  ) {
    addIcons({ chevronDown, chevronUp });
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
