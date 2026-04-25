import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  DateRequest,
  DirectionRequest,
  GeoRequest,
} from 'src/app/type/interface/request-data';
import {
  Direction,
  HoroDateTime,
  Promittor,
} from 'src/app/type/interface/response-data';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import {
  getAntisciaInfo as getAntisciaInfoUtil,
  getPromittorAspect as getPromittorAspectUtil,
  getPromittorPlanet as getPromittorPlanetUtil,
  getTermInfo as getTermInfoUtil,
} from 'src/app/utils/promittor/promittor';
import { PlanetName } from 'src/app/type/enum/planet';
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';
import { EW, NS } from 'src/app/horo-common/geo/enum';
import { validateGeo } from 'src/app/utils/geo-validation/geo-validation';

@Component({
  selector: 'app-direction',
  templateUrl: './direction.component.html',
  styleUrls: ['./direction.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectionComponent implements OnInit, OnDestroy {
  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  title = '主向推运';

  horoData = this.storage.horoData;

  directionData: Array<Direction> = [];
  isLoading = false;

  nativeDate!: DateRequest;
  startDate!: HoroDateTime;
  endDate!: HoroDateTime;
  selectedSignificators: PlanetName[] = [];
  allSignificators: PlanetName[] = [
    PlanetName.ASC,
    PlanetName.MC,
    PlanetName.DSC,
    PlanetName.IC,
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

  private destroy$ = new Subject<void>();
  private updateNativeDateSubject = new Subject<void>();
  private resetFiltersSubject = new Subject<void>();

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);

    this.nativeDate = structuredClone(this.horoData.date);
    this.startDate = structuredClone(this.horoData.date);
    this.endDate = this.addYears(this.horoData.date, 120);

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
          const message = error.message + ' ' + error.error.message;
          this.message = message;
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

  addYears(date: HoroDateTime | DateRequest, years: number): HoroDateTime {
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

  formatArc(arc: number): string {
    const dms = degreeToDMS(arc);
    const sign = arc >= 0 ? '' : '-';
    return `${sign}${Math.abs(dms.d)}°${Math.abs(dms.m).toString().padStart(2, '0')}'${Math.abs(dms.s).toString().padStart(2, '0')}"`;
  }

  get filteredDirectionData(): Direction[] {
    return this.directionData.filter((item) => {
      const dateMatch = this.checkDateRange(item.date);
      const significatorMatch = this.checkSignificator(item.significator);
      return dateMatch && significatorMatch;
    });
  }

  checkDateRange(date: HoroDateTime): boolean {
    const dateTime = this.dateToNumber(date);
    if (dateTime < this.dateToNumber(this.startDate)) return false;
    if (dateTime > this.dateToNumber(this.endDate)) return false;
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

  checkSignificator(significator: PlanetName): boolean {
    if (this.selectedSignificators.length === 0) return true;
    return this.selectedSignificators.includes(significator);
  }

  resetFilters(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    this.startDate = structuredClone(this.nativeDate);
    this.endDate = this.addYears(this.nativeDate, 120);
    this.selectedSignificators = [];
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
    if (sig === PlanetName.MC) return 'MC';
    if (sig === PlanetName.ASC) return 'ASC';
    if (sig === PlanetName.DSC) return 'DSC';
    if (sig === PlanetName.IC) return 'IC';
    if (sig === PlanetName.Sun) return '☉';
    if (sig === PlanetName.Moon) return '☽';
    if (sig === PlanetName.Mercury) return '☿';
    if (sig === PlanetName.Venus) return '♀';
    if (sig === PlanetName.Mars) return '♂';
    if (sig === PlanetName.Jupiter) return '♃';
    if (sig === PlanetName.Saturn) return '♄';
    if (sig === PlanetName.NorthNode) return '☊';
    if (sig === PlanetName.SouthNode) return '☋';
    if (sig === PlanetName.PartOfFortune) return '⊗';
    return this.config.planetFontString(sig);
  }
}
