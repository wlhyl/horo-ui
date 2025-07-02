import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ApiService } from 'src/app/services/api/api.service';
import { lastValueFrom } from 'rxjs';
import { Platform, AlertController } from '@ionic/angular';
import { StaticCanvas } from 'fabric';
import { drawAspect, drawHorosco } from 'src/app/utils/image/horo';
import { Title } from '@angular/platform-browser';
import { degreeToDMS } from 'src/app/utils/horo-math';
import { Path } from 'src/app/type/enum/path';
import { AuthService } from 'src/app/services/auth/auth.service'; // 导入 AuthService
import { Router, ActivatedRoute } from '@angular/router'; // 导入 Router 和 ActivatedRoute
import {
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from 'src/app/type/interface/horoscope-record';
import { Path as subPath } from '../enum';
import { isLocationEqual } from 'src/app/utils/location-record';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  informationCircleOutline,
  createOutline,
  archiveOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'teanote-image',
  templateUrl: 'image.component.html',
  styleUrls: ['image.component.scss'],
  standalone: false,
})
export class ImageComponent implements OnInit, AfterViewInit, OnDestroy {
  path = Path;
  private horoData: DeepReadonly<HoroRequest> = this.storage.horoData;
  currentHoroData: HoroRequest = structuredClone(this.horoData);

  isAlertOpen = false;
  alertButtons = ['OK'];
  message = '';

  // 存档成功提示
  isSaveOpen = false;

  loading = false;

  public horoscoData: Horoscope | null = null;
  // canvas缓存，手机浏览器this.draw()执行慢，因此切换horo、aspect时使用此缓存
  private canvasCache: { version: string; objects: Object[] } | undefined =
    undefined;

  private canvas?: StaticCanvas;

  title = '本命星盘';

  degreeToDMSFn = degreeToDMS;

  private _isAspect = false; // 默认绘制星盘

  isDrawing = false; // 添加绘制状态标志

