import {
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
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { getApiErrorMessage } from 'src/app/utils/api-error/api-error';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import {
  DateRequest,
  GeoRequest,
  HoroRequest,
  ProcessRequest,
  ReturnRequest,
  DailyDirectionRequest,
} from 'src/app/type/interface/request-data';
import { DirectionMethod } from 'src/app/process/enum/direction-method';
import { ArcToDateMethod } from 'src/app/process/enum/arc-to-date-method';
import { DirectionMode } from 'src/app/process/enum/direction-mode';
import { DailyDirectionMethod } from 'src/app/process/enum/daily-direction-method';
import { ActivatedRoute } from '@angular/router';
import {
  Direction,
  HoroDateTime,
  Promittor,
  PromittorType,
  ReturnHoroscope,
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
import { debounceTime, finalize, Subject, takeUntil, switchMap, Observable } from 'rxjs';
import { EW, NS } from 'src/app/horo-common/geo/enum';
import { validateGeo } from 'src/app/utils/geo-validation/geo-validation';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  ALL_SIGNIFICATORS,
  formatDate as formatDateUtil,
  formatArc as formatArcUtil,
  addYears as addYearsUtil,
  getCurrentDateMinusYears as getCurrentDateMinusYearsUtil,
  getSignificatorDisplayText as getSignificatorDisplayTextUtil,
  getSignificatorPlanet as getSignificatorPlanetUtil,
  checkSignificator as checkSignificatorUtil,
  checkPromittorType as checkPromittorTypeUtil,
  checkPromittorPlanet as checkPromittorPlanetUtil,
  checkDateRange as checkDateRangeUtil,
} from 'src/app/utils/direction-utils/direction-utils';

@Component({
  selector: 'app-direction',
  templateUrl: './direction.component.html',
  styleUrls: ['./direction.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HoroCommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() inputMode?: DirectionMode;
  @Input() embedded: boolean = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  mode: DirectionMode = DirectionMode.Primary;
  title = '主向推运';

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;

  directionData: Array<Direction> = [];
  isLoading = false;

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  nativeDate: DateRequest = structuredClone(this.horoData.date);
  startDate: HoroDateTime = getCurrentDateMinusYearsUtil(5, this.horoData.date.tz);
  endDate: HoroDateTime = addYearsUtil(this.horoData.date, 120);
  selectedSignificatorPlanets: PlanetName[] = [
    PlanetName.ASC,
    PlanetName.MC,
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.PartOfFortune,
  ];
  selectedSignificatorCusps: number[] = [];
  arcDirectionFilter: 'all' | 'direct' | 'converse' = 'direct';
  promittorTypeFilter: PromittorType[] = [];
  selectedPromittorPlanets: PlanetName[] = [];
  allSignificatorPlanets: PlanetName[] = ALL_SIGNIFICATORS;

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

  // 主限法算法枚举，供模板使用
  DirectionMethod = DirectionMethod;

  // 弧转日期换算方式枚举，供模板使用
  ArcToDateMethod = ArcToDateMethod;

  // 每日方向弧算法枚举，供模板使用
  DailyDirectionMethod = DailyDirectionMethod;

  // 推运模式枚举，供模板使用
  DirectionMode = DirectionMode;

  // 主限法算法选项
  directionMethodOptions = Object.values(DirectionMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: DirectionMethod.name(method),
      value: method,
    }));

  // 弧转日期换算方式选项
  arcToDateMethodOptions = Object.values(ArcToDateMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: ArcToDateMethod.name(method),
      value: method,
    }));

  // 每日方向弧算法选项
  dailyDirectionMethodOptions = Object.values(DailyDirectionMethod)
    .filter((v) => typeof v === 'string')
    .map((method) => ({
      text: DailyDirectionMethod.name(method),
      value: method,
    }));

  // 相位类型过滤选项
  promittorTypeOptions: { value: PromittorType; text: string }[] =
    PromittorType.values().map((type) => ({
      value: type,
      text: PromittorType.name(type),
    }));

  // 主限法算法选择
  directionMethod: DirectionMethod = this.storage.processData.direction_method;
  // 弧转日期换算方式选择
  arcToDateMethod: ArcToDateMethod =
    this.storage.processData.arc_to_date_method;
  // 每日方向弧算法选择
  dailyDirectionMethod: DailyDirectionMethod =
    this.storage.processData.daily_direction_method;
  // 每日回归返回数据（用于显示返照时间）
  returnHoroscopeData: ReturnHoroscope | null = null;
  // 宫位系统选择
  house: string = this.horoData.house;

  private destroy$ = new Subject<void>();
  private updateNativeDateSubject = new Subject<void>();
  private resetFiltersSubject = new Subject<void>();

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (this.embedded) {
      if (!this.inputHoroData) {
        return;
      }
      this.horoData = this.inputHoroData;
      this.nativeDate = structuredClone(this.horoData.date);
      this.startDate = getCurrentDateMinusYearsUtil(5, this.horoData.date.tz);
      this.endDate = addYearsUtil(this.horoData.date, 120);
      this.house = this.horoData.house;
      if (this.inputProcessData) {
        this.directionMethod = this.inputProcessData.direction_method;
        this.arcToDateMethod = this.inputProcessData.arc_to_date_method;
        this.dailyDirectionMethod = this.inputProcessData.daily_direction_method;
      }
      if (this.inputMode) {
        this.mode = this.inputMode;
        this.title = this.titleForMode(this.mode);
      }
    } else {
      this.mode = this.route.snapshot.data?.['mode'] || DirectionMode.Primary;
      this.title = this.titleForMode(this.mode);
      this.titleService.setTitle(this.title);
    }

    this.initialized = true;
    this.setGeoFromHoroData();

    this.updateNativeDateSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyUpdateNativeDate();
      });

    this.resetFiltersSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyResetFilters();
      });

    this.fetchDirectionData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;
    // 首次初始化由 ngOnInit 处理，避免重复 fetch
    if (!this.initialized) return;

    let needRefetch = false;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      this.nativeDate = structuredClone(this.horoData.date);
      this.startDate = getCurrentDateMinusYearsUtil(5, this.horoData.date.tz);
      this.endDate = addYearsUtil(this.horoData.date, 120);
      this.house = this.horoData.house;
      this.setGeoFromHoroData();
      needRefetch = true;
    }

    if (changes['inputProcessData'] && this.inputProcessData) {
      this.directionMethod = this.inputProcessData.direction_method;
      this.arcToDateMethod = this.inputProcessData.arc_to_date_method;
      this.dailyDirectionMethod = this.inputProcessData.daily_direction_method;
      if (this.mode === DirectionMode.DailyDirection) {
        this.setGeoFromHoroData();
      }
      needRefetch = true;
    }

    if (needRefetch) {
      this.fetchDirectionData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setGeoFromHoroData(): void {
    const geo = this.mode === DirectionMode.DailyDirection ? this.processDataGeo : this.horoData.geo;
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

  fetchDirectionData(): void {
    if (this.isLoading) return;
    if (!this.validateGeo()) return;

    let request$: Observable<Array<Direction>>;

    if (this.mode === DirectionMode.DailyDirection) {
      request$ = this.fetchDailyReturnChain().pipe(
        switchMap((returnData) => {
          this.returnHoroscopeData = returnData;
          const dailyDirectionRequest: DailyDirectionRequest = {
            native_date: {
              year: returnData.return_date.year,
              month: returnData.return_date.month,
              day: returnData.return_date.day,
              hour: returnData.return_date.hour,
              minute: returnData.return_date.minute,
              second: returnData.return_date.second,
              tz: returnData.return_date.tz,
              st: false,
            },
            geo: this.geo,
            method: this.dailyDirectionMethod,
            house: this.house,
          };
          return this.api.dailyDirection(dailyDirectionRequest);
        }),
      );
    } else if (this.mode === DirectionMode.SolarArc) {
      request$ = this.api.solarArc({
        native_date: this.nativeDate,
        geo: this.geo,
        house: this.house,
      });
    } else {
      request$ = this.api.direction({
        native_date: this.nativeDate,
        geo: this.geo,
        method: this.directionMethod,
        arc_to_date_method: this.arcToDateMethod,
        house: this.house,
      });
    }

    this.isLoading = true;
    this.cdr.markForCheck();
    request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.directionData = response;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.message = getApiErrorMessage(error);
          this.isAlertOpen = true;
          this.cdr.markForCheck();
        },
      });
  }

  private titleForMode(mode: DirectionMode): string {
    switch (mode) {
      case DirectionMode.SolarArc:
        return '太阳弧';
      case DirectionMode.DailyDirection:
        return '每日回归方向弧';
      default:
        return '主向推运';
    }
  }

  private get isSolarReturn(): boolean {
    return this.inputProcessData?.isSolarReturn ?? this.storage.processData.isSolarReturn;
  }

  private get processDataGeo(): GeoRequest {
    return this.inputProcessData?.geo ?? this.storage.processData.geo;
  }

  private get processDataDate(): DateRequest {
    return this.inputProcessData?.date ?? this.storage.processData.date;
  }

  // 获取每日回归链：isSolarReturn=true 时走"日返→月返→每日回归"
  private fetchDailyReturnChain(): Observable<ReturnHoroscope> {
    if (this.isSolarReturn) {
      return this.getLunarDailyReturnData();
    }

    const requestData: ReturnRequest = {
      native_date: this.horoData.date,
      geo: this.geo,
      house: this.horoData.house,
      process_date: this.processDataDate,
    };

    return this.api.dailyReturn(requestData);
  }

  // 日返→月返→每日回归
  private getLunarDailyReturnData(): Observable<ReturnHoroscope> {
    const solarRequest: ReturnRequest = {
      native_date: this.horoData.date,
      geo: this.geo,
      house: this.horoData.house,
      process_date: this.processDataDate,
    };

    return this.api.solarReturn(solarRequest).pipe(
      switchMap((solarReturnData) => {
        const lunarRequest: ReturnRequest = {
          native_date: {
            year: solarReturnData.return_date.year,
            month: solarReturnData.return_date.month,
            day: solarReturnData.return_date.day,
            hour: solarReturnData.return_date.hour,
            minute: solarReturnData.return_date.minute,
            second: solarReturnData.return_date.second,
            tz: solarReturnData.return_date.tz,
            st: false,
          },
          geo: this.geo,
          house: this.horoData.house,
          process_date: this.processDataDate,
        };
        return this.api.lunarReturn(lunarRequest);
      }),
      switchMap((lunarReturnData) => {
        const dailyRequest: ReturnRequest = {
          native_date: {
            year: lunarReturnData.return_date.year,
            month: lunarReturnData.return_date.month,
            day: lunarReturnData.return_date.day,
            hour: lunarReturnData.return_date.hour,
            minute: lunarReturnData.return_date.minute,
            second: lunarReturnData.return_date.second,
            tz: lunarReturnData.return_date.tz,
            st: false,
          },
          geo: this.geo,
          house: this.horoData.house,
          process_date: this.processDataDate,
        };
        return this.api.dailyReturn(dailyRequest);
      }),
    );
  }

  updateNativeDate(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    // this.startDate = structuredClone(this.nativeDate);
    // this.endDate = this.addYears(this.nativeDate, 120);
    // this.selectedSignificators = [];
    this.updateNativeDateSubject.next();
  }

  private applyUpdateNativeDate(): void {
    this.isLoading = false;
    this.cdr.markForCheck();
    this.fetchDirectionData();
  }

  addYears = addYearsUtil;

  getCurrentDateMinusYears = getCurrentDateMinusYearsUtil;

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

  formatDate = formatDateUtil;

  formatArc = formatArcUtil;

  get filteredDirectionData(): Direction[] {
    return this.directionData.filter((item) => {
      const dateMatch = checkDateRangeUtil(item.date, this.startDate, this.endDate);
      const significatorMatch = checkSignificatorUtil(item.significator, this.selectedSignificatorPlanets, this.selectedSignificatorCusps);
      const arcMatch = this.checkArcDirection(item.arc);
      const promittorMatch = checkPromittorTypeUtil(item.promittor, this.promittorTypeFilter);
      const promittorPlanetMatch = checkPromittorPlanetUtil(item.promittor, this.selectedPromittorPlanets);
      return dateMatch && significatorMatch && arcMatch && promittorMatch && promittorPlanetMatch;
    });
  }

  checkArcDirection(arc: number): boolean {
    if (this.arcDirectionFilter === 'all') return true;
    if (this.arcDirectionFilter === 'direct') return arc >= 0;
    if (this.arcDirectionFilter === 'converse') return arc < 0;
    return true;
  }

  resetFilters(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    this.startDate = structuredClone(this.nativeDate);
    this.endDate = addYearsUtil(this.nativeDate, 120);
    this.selectedSignificatorPlanets = [];
    this.selectedSignificatorCusps = [];
    this.arcDirectionFilter = 'direct';
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
}
