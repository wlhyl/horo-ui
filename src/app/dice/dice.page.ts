import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CheckboxChangeEventDetail } from '@ionic/core';
import { addIcons } from 'ionicons';
import { cloudOutline } from 'ionicons/icons';
import {
  IonAlert,
  IonBackButton,
  IonButtons,
  IonButton,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { Horoconfig } from '../services/config/horo-config.service';
import { ApiService } from '../services/api/api.service';
import { AuthService } from '../services/auth/auth.service';
import { PlanetName } from '../type/enum/planet';
import { PlanetName as QizhengPlanetName } from '../type/enum/qizheng';
import { Zodiac } from '../type/enum/zodiac';
import {
  DiceRequest,
  UpdateDiceRequest,
} from '../type/interface/horo-admin/dice';
import { getApiErrorMessage } from '../utils/api-error/api-error';

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

/** 七政四余骰子可用的十一曜 */
const QIZHENG_PLANETS: readonly QizhengPlanetName[] = [
  QizhengPlanetName.日,
  QizhengPlanetName.月,
  QizhengPlanetName.水,
  QizhengPlanetName.金,
  QizhengPlanetName.火,
  QizhengPlanetName.木,
  QizhengPlanetName.土,
  QizhengPlanetName.计,
  QizhengPlanetName.罗,
  QizhengPlanetName.孛,
  QizhengPlanetName.气,
]

/** 七政四余行星符号（紫气由模板以空心云朵图标显示；孛不在 HamburgSymbols 字体内，靠系统字体回退） */
const QIZHENG_GLYPHS: { [key in Exclude<QizhengPlanetName, QizhengPlanetName.气>]: string } = {
  [QizhengPlanetName.日]: 'Q',
  [QizhengPlanetName.月]: 'W',
  [QizhengPlanetName.水]: 'E',
  [QizhengPlanetName.金]: 'R',
  [QizhengPlanetName.火]: 'T',
  [QizhengPlanetName.木]: 'Y',
  [QizhengPlanetName.土]: 'U',
  [QizhengPlanetName.计]: '{',
  [QizhengPlanetName.罗]: '}',
  [QizhengPlanetName.孛]: '⚸',
}

/** 七政四余行星中文名 */
const QIZHENG_TITLES: { [key in QizhengPlanetName]: string } = {
  [QizhengPlanetName.日]: '太阳',
  [QizhengPlanetName.月]: '月亮',
  [QizhengPlanetName.水]: '水星',
  [QizhengPlanetName.金]: '金星',
  [QizhengPlanetName.火]: '火星',
  [QizhengPlanetName.木]: '木星',
  [QizhengPlanetName.土]: '土星',
  [QizhengPlanetName.计]: '计都',
  [QizhengPlanetName.罗]: '罗喉',
  [QizhengPlanetName.孛]: '月孛',
  [QizhengPlanetName.气]: '紫气',
}

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
  planet: PlanetName | QizhengPlanetName
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
    IonAlert,
    IonBackButton,
    IonButtons,
    IonButton,
    IonCheckbox,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
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
  useQizheng = signal(false)
  saving = signal(false)
  savedId = signal(0) // 0 表示尚未保存（数据库 ID 从 1 起）
  isAlertOpen = signal(false)
  alertButtons = ['OK']
  message = signal('')

  PlanetName = PlanetName
  QizhengPlanetName = QizhengPlanetName
  Zodiac = Zodiac

  private rollTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    public config: Horoconfig,
    private api: ApiService,
    private authService: AuthService,
    private titleService: Title,
  ) {
    addIcons({ cloudOutline })
  }

  ngOnInit() {
    this.titleService.setTitle(this.title)
  }

  onQizhengToggle(ev: CustomEvent<CheckboxChangeEventDetail>) {
    this.useQizheng.set(ev.detail.checked ?? false)
    this.result.set(null)
  }

  isQi(planet: PlanetName | QizhengPlanetName): boolean {
    return planet === QizhengPlanetName.气
  }

  planetGlyph(planet: PlanetName | QizhengPlanetName): string {
    if (this.useQizheng()) return QIZHENG_GLYPHS[planet as Exclude<QizhengPlanetName, QizhengPlanetName.气>] ?? ''
    return this.config.planetFontString(planet as PlanetName)
  }

  planetFont(planet: PlanetName | QizhengPlanetName): string {
    if (this.useQizheng()) return 'HamburgSymbols, sans-serif'
    return this.config.planetFontFamily(planet as PlanetName)
  }

  planetTitle(planet: PlanetName | QizhengPlanetName): string {
    if (this.useQizheng()) return QIZHENG_TITLES[planet as QizhengPlanetName]
    return PLANET_TITLES[planet as PlanetName] ?? (planet as PlanetName)
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
      const planets = this.useQizheng() ? QIZHENG_PLANETS : DICE_PLANETS
      this.result.set({
        planet: planets[Math.floor(Math.random() * planets.length)],
        zodiac: Math.floor(Math.random() * 12) as Zodiac,
        house: Math.floor(Math.random() * 12) + 1,
        time: new Date(),
      })
      // 新掷骰结果视为未保存的新记录
      this.savedId.set(0)
      this.rolling.set(false)
      this.rollTimer = null
    }, 500)
  }

  save() {
    const r = this.result()
    if (this.rolling() || !r || this.saving()) return

    if (!this.authService.isAuth) {
      this.showMessage('请先登录后再保存记录')
      return
    }

    const matter = this.note().trim()
    if (!matter) {
      this.showMessage('请输入事项')
      return
    }
    if (matter.length > 255) {
      this.showMessage('事项长度不能超过255个字符')
      return
    }

    const request: DiceRequest = {
      year: r.time.getFullYear(),
      month: r.time.getMonth() + 1,
      day: r.time.getDate(),
      hour: r.time.getHours(),
      minute: r.time.getMinutes(),
      second: r.time.getSeconds(),
      time_zone_offset: r.time.getTimezoneOffset() / -60,
      planet: r.planet,
      zodiac: r.zodiac,
      house: r.house,
      is_qizheng: this.useQizheng(),
      matter,
      description: '',
      lock: false,
    }

    this.saving.set(true)
    if (this.savedId() === 0) {
      this.api.addDice(request).subscribe({
        next: (data) => {
          this.savedId.set(data.id)
          this.saving.set(false)
          this.showMessage('已新增记录')
        },
        error: (error) => {
          this.saving.set(false)
          this.showMessage('保存失败！' + getApiErrorMessage(error))
        },
      })
    } else {
      const update: UpdateDiceRequest = { ...request }
      this.api.updateDice(this.savedId(), update).subscribe({
        next: () => {
          this.saving.set(false)
          this.showMessage('已更新记录')
        },
        error: (error) => {
          this.saving.set(false)
          this.showMessage('更新失败！' + getApiErrorMessage(error))
        },
      })
    }
  }

  private showMessage(msg: string) {
    this.message.set(msg)
    this.isAlertOpen.set(true)
  }
}
