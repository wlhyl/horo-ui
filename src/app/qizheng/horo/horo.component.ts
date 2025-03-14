import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';

import * as fabric  from 'fabric';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { QiZhengRequst } from 'src/app/type/interface/request-data';
import { lastValueFrom } from 'rxjs';
import { drawHoroscope } from 'src/app/utils/image/qizheng';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { zoomImage } from 'src/app/utils/image/horo';
import { Platform } from '@ionic/angular';
import { Path } from '../../type/enum/path';

@Component({
  selector: 'app-horo',
  templateUrl: './horo.component.html',
  styleUrls: ['./horo.component.scss'],
})
export class HoroComponent implements OnInit, AfterViewInit, OnDestroy {
  path = Path;

  horoData = this.storage.horoData;
  processData = this.storage.processData;

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
    private platform: Platform
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);

    // this.canvas.on('object:scaling', function(e) {
    //   var object = e.target,
    //       scaleX = object?.scaleX,
    //       scaleY = object?.scaleY;

    //   console.log('Object scaling. Object:', object?.get('type'), 'New scaleX:', scaleX, 'New scaleY:', scaleY);
    // });
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
      process_date: this.processData.date,
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
      this.processData.date.year,
      this.processData.date.month - 1,
      this.processData.date.day,
      this.processData.date.hour,
      this.processData.date.minute,
      this.processData.date.second
    );

    date.setFullYear(date.getFullYear() + step.year);
    date.setMonth(date.getMonth() + step.month);
    date.setDate(date.getDate() + step.day);
    date.setHours(date.getHours() + step.hour);
    date.setMinutes(date.getMinutes() + step.minute);
    date.setSeconds(date.getSeconds() + step.second);

    this.processData.date.year = date.getFullYear();
    this.processData.date.month = date.getMonth() + 1;
    this.processData.date.day = date.getDate();
    this.processData.date.hour = date.getHours();
    this.processData.date.minute = date.getMinutes();
    this.processData.date.second = date.getSeconds();

    await this.drawHoroscope();
  }
}
