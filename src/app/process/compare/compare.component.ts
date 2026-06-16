import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { ProcessName } from 'src/app/process/enum/process';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  HoroscopeComparison,
  ReturnHoroscope,
} from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { Platform } from '@ionic/angular';
import * as fabric from 'fabric';
import {
  HoroRequest,
  HoroscopeComparisonRequest,
  ProcessRequest,
  ReturnRequest,
} from 'src/app/type/interface/request-data';
import {
  finalize,
  map,
  switchMap,
  Observable,
  Subject,
  debounceTime,
  takeUntil,
} from 'rxjs';
import { drawAspect, drawHorosco } from 'src/app/utils/image/compare';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import { Path as subPath } from '../enum/path';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { zoomImage } from 'src/app/utils/image/zoom-image';

enum ComparisonType {
  SolarComparNative, // 日返照盘比本命盘
  NativeComparSolar, // 本命盘比日返照盘
  LunarComparNative, // 月返照盘比本命盘
  NativeComparLunar, // 本命盘比月返照盘
  DailyComparNative, // 日回盘比本命盘
  NativeComparDaily, // 本命盘比日回盘
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
  standalone: false,
})
export class CompareComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() inputProcessName?: ProcessName;
  @Input() canvasId: string = 'canvas';
  @Input() embedded: boolean = false;

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  private processData: DeepReadonly<ProcessRequest> = this.storage.processData;
  currentProcessData: ProcessRequest = structuredClone(this.processData);

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  horoscopeComparisonData: HoroscopeComparison | null = null;
  returnData: ReturnHoroscope | null = null;

  private _isAspect = false; // 默认绘制星盘

  private canvasCache: { version: string; objects: Object[] } | undefined =
    undefined;

  private canvas?: fabric.StaticCanvas;

  loading = false;

  process_name = ProcessName.Transit;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  isDrawing = false;

  // 添加 Subject 和 destroy$ 用于防抖和取消订阅
  private destroy$ = new Subject<void>();
  private changeStepSubject = new Subject<{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }>();

  get title(): string {
    return ProcessName.name(this.process_name);
  }

  degreeToDMSFn = degreeToDMS;

  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router, // 添加 router
    private titleService: Title,
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
  ) {}

  ngOnInit() {
    if (this.embedded) {
      if (
        !this.inputProcessName ||
        !this.inputHoroData ||
        !this.inputProcessData
      ) {
        return;
      }
      this.process_name = this.inputProcessName;
      this.horoData = this.inputHoroData;
      this.processData = this.inputProcessData;
      this.currentProcessData = structuredClone(this.inputProcessData);
    } else {
      const process_name = this.route.snapshot.data['process_name'];

      if (process_name === null) {
        this.message = '配置错误，路由没有正确配置比较盘类型';
        this.isAlertOpen = true;
        return;
      }

      switch (process_name) {
        case ProcessName.Transit:
        case ProcessName.SolarcomparNative:
        case ProcessName.NativecomparSolar:
        case ProcessName.LunarcomparNative:
        case ProcessName.NativecomparLunar:
        case ProcessName.DailycomparNative:
        case ProcessName.NativecomparDaily:
          this.process_name = process_name;
          break;
        default:
          this.message = `无此种比较盘：${process_name}`;
          this.isAlertOpen = true;
          return;
      }

      this.titleService.setTitle(this.title);
    }

    this.initialized = true;

    // 使用防抖优化频繁的日期变更操作
    this.changeStepSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((step) => {
        this.applyStepChange(step);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.embedded) return;

    let needRedraw = false;

    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      needRedraw = true;
    }

    if (changes['inputProcessData'] && this.inputProcessData) {
      this.processData = this.inputProcessData;
      this.currentProcessData = structuredClone(this.inputProcessData);
      needRedraw = true;
    }

    if (changes['inputProcessName'] && this.inputProcessName) {
      this.process_name = this.inputProcessName;
      needRedraw = true;
    }

    if (needRedraw && this.canvas) {
      this.drawHoroscope(this.process_name);
    }
  }

  ngAfterViewInit(): void {
    // 为兼容单元测试，使用这样的冗余函数
    this.canvas = this.createCanvas();
    // 延迟到下一宏任务，避免 drawHoroscope 同步设置 loading=true
    // 导致 ExpressionChangedAfterItHasBeenCheckedError (NG0100)
    setTimeout(() => this.drawHoroscope(this.process_name));
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
    this.canvasCache = undefined;

    // 取消订阅防止内存泄漏
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 为了方便单元测试，使用这样的冗余函数
  private createCanvas(): fabric.StaticCanvas {
    return (this.canvas = new fabric.StaticCanvas(this.canvasId));
  }

  private drawHoroscope(process_name: ProcessName) {
    if (this.isDrawing || this.loading) return;

    this.isDrawing = true;
    this.loading = true;
    this.canvasCache = undefined;

    this.getHoroscopeComparisonData(process_name)
      .pipe(
        finalize(() => {
          this.isDrawing = false;
          this.loading = false;
        }),
      )
      .subscribe({
        next: (data: HoroscopeComparison) => {
          this.horoscopeComparisonData = data;
          this.isAlertOpen = false;
          this.draw(this.horoscopeComparisonData!);
        },
        error: (error: any) => {
          const errorMessage =
            error.error?.message || error.message || '未知错误';
          this.message = `获取星盘数据失败: ${errorMessage}`;
          this.isAlertOpen = true;
        },
      });
  }

  // 绘制星盘和相位
  private draw(horoscopeComparisonData: HoroscopeComparison) {
    if (this.isAspect) {
      drawAspect(horoscopeComparisonData.aspects, this.canvas!, this.config, {
        width: this.config.aspectImage.width,
        height: this.config.aspectImage.height,
      });
    } else {
      drawHorosco(horoscopeComparisonData, this.canvas!, this.config, {
        width: this.config.horoscoImage.width,
        height: this.config.horoscoImage.height,
      });
    }
    zoomImage(this.canvas!, this.platform);
  }

  get isAspect(): boolean {
    return this._isAspect;
  }

  set isAspect(value: boolean) {
    if (this.isAspect === value) {
      return;
    }

    // 如果正在绘制，则阻止切换
    if (this.isDrawing || this.loading) {
      return;
    }

    this._isAspect = value;

    let tempCache = this.canvasCache;
    this.canvasCache = this.canvas?.toJSON();

    if (tempCache) {
      this.canvas?.loadFromJSON(tempCache).then((canvas) => canvas.renderAll());
    } else {
      if (this.horoscopeComparisonData) {
        this.draw(this.horoscopeComparisonData);
      } else {
        // 根据程序的逻辑，此种情况不应当发生，如果发生了，意味着程序逻辑有误
        this.message = '应用异常，比较盘数据丢失!';
        this.isAlertOpen = true;
      }
    }
  }

  changeStep(step: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }) {
    // 使用Subject和防抖来优化频繁操作
    this.changeStepSubject.next(step);
  }

  private applyStepChange(step: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }) {
    let date = new Date(
      this.currentProcessData.date.year,
      this.currentProcessData.date.month - 1,
      this.currentProcessData.date.day,
      this.currentProcessData.date.hour,
      this.currentProcessData.date.minute,
      this.currentProcessData.date.second,
    );

    date.setFullYear(date.getFullYear() + step.year);
    date.setMonth(date.getMonth() + step.month);
    date.setDate(date.getDate() + step.day);
    date.setHours(date.getHours() + step.hour);
    date.setMinutes(date.getMinutes() + step.minute);
    date.setSeconds(date.getSeconds() + step.second);

    this.currentProcessData.date.year = date.getFullYear();
    this.currentProcessData.date.month = date.getMonth() + 1;
    this.currentProcessData.date.day = date.getDate();
    this.currentProcessData.date.hour = date.getHours();
    this.currentProcessData.date.minute = date.getMinutes();
    this.currentProcessData.date.second = date.getSeconds();

    this.drawHoroscope(this.process_name);
  }

  /**
   * 根据不同的推运名称获取相应比较盘数据
   *
   * 此函数根据提供的推运名称，选择性地调用不同的函数来获取比较星盘数据
   * 它使用switch语句来根据不同的推运名称返回不同的数据
   *
   * @param process_name - 指定的推运名称，用于决定获取哪种类型的比较盘数据
   * @returns 返回一个Observable，发出HoroscopeComparison类型的对象
   */
  private getHoroscopeComparisonData(
    process_name: ProcessName,
  ): Observable<HoroscopeComparison> {
    switch (process_name) {
      case ProcessName.Transit:
        return this.getTransitData();
      case ProcessName.SolarcomparNative:
      case ProcessName.NativecomparSolar:
      case ProcessName.LunarcomparNative:
      case ProcessName.NativecomparLunar:
      case ProcessName.DailycomparNative:
      case ProcessName.NativecomparDaily:
        return this.getReturnComparData(this.getComparisonType(process_name));
      default:
        this.message = `未知的推运名称: ${process_name}`;
        this.isAlertOpen = true;
        throw new Error(this.message);
    }
  }

  private getTransitData(): Observable<HoroscopeComparison> {
    this.returnData = null;

    const requestData: HoroscopeComparisonRequest = {
      original_date: this.horoData.date,
      comparison_date: this.currentProcessData.date, // 这里使用当前的processData.date
      original_geo: this.horoData.geo,
      comparison_geo: this.horoData.geo, // 注意这里的geo是原星盘的地理位置
      house: this.horoData.house,
    };

    return this.api.compare(requestData);
  }

  // 1. 本命比返照，process_date应该是本命盘的时间，而不是推运时间
  // 2. 日返盘与本命盘的经纬度不同，后端计算时比较盘的经纬度使用的是被比较盘的经纬度
  // 日返盘与本命盘的计算，应该分别计算两个盘，然后将两个盘的数据进行比较
  // 以上问题已经修复
  private getReturnComparData(
    comparisonType: ComparisonType,
  ): Observable<HoroscopeComparison> {
    // 获取返照数据
    const isSolar =
      comparisonType === ComparisonType.SolarComparNative ||
      comparisonType === ComparisonType.NativeComparSolar;

    const isDaily =
      comparisonType === ComparisonType.DailyComparNative ||
      comparisonType === ComparisonType.NativeComparDaily;

    const getReturnData$ = isDaily
      ? this.getDailyReturnData()
      : isSolar
        ? this.getSolarReturnData()
        : this.getLunarReturnData();

    return getReturnData$.pipe(
      switchMap((returnHoroData) => {
        this.returnData = returnHoroData;

        // 构建请求数据
        const returnDate = {
          ...returnHoroData.return_date,
          st: false,
        };

        const isReturnComparNative =
          comparisonType === ComparisonType.SolarComparNative ||
          comparisonType === ComparisonType.LunarComparNative ||
          comparisonType === ComparisonType.DailyComparNative;

        const requestData: HoroscopeComparisonRequest = {
          original_date: isReturnComparNative ? this.horoData.date : returnDate,
          comparison_date: isReturnComparNative
            ? returnDate
            : this.horoData.date,
          original_geo: isReturnComparNative
            ? this.horoData.geo
            : this.processData.geo,
          comparison_geo: isReturnComparNative
            ? this.processData.geo
            : this.horoData.geo,
          house: this.horoData.house,
        };

        return this.api.compare(requestData);
      }),
    );
  }

  // 计算太阳返照盘
  private getSolarReturnData(): Observable<ReturnHoroscope> {
    const requestData: ReturnRequest = {
      native_date: this.horoData.date,
      process_date: this.currentProcessData.date, // 这里使用当前的processData.date
      geo: this.processData.geo, // 注意：这里的geo是返照盘的地理位置
      house: this.horoData.house,
    };

    return this.api.solarReturn(requestData);
  }

  // 计算每日回归盘
  private getDailyReturnData(): Observable<ReturnHoroscope> {
    const requestData: ReturnRequest = {
      native_date: this.horoData.date,
      process_date: this.currentProcessData.date,
      geo: this.processData.geo,
      house: this.horoData.house,
    };

    return this.api.dailyReturn(requestData);
  }

  // 计算月亮返照盘
  private getLunarReturnData(): Observable<ReturnHoroscope> {
    let native_date = this.horoData.date;

    // 使用日返月亮位置
    if (this.processData.isSolarReturn) {
      // 计算日返
      return this.getSolarReturnData().pipe(
        map((solarReturnData) => {
          native_date = {
            year: solarReturnData.return_date.year,
            month: solarReturnData.return_date.month,
            day: solarReturnData.return_date.day,
            hour: solarReturnData.return_date.hour,
            minute: solarReturnData.return_date.minute,
            second: solarReturnData.return_date.second,
            tz: solarReturnData.return_date.tz,
            st: false,
          };

          let requestData: ReturnRequest = {
            native_date: native_date,
            process_date: this.currentProcessData.date, // 这里使用当前的processData.date
            geo: this.processData.geo, // 注意：这里的geo是返照盘的地理位置
            house: this.horoData.house,
          };

          return this.api.lunarReturn(requestData);
        }),
        switchMap((requestObservable) => requestObservable),
      );
    }

    let requestData: ReturnRequest = {
      native_date: native_date,
      process_date: this.currentProcessData.date, // 这里使用当前的processData.date
      geo: this.processData.geo, // 注意：这里的geo是返照盘的地理位置
      house: this.horoData.house,
    };

    return this.api.lunarReturn(requestData);
  }

  onDetail() {
    if (this.horoscopeComparisonData) {
      this.router.navigate([subPath.ComparisonDetails], {
        relativeTo: this.route,
        state: { data: this.horoscopeComparisonData },
      });
    }
  }

  private getComparisonType(process_name: ProcessName): ComparisonType {
    switch (process_name) {
      case ProcessName.SolarcomparNative:
        return ComparisonType.SolarComparNative;
      case ProcessName.NativecomparSolar:
        return ComparisonType.NativeComparSolar;
      case ProcessName.LunarcomparNative:
        return ComparisonType.LunarComparNative;
      case ProcessName.NativecomparLunar:
        return ComparisonType.NativeComparLunar;
      case ProcessName.DailycomparNative:
        return ComparisonType.DailyComparNative;
      case ProcessName.NativecomparDaily:
        return ComparisonType.NativeComparDaily;
      default:
        this.message = `无法识别的比较盘类型：${process_name}`;
        this.isAlertOpen = true;
        throw new Error(this.message);
    }
  }
}
