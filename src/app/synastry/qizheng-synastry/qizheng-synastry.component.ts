import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { Platform } from '@ionic/angular';
import * as fabric from 'fabric';
import { forkJoin, finalize } from 'rxjs';
import { QiZhengRequst } from 'src/app/type/interface/request-data';
import { drawQizhengSynastry } from 'src/app/utils/image/qizheng-synastry';
import { zoomImage } from 'src/app/utils/image/zoom-image';
import { Horoscope } from 'src/app/type/interface/response-qizheng';

@Component({
  selector: 'app-qizheng-synastry',
  templateUrl: './qizheng-synastry.component.html',
  styleUrls: ['./qizheng-synastry.component.scss'],
  standalone: false,
})
export class QizhengSynastryComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private canvas?: fabric.Canvas;
  loading = false;
  isDrawing = false;
  isSwapped = false;

  isAlertOpen = false;
  message = '';
  alertButtons = ['OK'];
  private nativeHoro?: Horoscope;
  private comparisonHoro?: Horoscope;

  constructor(
    private api: ApiService,
    private storage: HoroStorageService,
    private config: QizhengConfigService,
    private tip: TipService,
    private titleService: Title,
    private platform: Platform,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('七政四余合盘');
  }

  ngAfterViewInit(): void {
    this.canvas = this.createCanvas();
    if (!this.canvas) {
      this.message = '创建画布失败';
      this.isAlertOpen = true;
      return;
    }
    this.loadDataAndDraw();
  }

  // 为了方便单元测试，使用这样的冗余函数
  private createCanvas(): fabric.Canvas {
    return new fabric.Canvas('canvas');
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }

  private loadDataAndDraw() {
    if (this.loading || this.isDrawing) return;
    this.loading = true;
    this.isDrawing = true;
    this.isAlertOpen = false;

    const nativeReq: QiZhengRequst = {
      native_date: this.storage.horoData.date,
      geo: this.storage.horoData.geo,
      // process_date = native_date + 1 year
      process_date: {
        ...this.storage.horoData.date,
        year: this.storage.horoData.date.year + 1,
      },
    };

    const comparisonReq: QiZhengRequst = {
      native_date: this.storage.synastryData.date,
      geo: this.storage.synastryData.geo,
      // process_date = native_date + 1 year
      process_date: {
        ...this.storage.synastryData.date,
        year: this.storage.synastryData.date.year + 1,
      },
    };

    forkJoin([this.api.qizheng(nativeReq), this.api.qizheng(comparisonReq)])
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isDrawing = false;
        }),
      )
      .subscribe({
        next: ([nativeHoro, comparisonHoro]) => {
          this.nativeHoro = nativeHoro;
          this.comparisonHoro = comparisonHoro;
          if (this.canvas) {
            this.draw();
            this.zoomImage();
          }
        },
        error: (err) => {
          this.message =
            (err.message ?? '未知错误') + ' ' + (err.error?.error ?? '');
          this.isAlertOpen = true;
        },
      });
  }

  private draw() {
    if (!this.canvas || !this.nativeHoro || !this.comparisonHoro) return;
    const base = this.isSwapped ? this.comparisonHoro : this.nativeHoro;
    const comp = this.isSwapped ? this.nativeHoro : this.comparisonHoro;
    drawQizhengSynastry(base, comp, this.canvas, this.config, this.tip, {
      width: this.config.HoroscoImage.width,
      height: this.config.HoroscoImage.height,
    });
  }

  private zoomImage() {
    if (!this.canvas) return;
    zoomImage(this.canvas, this.platform);
  }

  swap() {
    if (this.loading || this.isDrawing) return;
    this.isSwapped = !this.isSwapped;
    this.draw();
  }
}
