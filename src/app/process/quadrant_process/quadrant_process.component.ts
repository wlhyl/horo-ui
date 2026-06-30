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
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import {
  DateRequest,
  GeoRequest,
  HoroRequest,
  ProcessRequest,
  QuadrantProcessRequest,
  QuadrantProcessLongitudeRequest,
} from 'src/app/type/interface/request-data';
import {
  QuadrantProcess,
  HoroDateTime,
  Horoscope,
  Promittor,
} from 'src/app/type/interface/response-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  cos,
  degNorm,
  degreeToDMS,
  sin,
  zodiacLong,
} from 'src/app/utils/horo-math/horo-math';
import {
  getAntisciaInfo as getAntisciaInfoUtil,
  getCuspInfo as getCuspInfoUtil,
  getPromittorAspect as getPromittorAspectUtil,
  getPromittorPlanet as getPromittorPlanetUtil,
  getTermInfo as getTermInfoUtil,
  getSignInfo as getSignInfoUtil,
} from 'src/app/utils/promittor/promittor';
import { PlanetName } from 'src/app/type/enum/planet';
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';
import { EW, NS } from 'src/app/horo-common/geo/enum';
import { StaticCanvas } from 'fabric';
import {
  renderElements,
  Drawable,
  calculateHouseElements,
  calculatePlanetElements,
} from 'src/app/utils/image/horo';
import { ptolemyTerm } from 'src/app/utils/image/zodiac';
import { Zodiac } from 'src/app/type/enum/zodiac';
import { CanvasResizeHelper } from 'src/app/utils/image/canvas-resize-helper';
import { Platform } from '@ionic/angular';
import { validateGeo } from 'src/app/utils/geo-validation/geo-validation';
import {
  formatDate as formatDateUtil,
  addYears as addYearsUtil,
  getCurrentDateMinusYears as getCurrentDateMinusYearsUtil,
  checkDateRange as checkDateRangeUtil,
} from 'src/app/utils/direction-utils/direction-utils';

type ViewMode = 'chart' | 'table';

