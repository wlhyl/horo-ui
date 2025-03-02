import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { ProcessName } from 'src/app/process/enum/process';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  HoroscopeComparison,
  ReturnHoroscope,
} from 'src/app/type/interface/response-data';
import { Canvas } from 'src/app/type/alias/canvas';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { Platform } from '@ionic/angular';
import { fabric } from 'fabric';
import {
  HoroscopeComparisonRequest,
  ReturnRequest,
} from 'src/app/type/interface/request-data';
import { lastValueFrom } from 'rxjs';
import { drawAspect, drawHorosco } from 'src/app/utils/image/compare';
import { zoomImage } from 'src/app/utils/image/horo';
import { degreeToDMS } from 'src/app/utils/horo-math';
import { Path } from 'src/app/type/enum/path';
import { Path as subPath } from '../enum/path';

enum ComparisonType {
  SolarComparNative, // 日返照盘比本命盘
  NativeComparSolar, // 本命盘比日返照盘
  LunarComparNative, // 月返照盘比本命盘
  NativeComparLunar, // 本命盘比月返照盘
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit, AfterViewInit, OnDestroy {
  path = Path;
  horoData = this.storage.horoData;
  processData = this.storage.processData;
  horoscopeComparisonData: HoroscopeComparison | null = null;
  returnData: ReturnHoroscope | null = null;

  private _isAspect = false; // 默认绘制星盘

  private canvasCache: { version: string; objects: Object[] } | undefined =
    undefined;

  private canvas?: Canvas;

  loading = false;

  process_name = ProcessName.Transit;

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  isDrawing = false;

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
    public config: Horoconfig
  ) {}

  ngOnInit() {
    const process_name = this.route.snapshot.data['process_name'];

    if (process_name === null) {
      this.message = '选择一种比较盘';
      this.isAlertOpen = true;
      return;
    }

    switch (process_name) {
      case ProcessName.Transit:
      case ProcessName.SolarcomparNative:
      case ProcessName.NativecomparSolar:
      case ProcessName.LunarcomparNative:
      case ProcessName.NativecomparLunar:
        this.process_name = process_name;
        break;
      default:
        this.message = `无此种比较盘：${process_name}`;
        this.isAlertOpen = true;
        return;
    }

    this.titleService.setTitle(this.title);
  }

  ngAfterViewInit(): void {
    this.canvas = new fabric.StaticCanvas('canvas');
    this.drawHoroscope(this.process_name);
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
    this.canvasCache = undefined;
  }

  private async drawHoroscope(process_name: ProcessName) {
    if (this.isDrawing || this.loading) return;

    this.isDrawing = true;
    this.loading = true;
    this.canvasCache = undefined;

    try {
      this.horoscopeComparisonData = await this.getHoroscopeComparisonData(
        process_name
      );
      this.isAlertOpen = false;
      this.draw();
    } catch (error: any) {
      const errorMessage = error.error?.message || error.message || '未知错误';
      this.message = `获取星盘数据失败: ${errorMessage}`;
      this.isAlertOpen = true;
    } finally {
      this.isDrawing = false;
      this.loading = false;
    }
  }

  // 绘制星盘和相位
  private draw() {
    if (this.horoscopeComparisonData === null) return;

    if (this.isAspect) {
      drawAspect(
        this.horoscopeComparisonData.aspects,
        this.canvas!,
        this.config,
        {
          width: this.config.aspectImage.width,
          height: this.config.aspectImage.height,
        }
      );
    } else {
      drawHorosco(this.horoscopeComparisonData, this.canvas!, this.config, {
        width: this.config.HoroscoImage.width,
        height: this.config.HoroscoImage.height,
      });
    }
    zoomImage(this.canvas!, this.platform);
  }

  get isAspect(): boolean {
    return this._isAspect;
  }

  set isAspect(value: boolean) {
    // 如果正在绘制，则阻止切换
    if (this.isDrawing || this.loading) {
      return;
    }

    this._isAspect = value;

    let tempCache = this.canvasCache;
    this.canvasCache = this.canvas?.toJSON();

    if (tempCache) {
      this.canvas?.loadFromJSON(tempCache, () => {});
    } else {
      this.draw();
    }
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

    await this.drawHoroscope(this.process_name);
  }

