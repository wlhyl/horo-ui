import { Component, OnInit } from '@angular/core';
import { Path } from 'src/app/type/enum/path';
import { Title } from '@angular/platform-browser';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Router } from '@angular/router'; // 导入 Router
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import {
  degNorm,
  degreeToDMS,
  zodiacLong,
} from 'src/app/utils/horo-math/horo-math';
import { PlanetName } from 'src/app/type/enum/planet';

@Component({
  selector: 'app-native-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: false,
})
export class DetailComponent implements OnInit {
  path = Path;
  title = '星盘详情';

  horoscopeData: Horoscope | null = null;

  degreeToDMSFn = degreeToDMS;
  zodiacLong = zodiacLong;
  planetName = PlanetName;

  constructor(
    private titleService: Title,
    private router: Router,
    public config: Horoconfig
  ) {
    this.titleService.setTitle(this.title);
    // 从路由的 state 获取 horoscopeData 的值
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state) {
      this.horoscopeData = navigation.extras.state['data'] as Horoscope;
    }
  }

  ngOnInit() {}

  // 计算太阳视力点：ASC + 太阳黄道经度 - 火星黄道经度
  get partOfSolarVision(): number | null {
    if (!this.horoscopeData) return null;

    const sun = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Sun
    );
    if (!sun) return null;
    const sunLong = sun.long;

    const mars = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Mars
    );
    if (!mars) return null;
    const marsLong = mars.long;

    const ascLong = this.horoscopeData.asc.long;

    // 计算视力点，确保结果在0-360度范围内
    const visionPoint = ascLong + sunLong - marsLong;
    return degNorm(visionPoint);
  }

  // 计算月亮视力点：ASC + 月亮黄道经度 - 土星黄道经度
  get partOfLunarVision(): number | null {
    if (!this.horoscopeData) return null;

    const moon = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Moon
    );
    if (!moon) return null;
    const moonLong = moon.long;

    const saturn = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Saturn
    );
    if (!saturn) return null;
    const saturnLong = saturn.long;

    const ascLong = this.horoscopeData.asc.long;

    // 计算视力点，确保结果在0-360度范围内
    const visionPoint = ascLong + moonLong - saturnLong;
    return degNorm(visionPoint);
  }

  // 计算行星与恒星的黄道经度差
  calculateLongitudeDifference(planetLong: number, starLong: number): number {
    const diff = degNorm(planetLong - starLong);
    return diff > 180 ? 360 - diff : diff;
  }

  // 获取包含四轴和行星的数组，用于与恒星比较
  get angularHousesAndPlanets() {
    if (!this.horoscopeData) return [];
    return [
      this.horoscopeData.asc,
      this.horoscopeData.mc,
      this.horoscopeData.dsc,
      this.horoscopeData.ic,
      ...this.horoscopeData.planets,
    ];
  }
}
