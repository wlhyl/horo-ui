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
import { lastValueFrom } from 'rxjs';
import { drawHoroscope } from 'src/app/utils/image/qizheng';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { zoomImage } from 'src/app/utils/image/horo';
import { Platform } from '@ionic/angular';
import { Path } from '../../type/enum/path';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { Path as subPath } from '../path';
import { informationCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
  }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas('canvas');
    this.drawHoroscope();
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }

  private async drawHoroscope() {
    if (this.isDrawing || this.loading) return; // 如果正在绘制或加载则返回

    this.isDrawing = true; // 开始绘制
    this.loading = true;

    const requestData: QiZhengRequst = {
      native_date: this.horoData.date,
      geo: this.horoData.geo,
      process_date: this.currentProcessData.date, // 使用当前的推运日期
    };

    try {
      this.horoscopeData = await lastValueFrom(this.api.qizheng(requestData));
      this.isAlertOpen = false;
      this.draw();
    } catch (error: any) {
      const message = error.message + ' ' + error.error.message;
      this.message = message;
      this.isAlertOpen = true;
    } finally {
      this.isDrawing = false; // 结束绘制
      this.loading = false;
    }
  }

  // 绘制星盘
  private draw() {
    if (this.horoscopeData === null) return;

    drawHoroscope(this.horoscopeData, this.canvas!, this.config, this.tip, {
      width: this.config.HoroscoImage.width,
      height: this.config.HoroscoImage.height,
    });

    zoomImage(this.canvas!, this.platform);
  }

  async changeStep(step: {
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

    await this.drawHoroscope();
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
