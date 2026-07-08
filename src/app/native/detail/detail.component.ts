import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import {
  degNorm,
  degreeToDMS,
  zodiacLong,
} from 'src/app/utils/horo-math/horo-math';
import { PlanetName } from 'src/app/type/enum/planet';
import { Zodiac } from 'src/app/type/enum/zodiac';
import {
  calculateAllPlanetDignities,
  findChartAlmuten,
  PlanetDignity,
} from 'src/app/utils/planet-power/planet-power';
import {
  calculateTemperamentContributors,
  calculateTemperamentSummary,
  createContributor,
  GATHERABLE_PLANETS,
  getContributorQualities,
  ContributorKind,
  Quality,
  TemperamentContributor,
  TemperamentSummary,
} from 'src/app/utils/temperament/temperament';
import { ReceptionComponent } from './reception/reception.component';

@Component({
  selector: 'app-native-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [IonicModule, NgStyle, ReceptionComponent],
})
export class DetailComponent implements OnInit, OnChanges {
  @Input() horoscopeData: Horoscope | null = null;

  degreeToDMSFn = degreeToDMS;
  zodiacLong = zodiacLong;
  planetName = PlanetName;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  planetDignities: PlanetDignity[] = [];

  private initialized = false;

  temperamentContributors: TemperamentContributor[] = [];
  temperamentError = '';
  qualityKeys: Quality[] = [Quality.Hot, Quality.Cold, Quality.Dry, Quality.Wet];

  selectedNewPlanet: PlanetName | null = null;
  selectedNewSign: Zodiac | null = null;
  zodiacValues = Object.values(Zodiac).filter(
    (v) => typeof v === 'number',
  ) as Zodiac[];

  constructor(
    public config: Horoconfig,
  ) {}

  get chartAlmuten(): PlanetDignity | null {
    return findChartAlmuten(this.planetDignities);
  }

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

  contributorLabel(c: TemperamentContributor): string {
    return c.kind === ContributorKind.Planet
      ? this.config.planetFontString(c.name as PlanetName)
      : this.config.zodiacFontString(c.name as Zodiac);
  }

  contributorFontFamily(c: TemperamentContributor): string {
    return c.kind === ContributorKind.Planet
      ? this.config.planetFontFamily(c.name as PlanetName)
      : this.config.zodiacFontFamily();
  }

  ngOnInit(): void {
    this.refreshAll();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['horoscopeData']) {
      this.refreshAll();
    }
  }

  private refreshAll(): void {
    this.refreshDignities();
    this.refreshTemperament();
  }

  private refreshDignities(): void {
    if (!this.horoscopeData) {
      this.planetDignities = [];
      return;
    }
    const result = calculateAllPlanetDignities(this.horoscopeData.planets);
    if (!result.ok) {
      this.message = result.error;
      this.isAlertOpen = true;
      this.planetDignities = [];
      return;
    }
    this.planetDignities = result.value;
  }

  refreshTemperament(): void {
    if (!this.horoscopeData) {
      this.temperamentContributors = [];
      this.temperamentError = '';
      return;
    }
    const result = calculateTemperamentContributors(this.horoscopeData);
    if (!result.ok) {
      this.temperamentError = result.error;
      this.temperamentContributors = [];
      return;
    }
    this.temperamentError = '';
    this.temperamentContributors = result.value.map((c: TemperamentContributor) => ({ ...c }));
  }

  get temperamentSummary(): TemperamentSummary {
    return calculateTemperamentSummary(this.temperamentContributors);
  }

  get humorDisplay(): {
    key: string;
    label: string;
    desc: string;
    score: number;
    percent: number;
  }[] {
    const s = this.temperamentSummary;
    return [
      {
        key: 'sanguine',
        label: '多血质',
        desc: '热情、活泼、乐观、善交际',
        score: s.sanguine,
        percent: s.percentages.sanguine,
      },
      {
        key: 'phlegmatic',
        label: '粘液质',
        desc: '冷静、稳重、迟缓、忍耐',
        score: s.phlegmatic,
        percent: s.percentages.phlegmatic,
      },
      {
        key: 'choleric',
        label: '胆汁质',
        desc: '急躁、果断、精力充沛',
        score: s.choleric,
        percent: s.percentages.choleric,
      },
      {
        key: 'melancholic',
        label: '抑郁质',
        desc: '敏感、深刻、忧郁、细致',
        score: s.melancholic,
        percent: s.percentages.melancholic,
      },
    ];
  }

  onToggleQuality(c: TemperamentContributor, q: Quality): void {
    c[q] = !c[q];
  }

  isQualitySet(c: TemperamentContributor, q: Quality): boolean {
    return c[q];
  }

  get availablePlanets(): PlanetName[] {
    const existing = new Set(
      this.temperamentContributors
        .filter((c) => c.kind === ContributorKind.Planet)
        .map((c) => c.name as PlanetName),
    );
    return GATHERABLE_PLANETS.filter((p) => !existing.has(p));
  }

  get availableSigns(): Zodiac[] {
    const existing = new Set(
      this.temperamentContributors
        .filter((c) => c.kind === ContributorKind.Sign)
        .map((c) => c.name as Zodiac),
    );
    return this.zodiacValues.filter((s) => !existing.has(s));
  }

  addPlanetContributor(): void {
    if (this.selectedNewPlanet === null || !this.horoscopeData) return;
    const name = this.selectedNewPlanet;
    const qResult = getContributorQualities(
      ContributorKind.Planet,
      name,
      this.horoscopeData,
    );
    if (!qResult.ok) { this.temperamentError = qResult.error; return; }
    this.temperamentError = '';
    this.temperamentContributors.push(
      createContributor(ContributorKind.Planet, name, ['手动添加'], qResult.value),
    );
    this.selectedNewPlanet = null;
  }

  addSignContributor(): void {
    if (this.selectedNewSign === null || !this.horoscopeData) return;
    const name = this.selectedNewSign;
    const qResult = getContributorQualities(
      ContributorKind.Sign,
      name,
      this.horoscopeData,
    );
    if (!qResult.ok) { this.temperamentError = qResult.error; return; }
    this.temperamentError = '';
    this.temperamentContributors.push(
      createContributor(ContributorKind.Sign, name, ['手动添加'], qResult.value),
    );
    this.selectedNewSign = null;
  }

  removeContributor(c: TemperamentContributor): void {
    const idx = this.temperamentContributors.findIndex(
      (item) => item.id === c.id,
    );
    if (idx >= 0) {
      this.temperamentContributors.splice(idx, 1);
    }
  }

  resetTemperament(): void {
    this.refreshTemperament();
  }
}
