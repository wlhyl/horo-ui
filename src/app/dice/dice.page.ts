import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonLabel,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { Horoconfig } from '../services/config/horo-config.service';
import { PlanetName } from '../type/enum/planet';
import { Zodiac } from '../type/enum/zodiac';

/** 骰子可用的传统七行星与南北交点 */
const DICE_PLANETS: readonly PlanetName[] = [
  PlanetName.Sun,
  PlanetName.Moon,
  PlanetName.Mercury,
  PlanetName.Venus,
  PlanetName.Mars,
  PlanetName.Jupiter,
  PlanetName.Saturn,
  PlanetName.NorthNode,
  PlanetName.SouthNode,
];

/** 行星中文名 */
const PLANET_TITLES: { [key in PlanetName]?: string } = {
  [PlanetName.Sun]: '太阳',
  [PlanetName.Moon]: '月亮',
  [PlanetName.Mercury]: '水星',
  [PlanetName.Venus]: '金星',
  [PlanetName.Mars]: '火星',
  [PlanetName.Jupiter]: '木星',
  [PlanetName.Saturn]: '土星',
  [PlanetName.NorthNode]: '北交点',
  [PlanetName.SouthNode]: '南交点',
};

/** 星座中文名 */
const ZODIAC_TITLES: { [key in Zodiac]: string } = {
  [Zodiac.Aries]: '白羊座',
  [Zodiac.Taurus]: '金牛座',
  [Zodiac.Gemini]: '双子座',
  [Zodiac.Cancer]: '巨蟹座',
  [Zodiac.Leo]: '狮子座',
  [Zodiac.Virgo]: '处女座',
  [Zodiac.Libra]: '天秤座',
  [Zodiac.Scorpio]: '天蝎座',
  [Zodiac.Sagittarius]: '射手座',
  [Zodiac.Capricorn]: '摩羯座',
  [Zodiac.Aquarius]: '水瓶座',
  [Zodiac.Pisces]: '双鱼座',
};

interface DiceResult {
  planet: PlanetName
  zodiac: Zodiac
  house: number
  time: Date
}

@Component({
  selector: 'app-dice',
  templateUrl: './dice.page.html',
  styleUrls: ['./dice.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButtons,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonLabel,
    IonRow,
    IonTitle,
    IonToolbar,
  ],
})
export class DicePage implements OnInit {
  title = '占星骰子'
  result = signal<DiceResult | null>(null)
  rolling = signal(false)
  note = signal('')

  PlanetName = PlanetName
  Zodiac = Zodiac

  private rollTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    public config: Horoconfig,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title)
  }

  planetTitle(planet: PlanetName): string {
    return PLANET_TITLES[planet] ?? planet
  }

  zodiacTitle(zodiac: Zodiac): string {
    return ZODIAC_TITLES[zodiac]
  }

  /** 投掷时间，格式：yyyy-MM-dd HH:mm:ss */
  formatDateTime(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      + ` ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  roll() {
    if (this.rolling()) return
    this.rolling.set(true)
    if (this.rollTimer !== null) clearTimeout(this.rollTimer)
    this.rollTimer = setTimeout(() => {
      this.result.set({
        planet: DICE_PLANETS[Math.floor(Math.random() * DICE_PLANETS.length)],
        zodiac: Math.floor(Math.random() * 12) as Zodiac,
        house: Math.floor(Math.random() * 12) + 1,
        time: new Date(),
      })
      this.rolling.set(false)
      this.rollTimer = null
    }, 500)
  }
}
