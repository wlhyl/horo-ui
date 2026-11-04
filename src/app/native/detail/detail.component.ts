import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgStyle } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from '@ionic/angular';
import { Horoscope, ReturnHoroscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import {
  degNorm,
  degreeToDMS,
  zodiacLong,
} from 'src/app/utils/horo-math/horo-math';
import { ReceptionComponent } from './reception/reception.component';
import { TemperamentComponent } from './temperament/temperament.component';
import { PlanetPowerComponent } from './planet-power/planet-power.component';
import {
  Lot,
  LotAspectRow,
  calcLots,
} from 'src/app/utils/lots/lots';

@Component({
  selector: 'app-native-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
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

  constructor(
    public config: Horoconfig,
  ) {}

  // 计算所有 Lot（视力点、子女点），含相位、映点、反映点
  get lots(): Lot[] {
    return this.horoscopeData ? calcLots(this.horoscopeData) : [];
  }

  // Lot 的相位、映点、反映点合并平铺为表格行
  get lotAspectRows(): LotAspectRow[] {
    const rows: LotAspectRow[] = [];
    for (const lot of this.lots) {
      for (const a of lot.aspects) {
        rows.push({
          key: `${lot.key}-aspect-${a.aspect_value}-${a.p0}-${a.d}`,
          partLabel: lot.label,
          typeLabel: '相位',
          body: a.p0,
          item: a,
        });
      }
      for (const a of lot.antiscoins) {
        rows.push({
          key: `${lot.key}-antiscia-${a.p1}-${a.d}`,
          partLabel: lot.label,
          typeLabel: '映点',
          body: a.p1,
          item: a,
        });
      }
      for (const a of lot.contraantiscias) {
        rows.push({
          key: `${lot.key}-contraantiscia-${a.p1}-${a.d}`,
          partLabel: lot.label,
          typeLabel: '反映点',
          body: a.p1,
          item: a,
        });
      }
    }
    return rows;
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
