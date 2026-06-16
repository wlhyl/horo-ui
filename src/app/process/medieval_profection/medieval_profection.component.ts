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
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { getApiErrorMessage } from 'src/app/utils/api-error/api-error';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  DateRequest,
  GeoRequest,
  HoroRequest,
  MedievalProfectionRequest,
  ProcessRequest,
  ReturnRequest,
} from 'src/app/type/interface/request-data';
import {
  Direction,
  HoroscopeComparison,
  HoroscopeProfection,
  MedievalProfection,
  Promittor,
  PromittorType,
  Significator,
} from 'src/app/type/interface/response-data';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import {
  getAntisciaInfo as getAntisciaInfoUtil,
  getCuspInfo as getCuspInfoUtil,
  getPromittorAspect as getPromittorAspectUtil,
  getPromittorPlanet as getPromittorPlanetUtil,
  getTermInfo as getTermInfoUtil,
  getSignInfo as getSignInfoUtil,
} from 'src/app/utils/promittor/promittor';
import { PlanetName } from 'src/app/type/enum/planet';
import { ProfectionArcToDateMethod } from 'src/app/process/enum/profection-arc-to-date-method';
import { ProfectionMode } from 'src/app/process/enum/profection-mode';
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';
import { EW, NS } from 'src/app/horo-common/geo/enum';
import { validateGeo } from 'src/app/utils/geo-validation/geo-validation';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { StaticCanvas } from 'fabric';
import { drawHorosco } from 'src/app/utils/image/compare';
import { zoomImage } from 'src/app/utils/image/zoom-image';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import {
  ALL_SIGNIFICATORS,
  ALL_CUSP_SIGNIFICATORS,
  formatDate as formatDateUtil,
  formatArc as formatArcUtil,
  getSignificatorDisplayText as getSignificatorDisplayTextUtil,
  getSignificatorPlanet as getSignificatorPlanetUtil,
  getSignificatorCusp as getSignificatorCuspUtil,
  checkSignificator as checkSignificatorUtil,
  checkPromittorType as checkPromittorTypeUtil,
  checkPromittorPlanet as checkPromittorPlanetUtil,
} from 'src/app/utils/direction-utils/direction-utils';

type ViewMode = 'chart' | 'table';

