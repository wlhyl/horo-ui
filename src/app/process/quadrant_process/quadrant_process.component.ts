import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
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
import { zoomImage } from 'src/app/utils/image/zoom-image';
import { Platform } from '@ionic/angular';
import { validateGeo } from 'src/app/utils/geo-validation/geo-validation';

type ViewMode = 'chart' | 'table';

@Component({
  selector: 'app-quadrant-process',
  templateUrl: './quadrant_process.component.html',
  styleUrls: ['./quadrant_process.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuadrantProcessComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  title = '象限推运';
  viewMode: ViewMode = 'chart';

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  processData: DeepReadonly<ProcessRequest> = this.storage.processData;

  quadrantData: Array<QuadrantProcess> = [];
  isLoading = false;

  nativeDate: DateRequest = structuredClone(this.horoData.date);
  processDate: DateRequest = structuredClone(this.processData.date);
  startDate: HoroDateTime = structuredClone(this.horoData.date);
  endDate: HoroDateTime = this.addYears(this.nativeDate, 80);

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

  private destroy$ = new Subject<void>();
  private updateNativeDateSubject = new Subject<void>();
  private updateProcessDateSubject = new Subject<void>();

  constructor(
    private platform: Platform,
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);

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

  ngAfterViewInit(): void {
    this.canvas = this.createCanvas();
    this.drawChart();
  }

  private createCanvas(): StaticCanvas {
    return new StaticCanvas('canvas');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

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

    zoomImage(this.canvas, this.platform);

    // this.canvas.setDimensions({ width: width + 300, height: height + 300 });
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

  addYears(date: HoroDateTime, years: number): HoroDateTime {
    return {
      year: date.year + years,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
      second: date.second,
      tz: date.tz,
    };
  }

  formatDate(date: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }): string {
    return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')} ${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}`;
  }

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

  get filteredQuadrantData(): QuadrantProcess[] {
    return this.quadrantData.filter((item) => {
      return this.checkDateRange(item.date);
    });
  }

  checkDateRange(date: HoroDateTime): boolean {
    const dateTime = this.dateToNumber(date);
    const tolerance = 1000; // 1秒容差，处理浮点精度问题
    if (dateTime < this.dateToNumber(this.startDate) - tolerance) return false;
    if (dateTime > this.dateToNumber(this.endDate) + tolerance) return false;
    return true;
  }

  dateToNumber(date: HoroDateTime): number {
    return new Date(
      date.year,
      date.month - 1,
      date.day,
      date.hour,
      date.minute,
      date.second,
    ).getTime();
  }

  resetFilters(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    this.startDate = structuredClone(this.nativeDate);
    this.endDate = this.addYears(this.nativeDate, 80);
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
