import { Component, OnInit } from '@angular/core';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { Router } from '@angular/router';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { Title } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { chevronDown, chevronUp } from 'ionicons/icons';
import {
  planetsBadConfigs,
  planetsGoodConfigs,
} from 'src/app/utils/qizheng-planet-power/qizheng-planet-power';

@Component({
  selector: 'app-qizheng-horo-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: false,
})
export class QizhengHoroDetailComponent implements OnInit {
  title = '星盘详情';
  horoscopeData: Horoscope | null = null;
  // 星辰贵格
  planetsGoodConfigs: string[] = [];
  // 星辰贱格
  planetsBadConfigs: string[] = [];

  // 神煞
  nativeShenShas: string[][] = [[], [], [], [], [], [], [], [], [], [], [], []];
  processShenShas: string[][] = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

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

    if (this.horoscopeData) {
      this.planetsGoodConfigs = planetsGoodConfigs(
        this.horoscopeData.native_planets
      );
      this.planetsBadConfigs = planetsBadConfigs(
        this.horoscopeData.native_planets
      );
      const nativeIndex = this.天厨(
        this.horoscopeData.native_lunar_calendar.lunar_year_gan_zhi[0]
      );
      this.nativeShenShas[nativeIndex].push('天厨');

      const processIndex = this.天厨(
        this.horoscopeData.process_lunar_calendar.lunar_year_gan_zhi[0]
      );
      this.processShenShas[processIndex].push('天厨');
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  天厨(gan: string) {
    switch (gan) {
      case '甲':
        // '巳'
        return 5;
      case '乙':
        // '午'
        return 6;
      case '丙':
        // '子'
        return 0;
        break;
      case '丁':
        // '巳'
        return 5;
      case '戊':
        // '午'
        return 6;
      case '己':
        // '申'
        return 8;
      case '庚':
        // '寅'
        return 2;
      case '辛':
        // '午'
        return 6;
      case '壬':
        // '酉'
        return 9;
      default:
        // '亥';
        return 11;
    }
  }
}