@Component({
  selector: 'app-medieval-profection',
  templateUrl: './medieval_profection.component.html',
  styleUrls: ['./medieval_profection.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedievalProfectionComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() inputMode?: ProfectionMode;
  @Input() canvasId: string = 'canvas';
  @Input() embedded: boolean = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  mode: ProfectionMode = ProfectionMode.Medieval;
  title = '中世纪小限';
  viewMode: ViewMode = 'chart';

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  processData: DeepReadonly<ProcessRequest> = this.storage.processData;

  medievalProfectionData: MedievalProfection | null = null;
  isLoading = false;

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  nativeDate: DateRequest = structuredClone(this.horoData.date);
  processDate: DateRequest = structuredClone(this.processData.date);

  selectedSignificatorPlanets: PlanetName[] = [
    PlanetName.ASC,
    PlanetName.MC,
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.PartOfFortune,
  ];
  selectedSignificatorCusps: number[] = [];
  promittorTypeFilter: PromittorType[] = [];
  selectedPromittorPlanets: PlanetName[] = [];

  allSignificatorPlanets: PlanetName[] = ALL_SIGNIFICATORS;
  allCuspSignificators: number[] = ALL_CUSP_SIGNIFICATORS;

  promittorTypeOptions: { value: PromittorType; text: string }[] =
    PromittorType.values().map((type) => ({
      value: type,
      text: PromittorType.name(type),
    }));

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

  profectionMode = ProfectionMode;

  house: string = this.horoData.house;

  // 弧转日期换算方式枚举，供模板使用
  ProfectionArcToDateMethod = ProfectionArcToDateMethod;

  // 弧转日期换算方式选项
  arcToDateMethodOptions = Object.values(ProfectionArcToDateMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: ProfectionArcToDateMethod.name(method),
      value: method,
    }));

  // 弧转日期换算方式选择
  arcToDateMethod: ProfectionArcToDateMethod =
    this.processData.profection_arc_to_date_method;

  private canvas?: StaticCanvas;

  private destroy$ = new Subject<void>();
  private updateNativeDateSubject = new Subject<void>();
  private updateProcessDateSubject = new Subject<void>();
  private resetFiltersSubject = new Subject<void>();

  constructor(
    private platform: Platform,
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (this.embedded) {
      if (
        !this.inputHoroData ||
        !this.inputProcessData ||
        !this.inputMode
      ) {
        return;
      }
      this.horoData = this.inputHoroData;
      this.nativeDate = structuredClone(this.horoData.date);
      this.house = this.horoData.house;
      this.processData = this.inputProcessData;
      this.processDate = structuredClone(this.processData.date);
      this.arcToDateMethod =
        this.inputProcessData.profection_arc_to_date_method;
      this.mode = this.inputMode;
      this.title =
        this.mode === ProfectionMode.CustomDay ? '自定义日小限' : '中世纪小限';
    } else {
      this.mode = this.route.snapshot.data?.['mode'] || ProfectionMode.Medieval;
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

    this.resetFiltersSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyResetFilters();
      });

    this.fetchMedievalProfectionData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;

    let needRefetch = false;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      this.nativeDate = structuredClone(this.horoData.date);
      this.house = this.horoData.house;
      this.setGeoFromHoroData();
      needRefetch = true;
    }

    if (changes['inputProcessData'] && this.inputProcessData) {
      this.processData = this.inputProcessData;
      this.processDate = structuredClone(this.processData.date);
      this.arcToDateMethod =
        this.inputProcessData.profection_arc_to_date_method;
      needRefetch = true;
    }

    if (changes['inputMode'] && this.inputMode !== undefined) {
      this.mode = this.inputMode;
      this.title =
        this.mode === ProfectionMode.CustomDay ? '自定义日小限' : '中世纪小限';
      needRefetch = true;
    }

    if (needRefetch) {
      this.fetchMedievalProfectionData();
    }
  }

  ngAfterViewInit(): void {
    this.canvas = this.createCanvas();
    this.drawChart();
  }

  private createCanvas(): StaticCanvas {
    return new StaticCanvas(this.canvasId);
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

  fetchMedievalProfectionData(): void {
    if (this.isLoading) return;
    if (!this.validateGeo()) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    if (this.mode === ProfectionMode.CustomDay) {
      const requestData: ReturnRequest = {
        native_date: this.nativeDate,
        process_date: this.processDate,
        geo: this.geo,
        house: this.house,
      };
      this.api
        .customDayProfection(requestData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: (response) => {
            this.medievalProfectionData = response;
            this.drawChart();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.message = getApiErrorMessage(error);
            this.isAlertOpen = true;
            this.cdr.markForCheck();
          },
        });
    } else {
      const requestData: MedievalProfectionRequest = {
        native_date: this.nativeDate,
        process_date: this.processDate,
        geo: this.geo,
        house: this.house,
        arc_to_date_method: this.arcToDateMethod,
      };
      this.api
        .medievalProfection(requestData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: (response) => {
            this.medievalProfectionData = response;
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
  }

  private toHoroscopeComparison(
    horoscope: HoroscopeProfection,
  ): HoroscopeComparison {
    return {
      original_date: horoscope.native_date,
      comparison_date: horoscope.profection_date,
      original_geo: horoscope.geo,
      comparison_geo: horoscope.geo,
      house_name: horoscope.house_name,
      houses_cusps: horoscope.cusps,
      comparison_cusps: horoscope.cusps,
      original_asc: horoscope.asc,
      comparison_asc: horoscope.profection_asc,
      original_mc: horoscope.mc,
      comparison_mc: horoscope.profection_mc,
      original_dsc: horoscope.dsc,
      comparison_dsc: horoscope.profection_dsc,
      original_ic: horoscope.ic,
      comparison_ic: horoscope.profection_ic,
      original_part_of_fortune: horoscope.part_of_fortune,
      comparison_part_of_fortune: horoscope.profection_part_of_fortune,
      original_planets: horoscope.planets,
      comparison_planets: horoscope.profection_planets,
      aspects: horoscope.aspects,
      antiscoins: horoscope.antiscoins,
      contraantiscias: horoscope.contraantiscias,
    };
  }

  private drawChart(): void {
    if (!this.medievalProfectionData || !this.canvas) return;

    const comparisonData = this.toHoroscopeComparison(
      this.medievalProfectionData.horoscope,
    );

    drawHorosco(comparisonData, this.canvas, this.config, {
      width: this.config.horoscoImage.width,
      height: this.config.horoscoImage.height,
    });

    zoomImage(this.canvas, this.platform);
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
    this.fetchMedievalProfectionData();
  }

  updateProcessDate(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.markForCheck();
    this.updateProcessDateSubject.next();
  }

  private applyUpdateProcessDate(): void {
    this.isLoading = false;
    this.cdr.markForCheck();
    this.fetchMedievalProfectionData();
  }

  formatDate = formatDateUtil;

  formatArc = formatArcUtil;

  getPromittorPlanet(promittor: Promittor): PlanetName | null {
    return getPromittorPlanetUtil(promittor);
  }

  getPromittorAspect(
    promittor: Promittor,
  ): { aspect: number; isLeft: boolean } | null {
    return getPromittorAspectUtil(promittor);
  }

  getTermInfo(promittor: Promittor): { zodiac: string; dms: string } | null {
    return getTermInfoUtil(promittor, this.config);
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

  get filteredDirectionData(): Direction[] {
    if (!this.medievalProfectionData) return [];
    return this.medievalProfectionData.directions.filter((item) => {
      const significatorMatch = checkSignificatorUtil(
        item.significator,
        this.selectedSignificatorPlanets,
        this.selectedSignificatorCusps,
      );
      const promittorMatch = checkPromittorTypeUtil(
        item.promittor,
        this.promittorTypeFilter,
      );
      const promittorPlanetMatch = checkPromittorPlanetUtil(
        item.promittor,
        this.selectedPromittorPlanets,
      );
      return significatorMatch && promittorMatch && promittorPlanetMatch;
    });
  }

  resetFilters(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    this.selectedSignificatorPlanets = [];
    this.selectedSignificatorCusps = [];
    this.promittorTypeFilter = [];
    this.selectedPromittorPlanets = [];
    this.setGeoFromHoroData();
    this.resetFiltersSubject.next();
  }

  private applyResetFilters(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    }, 100);
  }

  getSignificatorDisplayText(sig: PlanetName): string {
    return getSignificatorDisplayTextUtil(sig, this.config);
  }

  getSignificatorPlanet(sig: Significator): PlanetName | null {
    return getSignificatorPlanetUtil(sig);
  }

  getSignificatorCusp(sig: Significator): number | null {
    return getSignificatorCuspUtil(sig);
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
