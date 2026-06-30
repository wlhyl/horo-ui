import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IonicModule, Platform } from '@ionic/angular';
import { finalize, Subject, takeUntil } from 'rxjs';
import { StaticCanvas } from 'fabric';

import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { Horoscope } from 'src/app/type/interface/response-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { PlanetName } from 'src/app/type/enum/planet';
import { Zodiac } from 'src/app/type/enum/zodiac';
import { getApiErrorMessage } from 'src/app/utils/api-error/api-error';
import {
  renderElements,
  Drawable,
  calculateHouseElements,
  calculatePlanetElements,
  calculateNotesElements,
} from 'src/app/utils/image/horo';
import {
  calculatePromittors,
  calculatePromittorElements,
  calculatePtolemyBounds,
  PromittorPoint,
  Selection,
  getTermRange,
  isInTermRange,
} from 'src/app/utils/image/promittor';
import { ptolemyTerm } from 'src/app/utils/image/zodiac';
import { CanvasResizeHelper } from 'src/app/utils/image/canvas-resize-helper';

@Component({
  selector: 'app-promittor',
  templateUrl: './promittor.component.html',
  styleUrls: ['./promittor.component.scss'],
  standalone: true,
  imports: [IonicModule, HoroCommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromittorComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input({ required: true }) inputHoroData!: HoroRequest;
  @Input() canvasId: string = 'canvas';
  @Input() embedded: boolean = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  initialized = false;
  loading = false;

  title = '承诺星盘';

  private horoData!: DeepReadonly<HoroRequest>;

  horoscoData: Horoscope | null = null;
  promittors: PromittorPoint[] = [];
  selection: Selection = { kind: 'none' };
  selectedZodiac: Zodiac | null = null;

  readonly zodiacOptions: Zodiac[] = Object.values(Zodiac).filter(
    (v): v is Zodiac => typeof v === 'number',
  );

  private canvas?: StaticCanvas;
  @ViewChild('canvasRef') private canvasRef?: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private resizeHelper = new CanvasResizeHelper(
    () => this.canvas,
    () => this.canvasRef,
    () => this.embedded,
    this.platform,
    this.destroy$,
    () => this.loading,
  );

  private static readonly ALL_PLANETS: PlanetName[] = [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mercury,
    PlanetName.Venus,
    PlanetName.Mars,
    PlanetName.Jupiter,
    PlanetName.Saturn,
    PlanetName.NorthNode,
    PlanetName.SouthNode,
    PlanetName.PartOfFortune,
  ];

  get selectablePlanets(): PlanetName[] {
    if (this.selectedZodiac === null) {
      return PromittorComponent.ALL_PLANETS;
    }
    return ptolemyTerm(this.selectedZodiac).map((t) => t.p);
  }

  constructor(
    private platform: Platform,
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.embedded) {
      this.horoData = this.inputHoroData;
    } else {
      this.horoData = this.storage.horoData;
      this.titleService.setTitle(this.title);
    }

    this.initialized = true;
    this.fetchHoroscope();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;
    // 首次初始化由 ngOnInit 处理，避免重复 fetch
    if (!this.initialized) return;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      this.fetchHoroscope();
    }
  }

  ngAfterViewInit(): void {
    this.canvas = new StaticCanvas(this.canvasId);
    this.resizeHelper.setupResizeObserver();
    this.drawChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeHelper.destroy();
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }

  private fetchHoroscope() {
    this.loading = true;
    this.cdr.markForCheck();
    this.api
      .getNativeHoroscope(this.horoData)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.horoscoData = data;
          this.promittors = calculatePromittors(
            data.planets,
            data.part_of_fortune,
          );
          this.drawChart();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.message = getApiErrorMessage(error);
          this.isAlertOpen = true;
          this.cdr.markForCheck();
        },
      });
  }

  private drawChart() {
    if (!this.horoscoData || !this.canvas) return;

    const width = this.config.promittorImage.width;
    const height = this.config.promittorImage.height;
    const cx = width / 2;
    const cy = height / 2;
    const rBase = 320;
    const r1 = 270;
    const rPtolemyOut = 350;
    const rPtolemyIn = 320;
    const rPromittor = 365;
    const rOuter = 380;

    const firstCuspLong = this.horoscoData.cusps[0];

    const houseElements = calculateHouseElements(
      this.horoscoData.cusps,
      this.config,
      { cx, cy, r0: rBase, r1 },
    );

    // 本命行星过滤：
    // - none: 显示全部
    // - planet/term: 隐藏全部（由承诺星合相替代，避免重复叠加与避让冲突）
    const allPlanets = [
      ...this.horoscoData.planets,
      this.horoscoData.asc,
      this.horoscoData.mc,
      this.horoscoData.dsc,
      this.horoscoData.ic,
      this.horoscoData.part_of_fortune,
    ];
    const planetElements =
      this.selection.kind === 'none'
        ? calculatePlanetElements(
            allPlanets,
            firstCuspLong,
            this.config,
            { cx, cy, r: r1 },
          )
        : [];

    const noteElements = calculateNotesElements(this.horoscoData, this.config);
    const ptolemyElements = calculatePtolemyBounds(this.config, {
      cx,
      cy,
      rInner: rPtolemyIn,
      rOuter: rPtolemyOut,
      firstCuspLong,
      selectedTerm:
        this.selection.kind === 'term'
          ? { zodiac: this.selection.zodiac, termIndex: this.selection.termIndex }
          : null,
    });
    // 选中行星/界时承诺星显示在内圈(r1)，否则显示在外圈色点(rPromittor)
    const promittorElements = calculatePromittorElements(
      this.promittors,
      this.config,
      {
        cx,
        cy,
        r: this.selection.kind === 'none' ? rPromittor : r1,
        firstCuspLong,
        selection: this.selection,
      },
    );

    const outerCircle: Drawable[] = [
      {
        type: 'circle',
        left: cx,
        top: cy,
        radius: rOuter,
        fill: '',
        stroke: 'black',
      },
    ];

    this.canvas.clear();
    renderElements(
      this.canvas,
      [
        ...houseElements,
        ...planetElements,
        ...noteElements,
        ...ptolemyElements,
        ...promittorElements,
        ...outerCircle,
      ],
      { width, height },
    );

    this.resizeHelper.onDraw();
  }

  onSelectZodiac(zodiac: Zodiac | null) {
    // 提取当前选中的行星（行星模式或界模式）
    let currentPlanet: PlanetName | null = null;
    if (this.selection.kind === 'planet') {
      currentPlanet = this.selection.planet;
    } else if (this.selection.kind === 'term') {
      currentPlanet = ptolemyTerm(this.selection.zodiac)[
        this.selection.termIndex
      ].p;
    }

    this.selectedZodiac = zodiac;

    // 在新上下文中保留选中行星
    if (currentPlanet !== null && zodiac !== null) {
      const termIndex = ptolemyTerm(zodiac).findIndex(
        (t) => t.p === currentPlanet,
      );
      this.selection =
        termIndex !== -1
          ? { kind: 'term', zodiac, termIndex }
          : { kind: 'none' };
    } else if (currentPlanet !== null && zodiac === null) {
      this.selection = { kind: 'planet', planet: currentPlanet };
    } else {
      this.selection = { kind: 'none' };
    }

    this.drawChart();
    this.cdr.markForCheck();
  }

  isPlanetBtnActive(planet: PlanetName): boolean {
    if (this.selection.kind === 'planet') {
      return this.selection.planet === planet;
    }
    if (this.selection.kind === 'term') {
      const term = ptolemyTerm(this.selection.zodiac)[
        this.selection.termIndex
      ];
      return term.p === planet;
    }
    return false;
  }

  onSelectPlanet(planet: PlanetName | null) {
    if (planet === null) {
      this.selection = { kind: 'none' };
    } else if (this.selectedZodiac !== null) {
      // 星座已选：进入界模式
      const termIndex = ptolemyTerm(this.selectedZodiac).findIndex(
        (t) => t.p === planet,
      );
      if (
        this.selection.kind === 'term' &&
        this.selection.zodiac === this.selectedZodiac &&
        this.selection.termIndex === termIndex
      ) {
        this.selection = { kind: 'none' };
      } else {
        this.selection = {
          kind: 'term',
          zodiac: this.selectedZodiac,
          termIndex,
        };
      }
    } else {
      // 星座未选：原行星模式
      if (
        this.selection.kind === 'planet' &&
        this.selection.planet === planet
      ) {
        this.selection = { kind: 'none' };
      } else {
        this.selection = { kind: 'planet', planet };
      }
    }
    this.drawChart();
    this.cdr.markForCheck();
  }
}