  constructor(
    private platform: Platform,
    private api: ApiService,
    public config: Horoconfig,
    private storage: HoroStorageService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ informationCircleOutline, createOutline, archiveOutline });
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }

  ngAfterViewInit(): void {
    this.canvas = new StaticCanvas('canvas');
    this.drawHoroscope(this.currentHoroData);
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = undefined;
    }
  }

  private async drawHoroscope(horoData: HoroRequest) {
    if (this.isDrawing || this.loading) return; // 如果正在绘制或加载则返回

    this.isDrawing = true; // 开始绘制
    this.loading = true;
    this.canvasCache = undefined;

    try {
      this.horoscoData = await lastValueFrom(
        this.api.getNativeHoroscope(horoData)
      );
      this.isAlertOpen = false;
      this.draw();
    } catch (error: any) {
      this.message = error.message + ' ' + error.error.message;
      this.isAlertOpen = true;
    } finally {
      this.isDrawing = false; // 结束绘制
      this.loading = false;
    }
  }

  // 绘制星盘和相位
  private draw() {
    if (this.horoscoData === null) return;

    if (this.isAspect) {
      drawAspect(this.horoscoData.aspects, this.canvas!, this.config, {
        width: this.config.aspectImage.width,
        heigth: this.config.aspectImage.height,
      });
    } else {
      drawHorosco(this.horoscoData, this.canvas!, this.config, {
        width: this.config.HoroscoImage.width,
        heigth: this.config.HoroscoImage.height,
      });
    }
    this.zoomImage(this.canvas!);
  }

  // 绘制完成后根据屏幕大小缩放
  private zoomImage(canvas: StaticCanvas) {
    this.platform.ready().then(() => {
      let canvasWidth = canvas.getWidth();
      if (!canvasWidth) return;
      let width = this.platform.width();
      let zoom = (width - 10) / canvasWidth;
      if (zoom < 1) {
        canvas.setWidth(width);
        canvas.setHeight(width);
        canvas.setZoom(zoom);
      }
    });
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
      this.canvas?.loadFromJSON(tempCache).then((canvas) => canvas.renderAll());
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
      this.currentHoroData.date.year,
      this.currentHoroData.date.month - 1,
      this.currentHoroData.date.day,
      this.currentHoroData.date.hour,
      this.currentHoroData.date.minute,
      this.currentHoroData.date.second
    );

    date.setFullYear(date.getFullYear() + step.year);
    date.setMonth(date.getMonth() + step.month);
    date.setDate(date.getDate() + step.day);
    date.setHours(date.getHours() + step.hour);
    date.setMinutes(date.getMinutes() + step.minute);
    date.setSeconds(date.getSeconds() + step.second);

    this.currentHoroData.date.year = date.getFullYear();
    this.currentHoroData.date.month = date.getMonth() + 1;
    this.currentHoroData.date.day = date.getDate();
    this.currentHoroData.date.hour = date.getHours();
    this.currentHoroData.date.minute = date.getMinutes();
    this.currentHoroData.date.second = date.getSeconds();

    await this.drawHoroscope(this.currentHoroData);
  }

  async onArchive() {
    if (this.horoData.id !== 0) {
      const alert = await this.alertController.create({
        header: '选择操作',
        message: '您想更新现有记录还是新增记录？',
        buttons: [
          {
            text: '更新记录',
            handler: () => {
              this.updateRecord();
            },
          },
          {
            text: '新增记录',
            handler: () => {
              this.addRecord();
            },
          },
          {
            text: '取消',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {},
          },
        ],
      });

      await alert.present();
    } else {
      this.addRecord();
    }
  }

  async addRecord() {
    const long = degreeToDMS(Math.abs(this.horoData.geo.long));
    const lat = degreeToDMS(Math.abs(this.horoData.geo.lat));

    const nativeRequest: HoroscopeRecordRequest = {
      name: this.horoData.name,
      gender: this.horoData.sex,
      birth_year: this.horoData.date.year,
      birth_month: this.horoData.date.month,
      birth_day: this.horoData.date.day,
      birth_hour: this.horoData.date.hour,
      birth_minute: this.horoData.date.minute,
      birth_second: this.horoData.date.second,
      time_zone_offset: this.horoData.date.tz,
      is_dst: this.horoData.date.st,
      location: {
        name: this.horoData.geo_name,
        is_east: this.horoData.geo.long > 0,
        longitude_degree: long.d,
        longitude_minute: long.m,
        longitude_second: long.s,
        is_north: this.horoData.geo.lat > 0,
        latitude_degree: lat.d,
        latitude_minute: lat.m,
        latitude_second: lat.s,
      },
      description: '',
    };

    try {
      const native = await lastValueFrom(this.api.addNative(nativeRequest));
      this.storage.horoData = { ...this.horoData, id: native.id };
      this.isSaveOpen = true;
    } catch (error: any) {
      this.handleError('新增档案错误', error);
    }
  }

  async updateRecord() {
    const long = degreeToDMS(Math.abs(this.horoData.geo.long));
    const lat = degreeToDMS(Math.abs(this.horoData.geo.lat));

    const locationRequest = {
      name: this.horoData.geo_name,
      is_east: this.horoData.geo.long > 0,
      longitude_degree: long.d,
      longitude_minute: long.m,
      longitude_second: long.s,
      is_north: this.horoData.geo.lat > 0,
      latitude_degree: lat.d,
      latitude_minute: lat.m,
      latitude_second: lat.s,
    };
    let nativeRequest: UpdateHoroscopeRecordRequest;

    try {
      const native = await lastValueFrom(
        this.api.getNativeById(this.horoData.id)
      );

      nativeRequest = {
        name: this.horoData.name === native.name ? null : this.horoData.name,
        gender: this.horoData.sex === native.gender ? null : this.horoData.sex,
        birth_year:
          this.horoData.date.year === native.birth_year
            ? null
            : this.horoData.date.year,
        birth_month:
          this.horoData.date.month === native.birth_month
            ? null
            : this.horoData.date.month,
        birth_day:
          this.horoData.date.day === native.birth_day
            ? null
            : this.horoData.date.day,
        birth_hour:
          this.horoData.date.hour === native.birth_hour
            ? null
            : this.horoData.date.hour,
        birth_minute:
          this.horoData.date.minute === native.birth_minute
            ? null
            : this.horoData.date.minute,
        birth_second:
          this.horoData.date.second === native.birth_second
            ? null
            : this.horoData.date.second,
        time_zone_offset:
          this.horoData.date.tz === native.time_zone_offset
            ? null
            : this.horoData.date.tz,
        is_dst:
          this.horoData.date.st === native.is_dst
            ? null
            : this.horoData.date.st,
        location: isLocationEqual(locationRequest, native.location)
          ? null
          : locationRequest,
        description: null,
      };
    } catch (error: any) {
      this.handleError('获取档案错误', error);
      return;
    }

    if (Object.values(nativeRequest).every((value) => value === null)) {
      this.isSaveOpen = true;
      return;
    }

    try {
      await lastValueFrom(
        this.api.updateNative(this.horoData.id, nativeRequest)
      );
      this.isSaveOpen = true;
      // 重新赋值是不必要的，因为this.horoData已经是最新的
      // this.horoData = this.horoData; // 保存到 localStorage
    } catch (error: any) {
      this.handleError('更新档案错误', error);
    }
  }

  private handleError(message: string, error: any) {
    let msg = error.error.error ? error.error.error : '';

    if (error.error.message) {
      msg = `${msg} ${error.error.message}`;
    }

    if (error.message) {
      msg = `${msg} ${error.message}`;
    }

    this.message = `${message}：${msg}`;
    this.isAlertOpen = true;
  }

  onNote() {
    this.router.navigate([subPath.Note], {
      relativeTo: this.route,
    });
  }

  onDetail() {
    if (this.horoscoData) {
      this.router.navigate([subPath.Detail], {
        relativeTo: this.route,
        state: { data: this.horoscoData },
      });
    }
  }

  get isAuth() {
    return this.authService.isAuth;
  }
}