  /**
   * 根据不同的推运名称获取相应比较盘数据
   *
   * 此函数根据提供的推运名称，选择性地调用不同的函数来获取比较星盘数据
   * 它使用switch语句来根据不同的推运名称返回不同的数据
   *
   * @param process_name - 指定的推运名称，用于决定获取哪种类型的比较盘数据
   * @returns 返回一个Promise，解析为HoroscopeComparison类型的对象
   */
  private async getHoroscopeComparisonData(
    process_name: ProcessName
  ): Promise<HoroscopeComparison> {
    switch (process_name) {
      case ProcessName.Transit:
        return this.getTransitData();
      case ProcessName.SolarcomparNative:
      case ProcessName.NativecomparSolar:
      case ProcessName.LunarcomparNative:
      case ProcessName.NativecomparLunar:
        return this.getReturnComparData(this.getComparisonType(process_name));
      default:
        this.message = `未知的推运名称: ${process_name}`;
        this.isAlertOpen = true;
        throw new Error(this.message);
    }
  }

  private async getTransitData(): Promise<HoroscopeComparison> {
    this.returnData = null;

    const requestData: HoroscopeComparisonRequest = {
      original_date: this.horoData.date,
      comparison_date: this.processData.date,
      original_geo: this.horoData.geo,
      comparison_geo: this.horoData.geo, // 注意这里的geo是原星盘的地理位置
      house: this.horoData.house,
    };

    return await lastValueFrom(this.api.compare(requestData));
  }

  // 1. 本命比返照，process_date应该是本命盘的时间，而不是推运时间
  // 2. 日返盘与本命盘的经纬度不同，后端计算时比较盘的经纬度使用的是被比较盘的经纬度
  // 日返盘与本命盘的计算，应该分别计算两个盘，然后将两个盘的数据进行比较
  // 以上问题已经修复
  private async getReturnComparData(
    comparisonType: ComparisonType
  ): Promise<HoroscopeComparison> {
    // 获取返照数据
    const isSolar =
      comparisonType === ComparisonType.SolarComparNative ||
      comparisonType === ComparisonType.NativeComparSolar;

    const returnHoroData = await (isSolar
      ? this.getSolarReturnData()
      : this.getLunarReturnData());
    this.returnData = returnHoroData;

    // 构建请求数据
    const returnDate = {
      ...returnHoroData.return_date,
      st: false,
    };

    const isReturnComparNative =
      comparisonType === ComparisonType.SolarComparNative ||
      comparisonType === ComparisonType.LunarComparNative;

    const requestData: HoroscopeComparisonRequest = {
      original_date: isReturnComparNative ? this.horoData.date : returnDate,
      comparison_date: isReturnComparNative ? returnDate : this.horoData.date,
      original_geo: isReturnComparNative
        ? this.horoData.geo
        : this.processData.geo,
      comparison_geo: isReturnComparNative
        ? this.processData.geo
        : this.horoData.geo,
      house: this.horoData.house,
    };

    return await lastValueFrom(this.api.compare(requestData));
  }

  // 计算太阳返照盘
  private async getSolarReturnData(): Promise<ReturnHoroscope> {
    const requestData: ReturnRequest = {
      native_date: this.horoData.date,
      process_date: this.processData.date,
      geo: this.processData.geo, // 注意：这里的geo是返照盘的地理位置
      house: this.horoData.house,
    };

    return await lastValueFrom(this.api.solarReturn(requestData));
  }

  // 计算月亮返照盘
  private async getLunarReturnData(): Promise<ReturnHoroscope> {
    let native_date = this.horoData.date;

    // 使用日返月亮位置
    if (this.processData.isSolarReturn) {
      // 计算日返
      const solarReturnData = await this.getSolarReturnData();

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
    }

    let requestData: ReturnRequest = {
      native_date: native_date,
      process_date: this.processData.date,
      geo: this.processData.geo, // 注意：这里的geo是返照盘的地理位置
      house: this.horoData.house,
    };

    return await lastValueFrom(this.api.lunarReturn(requestData));
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
      default:
        this.message = `无法识别的比较类型：${process_name}`;
        this.isAlertOpen = true;
        throw new Error(this.message);
    }
  }
}
