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
  DirectionRequest,
  GeoRequest,
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import { DirectionMethod } from 'src/app/process/enum/direction-method';
import { ArcToDateMethod } from 'src/app/process/enum/arc-to-date-method';
import {
  Direction,
  HoroDateTime,
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
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';
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
  @Input() embedded: boolean = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

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
  arcDirectionFilter: 'all' | 'direct' | 'converse' = 'all';
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

  // 相位类型过滤选项
  promittorTypeOptions: { value: PromittorType; text: string }[] =
    PromittorType.values().map((type) => ({
      value: type,
      text: PromittorType.name(type),
    }));

  // 主限法算法选择
  directionMethod: DirectionMethod;
  // 弧转日期换算方式选择
  arcToDateMethod: ArcToDateMethod;
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
  ) {
    this.directionMethod = this.storage.processData.direction_method;
    this.arcToDateMethod = this.storage.processData.arc_to_date_method;
  }

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
      }
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

    this.resetFiltersSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyResetFilters();
      });

    this.fetchDirectionData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;

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

  fetchDirectionData(): void {
    if (this.isLoading) return;
    if (!this.validateGeo()) return;
    const requestData: DirectionRequest = {
      native_date: this.nativeDate,
      geo: this.geo,
      method: this.directionMethod,
      arc_to_date_method: this.arcToDateMethod,
      house: this.house,
    };

    this.isLoading = true;
    this.cdr.markForCheck();
    this.api
      .direction(requestData)
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
    this.arcDirectionFilter = 'all';
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
