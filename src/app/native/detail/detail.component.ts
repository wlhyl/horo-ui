import {
  Component,
  Input,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Horoscope, ReturnHoroscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import {
  degNorm,
  degreeToDMS,
  zodiacLong,
} from 'src/app/utils/horo-math/horo-math';
import { PlanetName } from 'src/app/type/enum/planet';
import { ReceptionComponent } from './reception/reception.component';
import { TemperamentComponent } from './temperament/temperament.component';
import { PlanetPowerComponent } from './planet-power/planet-power.component';

@Component({
  selector: 'app-native-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgStyle,
    ReceptionComponent,
    TemperamentComponent,
    PlanetPowerComponent,
  ],
})
export class DetailComponent {
  @Input() horoscopeData: Horoscope | ReturnHoroscope | null = null;

  degreeToDMSFn = degreeToDMS;
  zodiacLong = zodiacLong;
  planetName = PlanetName;

  constructor(
    public config: Horoconfig,
  ) {}

  // 计算太阳视力点：ASC + 太阳黄道经度 - 火星黄道经度
  get partOfSolarVision(): number | null {
    if (!this.horoscopeData) return null;

    const sun = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Sun,
    );
    if (!sun) return null;
    const sunLong = sun.long;

    const mars = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Mars,
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
      (p) => p.name === PlanetName.Moon,
    );
    if (!moon) return null;
    const moonLong = moon.long;

    const saturn = this.horoscopeData.planets.find(
      (p) => p.name === PlanetName.Saturn,
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