@Component({
  selector: 'app-quadrant-process',
  templateUrl: './quadrant_process.component.html',
  styleUrls: ['./quadrant_process.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HoroCommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuadrantProcessComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() canvasId: string = 'canvas';
  @Input() embedded: boolean = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  title = '象限推运';
  viewMode: ViewMode = 'chart';

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  processData: DeepReadonly<ProcessRequest> = this.storage.processData;

  quadrantData: Array<QuadrantProcess> = [];
  isLoading = false;

  nativeDate: DateRequest = structuredClone(this.horoData.date);
  processDate: DateRequest = structuredClone(this.processData.date);
  startDate: HoroDateTime = getCurrentDateMinusYearsUtil(
    5,
    this.horoData.date.tz,
  );
  endDate: HoroDateTime = addYearsUtil(this.nativeDate, 80);

  geoLongD = 0;
  geoLongM = 0;
  geoLongS = 0;
  geoEW = EW.E;

  geoLatD = 0;
  geoLatM = 0;
  geoLatS = 0;
  geoNS = NS.N;

  showGeoInput = false;

  EW = EW;
  NS = NS;

  horoscoData: Horoscope | null = null;
  processLongitude: number = 0;
  private canvas?: StaticCanvas;
  @ViewChild('canvasRef') private canvasRef?: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private updateNativeDateSubject = new Subject<void>();
  private updateProcessDateSubject = new Subject<void>();
  private resizeHelper = new CanvasResizeHelper(
    () => this.canvas,
    () => this.canvasRef,
    () => this.embedded,
    this.platform,
    this.destroy$,
    () => this.isLoading,
  );

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
      if (!this.inputHoroData || !this.inputProcessData) {
        return;
      }
      this.horoData = this.inputHoroData;
      this.nativeDate = structuredClone(this.horoData.date);
      this.startDate = getCurrentDateMinusYearsUtil(5, this.nativeDate.tz);
      this.endDate = addYearsUtil(this.nativeDate, 80);

      this.processData = this.inputProcessData;
      this.processDate = structuredClone(this.processData.date);
    } else {
      this.titleService.setTitle(this.title);
    }

    this.initialized = true;

    this.setGeoFromHoroData();

    this.updateNativeDateSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyUpdateNativeDate();
      });

    this.updateProcessDateSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyUpdateProcessDate();
      });

    this.fetchQuadrantProcessData();
    this.fetchHoroscopeAndLongitude();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;
    // 首次初始化由 ngOnInit 处理，避免重复 fetch
    if (!this.initialized) return;

    let needRefetch = false;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      this.nativeDate = structuredClone(this.horoData.date);
      this.startDate = getCurrentDateMinusYearsUtil(5, this.nativeDate.tz);
      this.endDate = addYearsUtil(this.nativeDate, 80);
      this.setGeoFromHoroData();
      needRefetch = true;
    }

    if (changes['inputProcessData'] && this.inputProcessData) {
      this.processData = this.inputProcessData;
      this.processDate = structuredClone(this.processData.date);
      needRefetch = true;
    }

    if (needRefetch) {
      this.fetchQuadrantProcessData();
      this.fetchHoroscopeAndLongitude();
    }
  }

  ngAfterViewInit(): void {
    this.canvas = this.createCanvas();
    this.resizeHelper.setupResizeObserver();
    this.drawChart();
  }

  private createCanvas(): StaticCanvas {
    return new StaticCanvas(this.canvasId);
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

  private setGeoFromHoroData(): void {
    const geo = this.horoData.geo;
    const longDms = degreeToDMS(geo.long);
    this.geoLongD = Math.abs(longDms.d);
    this.geoLongM = Math.abs(longDms.m);
    this.geoLongS = Math.abs(longDms.s);
    this.geoEW = geo.long >= 0 ? EW.E : EW.W;

    const latDms = degreeToDMS(geo.lat);
    this.geoLatD = Math.abs(latDms.d);
    this.geoLatM = Math.abs(latDms.m);
    this.geoLatS = Math.abs(latDms.s);
    this.geoNS = geo.lat >= 0 ? NS.N : NS.S;
  }

  get geo(): GeoRequest {
    const long = this.geoLongD + this.geoLongM / 60 + this.geoLongS / 3600;
    const lat = this.geoLatD + this.geoLatM / 60 + this.geoLatS / 3600;
    return {
      long: this.geoEW === EW.E ? long : -long,
      lat: this.geoNS === NS.N ? lat : -lat,
    };
  }

  private validateGeo(): boolean {
    const result = validateGeo({
      longD: this.geoLongD,
      longM: this.geoLongM,
      longS: this.geoLongS,
      latD: this.geoLatD,
      latM: this.geoLatM,
      latS: this.geoLatS,
    });
    if (!result.valid) {
      this.message = result.message;
      this.isAlertOpen = true;
    }
    return result.valid;
  }

  get house(): string {
    return this.horoData.house;
  }

  fetchQuadrantProcessData(): void {
    if (this.isLoading) return;
    if (!this.validateGeo()) return;
    const requestData: QuadrantProcessRequest = {
      date: this.nativeDate,
      geo: this.geo,
      house: this.house,
    };

    this.isLoading = true;
    this.cdr.markForCheck();
    this.api
      .quadrantProcess(requestData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.quadrantData = response;
          this.cdr.markForCheck();
        },
        error: (error) => {
          const msg = error.message + ' ' + error.error.message;
          this.message = msg;
          this.isAlertOpen = true;
          this.cdr.markForCheck();
        },
      });
  }

  fetchHoroscopeAndLongitude(): void {
    if (!this.validateGeo()) return;
    const horoRequest = {
      id: this.horoData.id,
      date: this.nativeDate,
      geo_name: this.horoData.geo_name,
      geo: this.geo,
      house: this.house,
      name: this.horoData.name,
      sex: this.horoData.sex,
    };

    this.api.getNativeHoroscope(horoRequest).subscribe({
      next: (data) => {
        this.horoscoData = data;
        this.fetchLongitude();
        this.cdr.markForCheck();
      },
      error: (error) => {
        const msg = error.message + ' ' + error.error.message;
        this.message = msg;
        this.isAlertOpen = true;
        this.cdr.markForCheck();
      },
    });
  }

  fetchLongitude(): void {
    const requestData: QuadrantProcessLongitudeRequest = {
      native_date: this.nativeDate,
      process_date: this.processDate,
      geo: this.geo,
      house: this.house,
    };

    this.api.quadrantProcessLongitude(requestData).subscribe({
      next: (longitude) => {
        this.processLongitude = longitude;
        this.drawChart();
        this.cdr.markForCheck();
      },
      error: (error) => {
        const msg = error.message + ' ' + error.error.message;
        this.message = msg;
        this.isAlertOpen = true;
        this.cdr.markForCheck();
      },
    });
  }

  private drawChart(): void {
    if (!this.horoscoData || !this.canvas) return;

    const width = this.config.horoscoImage.width;
    const height = this.config.horoscoImage.height;

    const cx = width / 2;
    const cy = height / 2;
    const r2 = width / 2;
    const r0 = r2 - 30;
    const r1 = r0 - 50;

    const firstCuspLong = this.horoscoData.cusps[0];

    const houseElements = calculateHouseElements(
      this.horoscoData.cusps,
      this.config,
      {
        cx,
        cy,
        r0,
        r1,
      },
    );
    const planetElements = calculatePlanetElements(
      [
        ...this.horoscoData.planets,
        this.horoscoData.asc,
        this.horoscoData.mc,
        this.horoscoData.dsc,
        this.horoscoData.ic,
        this.horoscoData.part_of_fortune,
      ],
      firstCuspLong,
      this.config,
      { cx, cy, r: r1 },
    );

    const additionalElements: Drawable[] = [];

    additionalElements.push({
      type: 'circle',
      left: cx,
      top: cx,
      radius: r2,
      fill: '',
      stroke: 'black',
    });

    for (let i = 0; i < 12; i++) {
      const zodiac = i as Zodiac;
      const terms = ptolemyTerm(zodiac);

      let termStartLong = i * 30;
      for (const term of terms) {
        const termEndLong =
          term.d != 30 ? i * 30 + term.d + 1 : i * 30 + term.d;
        const angle = termEndLong + 180 - firstCuspLong;

        const innerRadius = r0;
        const outerRadius = r2;

        const x1 = cx + innerRadius * cos(angle);
        const y1 = cy - innerRadius * sin(angle);
        const x2 = cx + outerRadius * cos(angle);
        const y2 = cy - outerRadius * sin(angle);

        additionalElements.push({
          type: 'path',
          path: `M ${x1} ${y1} L ${x2} ${y2}`,
          stroke: '#888',
          strokeDashArray: [2, 2],
        });

        // 画界行星
        const termCenter =
          termStartLong + degNorm(termEndLong - termStartLong) / 2;
        const termCenterAngle = termCenter + 180 - firstCuspLong;
        const x = cx + (r0 + (r2 - r0) / 2) * cos(termCenterAngle);
        const y = cy - (r0 + (r2 - r0) / 2) * sin(termCenterAngle);

        additionalElements.push({
          type: 'text',
          text: this.config.planetFontString(term.p),
          left: x,
          top: y,
          textAlign: 'center',
          fontSize: 20,
          fontFamily: this.config.planetFontFamily(term.p),
        });

        termStartLong = termEndLong;
      }
    }

    if (this.processLongitude !== 0) {
      const markerAngle = this.processLongitude + 180 - firstCuspLong;

      const x0 = cx + r0 * cos(markerAngle);
      const y0 = cy - r0 * sin(markerAngle);

      const x1 = cx + r2 * cos(markerAngle);
      const y1 = cy - r2 * sin(markerAngle);

      additionalElements.push({
        type: 'path',
        path: `M ${x0} ${y0} L ${x1} ${y1}`,
        stroke: 'red',
        strokeWidth: 5,
      });

      const { zodiac, long } = zodiacLong(this.processLongitude);
      const dms = degreeToDMS(long);
      const labelText = `${dms.d}°${dms.m}'${dms.s}"`;

      const fontSize = 20;
      additionalElements.push({
        type: 'text',
        text: '推进到：',
        left: 0,
        top: fontSize,
        textAlign: 'left',
        fontSize: fontSize,
        fontFamily: this.config.textFont,
      });
      additionalElements.push({
        type: 'text',
        text: this.config.zodiacFontString(zodiac),
        left: 4 * fontSize,
        top: fontSize,
        textAlign: 'left',
        fontSize: fontSize,
        fontFamily: this.config.zodiacFontFamily(),
      });
      additionalElements.push({
        type: 'text',
        text: labelText,
        left: 5 * fontSize,
        top: fontSize,
        textAlign: 'left',
        fontSize: fontSize,
        fontFamily: this.config.textFont,
      });
    }

    this.canvas.clear();
    renderElements(
      this.canvas,
      [...houseElements, ...planetElements, ...additionalElements], // ...noteElements],
      { width, height },
    );

    // 记录绘制后的原始 canvas 尺寸，用于 resize 时基于原始尺寸重新缩放
    this.resizeHelper.onDraw();
  }

  updateNativeDate(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.markForCheck();
    this.updateNativeDateSubject.next();
  }

  private applyUpdateNativeDate(): void {
    this.isLoading = false;
    this.cdr.markForCheck();
    this.fetchQuadrantProcessData();
    this.fetchHoroscopeAndLongitude();
  }

  updateProcessDate(): void {
    this.updateProcessDateSubject.next();
  }

  private applyUpdateProcessDate(): void {
    this.fetchLongitude();
  }

  addYears = addYearsUtil;

  getCurrentDateMinusYears = getCurrentDateMinusYearsUtil;

  formatDate = formatDateUtil;

  getTermInfo(promittor: Promittor): { zodiac: string; dms: string } | null {
    return getTermInfoUtil(promittor, this.config);
  }

  getPromittorPlanet(promittor: Promittor): PlanetName | null {
    return getPromittorPlanetUtil(promittor);
  }

  getPromittorAspect(
    promittor: Promittor,
  ): { aspect: number; isLeft: boolean } | null {
    return getPromittorAspectUtil(promittor);
  }

  getAntisciaInfo(promittor: Promittor): string | null {
    return getAntisciaInfoUtil(promittor);
  }

  getCusp(promittor: Promittor): number | null {
    return getCuspInfoUtil(promittor);
  }

  getSign(promittor: Promittor): number | null {
    return getSignInfoUtil(promittor);
  }

  get filteredQuadrantData(): QuadrantProcess[] {
    return this.quadrantData.filter((item) => {
      return checkDateRangeUtil(item.date, this.startDate, this.endDate);
    });
  }

  resetFilters(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    this.startDate = structuredClone(this.nativeDate);
    this.endDate = addYearsUtil(this.nativeDate, 80);
    this.setGeoFromHoroData();

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    }, 100);
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'chart' ? 'table' : 'chart';
    if (this.viewMode === 'chart') {
      setTimeout(() => {
        this.canvas = this.createCanvas();
        this.drawChart();
      });
    }
  }
}
