import { AfterViewInit, Component, OnDestroy, OnInit, OnChanges, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import * as fabric from 'fabric';
import { ReturnHoroscope } from 'src/app/type/interface/response-data';
import {
  HoroRequest,
  ProcessRequest,
  ReturnRequest,
} from 'src/app/type/interface/request-data';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, switchMap, finalize, map, takeUntil } from 'rxjs/operators';
import { drawAspect, drawReturnHorosco } from 'src/app/utils/image/horo';
import { Platform, IonicModule } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { ProcessName } from 'src/app/process/enum/process';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { CanvasResizeHelper } from 'src/app/utils/image/canvas-resize-helper';
import { DetailComponent } from './detail/detail.component';
import { FormsModule } from '@angular/forms';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';

@Component({
  selector: 'app-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HoroCommonModule, DetailComponent],
})
export class ReturnComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() inputProcessName?: ProcessName;
  @Input() canvasId: string = 'canvas';
  @Input() embedded: boolean = false;

  process_name = ProcessName.SolarReturn;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  private processData: DeepReadonly<ProcessRequest> = this.storage.processData;
  currentProcessData: ProcessRequest = structuredClone(this.processData);

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染）
  initialized = false;

  returnHoroscopeData: ReturnHoroscope | null = null; // 存储返照盘数据的缓存

  private _isAspect = false; // 默认绘制星盘
  selectedTab: 'horoscope' | 'detail' = 'horoscope';
  private canvasCache: { version: string; objects: Object[] } | undefined =
    undefined;

  loading = false;
  isDrawing = false; // 添加绘制状态标志

  private canvas?: fabric.StaticCanvas;
  @ViewChild('canvasRef') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private changeStepSubject = new Subject<void>();
  private destroy$ = new Subject<void>();
  private resizeHelper = new CanvasResizeHelper(
    () => this.canvas,
    () => this.canvasRef,
    () => this.embedded,
    this.platform,
    this.destroy$,
    () => this.isDrawing || this.loading,
  );

  get isAspect(): boolean {
    return this._isAspect;
  }

  set isAspect(value: boolean) {
    if (this._isAspect === value) {
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
      if (this.returnHoroscopeData) {
        this.draw(this.returnHoroscopeData);
      } else {
        // 根据程序的逻辑，此种情况不应当发生，如果发生了，意味着程序逻辑有误
        this.message = '应用异常，返照盘数据丢失!';
        this.isAlertOpen = true;
      }
    }
  }

  get title(): string {
    return ProcessName.name(this.process_name);
  }

  degreeToDMSFn = degreeToDMS;

  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router, // 添加 router
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
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
      if (!process_name) {
        this.message = '配置错误，路由没有正确配置返照盘类型';
        this.isAlertOpen = true;
        return;
      }

      switch (process_name) {
        case ProcessName.SolarReturn:
        case ProcessName.LunarReturn:
        case ProcessName.DailyReturn:
          this.process_name = process_name;
          break;
        default:
          this.message = `无此种返照盘：${process_name}`;
          this.isAlertOpen = true;
          return;
      }

      this.titleService.setTitle(this.title);
    }

    this.initialized = true;

    // 使用防抖优化频繁的日期变更操作
    this.changeStepSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.drawHoroscope(this.process_name);
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
    this.resizeHelper.setupResizeObserver();
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

    this.resizeHelper.destroy();

    // 取消订阅防止内存泄漏
    this.destroy$.next();
    this.destroy$.complete();
  }

  private drawHoroscope(process_name: ProcessName) {
    if (this.isDrawing || this.loading) return; // 如果正在绘制或加载则返回

    this.isDrawing = true; // 开始绘制
    this.loading = true;
    this.canvasCache = undefined;

    this.getReturnData(process_name)
      .pipe(
        finalize(() => {
          this.isDrawing = false; // 结束绘制
          this.loading = false;
        }),
      )
      .subscribe({
        next: (data) => {
          this.returnHoroscopeData = data;
          this.isAlertOpen = false;
          this.draw(this.returnHoroscopeData);
        },
        error: (error: any) => {
          const message = error.message + ' ' + (error.error?.message || '');
          this.message = message;
          this.isAlertOpen = true;
        },
      });
  }

  // 获取取返照盘
  private getReturnData(
    process_name: ProcessName,
  ): Observable<ReturnHoroscope> {
    return process_name === ProcessName.LunarReturn
      ? this.getLunarReturnData()
      : process_name === ProcessName.SolarReturn
        ? this.getSolarReturnData()
        : this.getDailyReturnData();
  }

  // 计算日返
  private getSolarReturnData(): Observable<ReturnHoroscope> {
    const requestData: ReturnRequest = {
      native_date: this.horoData.date,
      geo: this.processData.geo, // 注意这里的geo是返照盘的地理位置
      house: this.horoData.house,
      process_date: this.currentProcessData.date, // 这里使用当前的processData.date
    };

    return this.api.solarReturn(requestData);
  }

  // 计算每日回归
  private getDailyReturnData(): Observable<ReturnHoroscope> {
    const requestData: ReturnRequest = {
      native_date: this.horoData.date,
      geo: this.processData.geo,
      house: this.horoData.house,
      process_date: this.currentProcessData.date,
    };

    return this.api.dailyReturn(requestData);
  }

  // 计算月返
  private getLunarReturnData(): Observable<ReturnHoroscope> {
    const getNativeDate$ = this.currentProcessData.isSolarReturn
      ? this.getSolarReturnData().pipe(
          map((solarReturnData) => ({
            year: solarReturnData.return_date.year,
            month: solarReturnData.return_date.month,
            day: solarReturnData.return_date.day,
            hour: solarReturnData.return_date.hour,
            minute: solarReturnData.return_date.minute,
            second: solarReturnData.return_date.second,
            tz: solarReturnData.return_date.tz,
            st: false,
          })),
        )
      : of(this.horoData.date);

    return getNativeDate$.pipe(
      switchMap((native_date) => {
        const requestData: ReturnRequest = {
          native_date,
          geo: this.processData.geo, // 注意这里的geo是返照盘的地理位置
          house: this.horoData.house,
          process_date: this.currentProcessData.date, // 这里使用当前的processData.date
        };
        return this.api.lunarReturn(requestData);
      }),
    );
  }

  // 绘制星盘和相位
  draw(returnHoroscopeData: ReturnHoroscope) {
    if (this.isAspect) {
      drawAspect(returnHoroscopeData.aspects, this.canvas!, this.config, {
        width: this.config.aspectImage.width,
        height: this.config.aspectImage.height,
      });
    } else {
      drawReturnHorosco(returnHoroscopeData, this.canvas!, this.config, {
        width: this.config.horoscoImage.width,
        height: this.config.horoscoImage.height,
      });
    }
    // 记录绘制后的原始 canvas 尺寸，用于 resize 时基于原始尺寸重新缩放
    this.resizeHelper.onDraw();
  }

  changeStep(step: {
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

    this.changeStepSubject.next();
  }

  // 为了方便单元测试，使用这样的冗余函数
  private createCanvas(): fabric.StaticCanvas {
    return (this.canvas = new fabric.StaticCanvas(this.canvasId));
  }
}
