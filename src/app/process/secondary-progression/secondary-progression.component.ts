import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as fabric from 'fabric';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { ProcessName } from '../enum/process';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  HoroRequest,
  ProcessRequest,
  SecondaryProgressionRequest,
} from 'src/app/type/interface/request-data';
import { SecondaryProgression } from 'src/app/type/interface/response-data';
import { drawAspect, drawHorosco } from 'src/app/utils/image/horo';
import { CanvasResizeHelper } from 'src/app/utils/image/canvas-resize-helper';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { DetailComponent } from 'src/app/native/detail/detail.component';

@Component({
  selector: 'app-secondary-progression',
  templateUrl: './secondary-progression.component.html',
  styleUrls: ['./secondary-progression.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HoroCommonModule, DetailComponent],
})
export class SecondaryProgressionComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() inputHoroData?: HoroRequest;
  @Input() inputProcessData?: ProcessRequest;
  @Input() canvasId = 'secondary-progression-canvas';
  @Input() embedded = false;

  private horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  private processData: DeepReadonly<ProcessRequest> = this.storage.processData;
  currentProcessData: ProcessRequest = structuredClone(this.processData);
  secondaryProgressionData: SecondaryProgression | null = null;
  initialized = false;
  loading = false;
  isDrawing = false;
  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';
  selectedTab: 'horoscope' | 'detail' = 'horoscope';
  private _isAspect = false;
  private canvas?: fabric.StaticCanvas;
  private destroy$ = new Subject<void>();
  private changeStepSubject = new Subject<{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }>();
  @ViewChild('canvasRef') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private resizeHelper = new CanvasResizeHelper(
    () => this.canvas,
    () => this.canvasRef,
    () => this.embedded,
    this.platform,
    this.destroy$,
    () => this.isDrawing || this.loading,
  );

  get title(): string {
    return ProcessName.name(ProcessName.SecondaryProgression);
  }
  get isAspect(): boolean {
    return this._isAspect;
  }
  set isAspect(value: boolean) {
    if (this._isAspect === value || this.isDrawing || this.loading) return;
    this._isAspect = value;
    if (this.secondaryProgressionData) this.draw(this.secondaryProgressionData);
  }

  constructor(
    private platform: Platform,
    private api: ApiService,
    private storage: HoroStorageService,
    public config: Horoconfig,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    if (this.embedded) {
      if (!this.inputHoroData) {
        this.message = '嵌入模式缺少输入参数：inputHoroData';
        this.isAlertOpen = true;
        return;
      }
      if (!this.inputProcessData) {
        this.message = '嵌入模式缺少输入参数：inputProcessData';
        this.isAlertOpen = true;
        return;
      }
      this.horoData = this.inputHoroData;
      this.processData = this.inputProcessData;
      this.currentProcessData = structuredClone(this.inputProcessData);
    } else {
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
    // 首次初始化由 ngOnInit 处理，避免重复 fetch
    if (!this.initialized) return;
    let changed = false;
    if (changes['inputHoroData'] && this.inputHoroData) {
      this.horoData = this.inputHoroData;
      changed = true;
    }
    if (changes['inputProcessData'] && this.inputProcessData) {
      this.processData = this.inputProcessData;
      this.currentProcessData = structuredClone(this.inputProcessData);
      changed = true;
    }
    if (changed && this.canvas) this.load();
  }

  ngAfterViewInit(): void {
    this.canvas = new fabric.StaticCanvas(this.canvasId);
    this.resizeHelper.setupResizeObserver();
    setTimeout(() => this.load());
  }

  ngOnDestroy(): void {
    this.canvas?.dispose();
    this.canvas = undefined;
    this.resizeHelper.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    if (!this.initialized || this.isDrawing || this.loading || !this.canvas)
      return;
    this.isDrawing = true;
    this.loading = true;
    const request: SecondaryProgressionRequest = {
      native_date: this.horoData.date,
      process_date: this.currentProcessData.date,
      geo: this.processData.geo, // 注意这里的geo是推运所在地的地理位置
      method: this.currentProcessData.secondary_progression_method,
      house: this.horoData.house,
    };
    this.api
      .secondaryProgression(request)
      .pipe(
        finalize(() => {
          this.isDrawing = false;
          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (data) => {
          this.secondaryProgressionData = data;
          this.isAlertOpen = false;
          this.draw(data);
        },
        error: (error) => {
          this.message =
            error.error?.message || error.message || '获取次限推运失败';
          this.isAlertOpen = true;
        },
      });
  }

  private draw(data: SecondaryProgression): void {
    if (!this.canvas) return;
    if (this.isAspect) {
      drawAspect(data.horoscope.aspects, this.canvas, this.config, {
        width: this.config.aspectImage.width,
        height: this.config.aspectImage.height,
      });
    } else {
      drawHorosco(data.horoscope, this.canvas, this.config, {
        width: this.config.horoscoImage.width,
        height: this.config.horoscoImage.height,
      });
    }
    this.resizeHelper.onDraw();
  }

  changeStep(step: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }): void {
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
  }): void {
    const date = new Date(
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
    this.currentProcessData.date = {
      ...this.currentProcessData.date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
    this.load();
  }
}
