import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroscopeComparison } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import * as fabric from 'fabric';
import { HoroscopeComparisonRequest } from 'src/app/type/interface/request-data';
import { finalize, Observable } from 'rxjs';
import { drawAspect } from 'src/app/utils/image/compare';
import { drawHorosco } from 'src/app/utils/image/synastry';
import { zoomImage } from 'src/app/utils/image/zoom-image';
import { Platform } from '@ionic/angular';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Path } from '../enum/path';

@Component({
  selector: 'app-synastry',
  templateUrl: './synastry.component.html',
  styleUrls: ['./synastry.component.scss'],
  standalone: false,
})
export class SynastryComponent implements OnInit, AfterViewInit, OnDestroy {
  horoscopeComparisonData: HoroscopeComparison | null = null;

  private _isAspect = false;

  private canvasCache: { version: string; objects: Object[] } | undefined =
    undefined;

  private canvas?: fabric.StaticCanvas;

  loading = false;

  isDrawing = false;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  isSwapped = false;

  get isAspect(): boolean {
    return this._isAspect;
  }

  set isAspect(value: boolean) {
    if (this.isAspect === value) {
      return;
    }

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
        this.message = '应用异常，比较盘数据丢失!';
        this.isAlertOpen = true;
      }
    }
  }

  constructor(
    private platform: Platform,
    private titleService: Title,
    private api: ApiService,
    private config: Horoconfig,
    private storage: HoroStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.titleService.setTitle('合盘');
  }

  ngAfterViewInit(): void {
    this.canvas = this.createCanvas();
    this.drawHoroscope();
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
    this.canvasCache = undefined;
  }

  private createCanvas(): fabric.StaticCanvas {
    return (this.canvas = new fabric.StaticCanvas('canvas'));
  }

  swap(): void {
    if (this.isDrawing || this.loading) {
      return;
    }
    this.isSwapped = !this.isSwapped;
    this.drawHoroscope();
  }

  private drawHoroscope() {
    if (this.isDrawing || this.loading) return;

    this.isDrawing = true;
    this.loading = true;
    this.canvasCache = undefined;

    this.getHoroscopeComparisonData()
      .pipe(
        finalize(() => {
          this.isDrawing = false;
          this.loading = false;
        })
      )
      .subscribe({
        next: (data) => {
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

  private draw(horoscopeComparisonData: HoroscopeComparison) {
    if (this.isAspect) {
      drawAspect(horoscopeComparisonData.aspects, this.canvas!, this.config, {
        width: this.config.synastryAspectImage.width,
        height: this.config.synastryAspectImage.height,
      });
    } else {
      drawHorosco(horoscopeComparisonData, this.canvas!, this.config, {
        width: this.config.synastryHoroscoImage.width,
        height: this.config.synastryHoroscoImage.height,
      });
    }
    zoomImage(this.canvas!, this.platform);
  }

  private getHoroscopeComparisonData(): Observable<HoroscopeComparison> {
    const originalHoroData: HoroRequest = this.storage.horoData;
    const comparisonHoroData: HoroRequest = this.storage.synastryData;

    const original = this.isSwapped ? comparisonHoroData : originalHoroData;
    const comparison = this.isSwapped ? originalHoroData : comparisonHoroData;

    const requestData: HoroscopeComparisonRequest = {
      original_date: original.date,
      comparison_date: comparison.date,
      original_geo: original.geo,
      comparison_geo: comparison.geo,
      house: original.house,
    };

    return this.api.compare(requestData);
  }

  goToPlanetFriendship(): void {
    this.router.navigate([Path.PlanetFriendship], {
      relativeTo: this.activatedRoute,
    });
  }
}
