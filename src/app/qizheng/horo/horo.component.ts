import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as fabric from 'fabric';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import {
  HoroRequest,
  ProcessRequest,
  QiZhengRequst,
} from 'src/app/type/interface/request-data';
import { drawHoroscope } from 'src/app/utils/image/qizheng';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { Platform } from '@ionic/angular';
import { Path } from '../../type/enum/path';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { Path as subPath } from '../path';
import { informationCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { zoomImage } from 'src/app/utils/image/zoom-image';
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-horo',
  templateUrl: './horo.component.html',
  styleUrls: ['./horo.component.scss'],
  standalone: false,
})
export class HoroComponent implements OnInit, AfterViewInit, OnDestroy {
  path = Path;

  horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  private processData: DeepReadonly<ProcessRequest> = this.storage.processData;
  currentProcessData: ProcessRequest = structuredClone(this.processData);

  horoscopeData: Horoscope | null = null;

  title = '七政四余';

  private canvas?: fabric.Canvas;
  private destroy$ = new Subject<void>();
  private changeStepSubject = new Subject<{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }>();

  loading = false;
  isDrawing = false; // 添加绘制状态标志

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    private config: QizhengConfigService,
    private tip: TipService,
    private titleService: Title,
    private platform: Platform,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ informationCircleOutline });
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);

    // 使用防抖优化频繁的日期变更操作
    this.changeStepSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((step) => {
        this.applyStepChange(step);
      });
  }

  ngAfterViewInit(): void {
    // 为兼容单元测试，使用这样的冗余函数
    this.canvas = this.createCanvas();
    this.drawHoroscope();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }

  // 为了方便单元测试，使用这样的冗余函数
  private createCanvas(): fabric.Canvas {
    return new fabric.Canvas('canvas');
  }

  private drawHoroscope() {
    if (this.isDrawing || this.loading) return; // 如果正在绘制或加载则返回

    this.isDrawing = true; // 开始绘制
    this.loading = true;
    this.isAlertOpen = false; // 确保在开始请求时关闭错误提示

    const requestData: QiZhengRequst = {
      native_date: this.horoData.date,
      geo: this.horoData.geo,
      process_date: this.currentProcessData.date, // 使用当前的推运日期
    };

    this.api
      .qizheng(requestData)
      .pipe(
        finalize(() => {
          this.isDrawing = false;
          this.loading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.horoscopeData = data;
          this.isAlertOpen = false;
          this.draw();
        },
        error: (err) => {
          this.horoscopeData = null;
          this.message =
            (err.message ?? '未知错误') + ' ' + (err.error?.error??  '未知错误详情');
          this.isAlertOpen = true;
        },
      });
  }

  // 绘制星盘
  private draw() {
    if (this.horoscopeData === null || !this.canvas) return;

    drawHoroscope(this.horoscopeData, this.canvas, this.config, this.tip, {
      width: this.config.HoroscoImage.width,
      height: this.config.HoroscoImage.height,
    });

    zoomImage(this.canvas, this.platform);
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
      this.currentProcessData.date.second
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

    this.drawHoroscope();
  }

  onDetail() {
    if (this.horoscopeData) {
      this.router.navigate([subPath.HoroDetail], {
        relativeTo: this.route,
        state: { data: this.horoscopeData },
      });
    }
  }
}
