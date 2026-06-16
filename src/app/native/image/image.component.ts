import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Horoscope } from 'src/app/type/interface/response-data';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ApiService } from 'src/app/services/api/api.service';
import { finalize, Subject, debounceTime, takeUntil } from 'rxjs';
import { Platform, AlertController } from '@ionic/angular';
import { StaticCanvas } from 'fabric';
import { drawAspect, drawHorosco } from 'src/app/utils/image/horo';
import { Title } from '@angular/platform-browser';
import { degreeToDMS } from 'src/app/utils/horo-math/horo-math';
import { AuthService } from 'src/app/services/auth/auth.service'; // 导入 AuthService
import { Router, ActivatedRoute } from '@angular/router'; // 导入 Router 和 ActivatedRoute
import {
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from 'src/app/type/interface/horo-admin/horoscope-record';
import { Path as subPath, Mode } from '../enum';
import { Path } from 'src/app/type/enum/path';
import { isLocationEqual } from 'src/app/utils/location-record/location-record';
import { getApiErrorMessage } from 'src/app/utils/api-error/api-error';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  informationCircleOutline,
  createOutline,
  archiveOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { zoomImage } from 'src/app/utils/image/zoom-image';

@Component({
  selector: 'teanote-image',
  templateUrl: 'image.component.html',
  styleUrls: ['image.component.scss'],
  standalone: false,
})
export class ImageComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() inputHoroData?: HoroRequest;
  @Input() inputMode?: Mode;
  @Input() canvasId: string = 'canvas';
  @Input() embedded: boolean = false;

  mode!: string;
  private horoData!: DeepReadonly<HoroRequest>;
  currentHoroData!: HoroRequest;

  // 是否完成初始化（embedded 模式下输入缺失时为 false，阻止模板渲染未赋值的 ! 变量）
  initialized = false;

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
  private destroy$ = new Subject<void>();
  private changeStepSubject = new Subject<{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  }>();

  title!: string;

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
    private alertController: AlertController,
  ) {
    addIcons({ informationCircleOutline, createOutline, archiveOutline });
  }

  ngOnInit() {
    // 嵌入模式下使用 @Input 数据覆盖构造函数中的初始化
    if (this.embedded) {
      if (this.inputMode) {
        this.mode = this.inputMode;
        this.title = this.mode === Mode.Event ? '天象盘' : '本命星盘';
      } else {
        this.message = '嵌入模式缺少输入参数：inputMode';
        this.isAlertOpen = true;
        return;
      }
      if (this.inputHoroData) {
        this.horoData = this.inputHoroData;
        this.currentHoroData = structuredClone(this.inputHoroData);
      } else {
        this.message = '嵌入模式缺少输入参数：inputHoroData';
        this.isAlertOpen = true;
        return;
      }
    } else {
      // 嵌入式模式下，会初始化为本命星盘
      this.mode = this.router.url.startsWith('/' + Path.Event)
        ? Mode.Event
        : Mode.Native;
      this.title = this.mode === Mode.Event ? '天象盘' : '本命星盘';
      this.horoData =
        this.mode === Mode.Event
          ? this.storage.eventData
          : this.storage.horoData;
      this.currentHoroData = structuredClone(this.horoData);
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
      this.currentHoroData = structuredClone(this.inputHoroData);
      needRedraw = true;
    }

    if (changes['inputMode'] && this.inputMode) {
      this.mode = this.inputMode;
      this.title = this.mode === Mode.Event ? '天象盘' : '本命星盘';
    }

    if (needRedraw && this.canvas) {
      this.drawHoroscope(this.currentHoroData);
    }
  }

  ngAfterViewInit(): void {
    // 为兼容单元测试，使用这样的冗余函数
    this.canvas = this.createCanvas();
    // 延迟到下一宏任务，避免 drawHoroscope 同步设置 loading=true
    // 导致 ExpressionChangedAfterItHasBeenCheckedError (NG0100)
    setTimeout(() => this.drawHoroscope(this.currentHoroData));
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
  private createCanvas(): StaticCanvas {
    return new StaticCanvas(this.canvasId);
  }

  private drawHoroscope(horoData: DeepReadonly<HoroRequest>) {
    if (this.isDrawing || this.loading) return; // 如果正在绘制或加载则返回

    this.isDrawing = true; // 开始绘制
    this.loading = true;
    this.canvasCache = undefined;

    this.api
      .getNativeHoroscope(horoData)
      .pipe(
        finalize(() => {
          this.isDrawing = false;
          this.loading = false;
        }),
      )
      .subscribe({
        next: (data) => {
          this.horoscoData = data;
          this.isAlertOpen = false;
          this.draw();
        },
        error: (error) => {
          // 修复错误：Cannot read properties of undefined (reading 'message')
          // 当error.error为undefined时，避免访问其message属性
          this.message =
            (error.message || '未知错误') +
            ' ' +
            (error.error?.message || error.error || '未知错误详情');
          this.isAlertOpen = true;
        },
      });
  }

  // 绘制星盘和相位
  private draw() {
    if (this.horoscoData === null) return;

    if (this.isAspect) {
      drawAspect(this.horoscoData.aspects, this.canvas!, this.config, {
        width: this.config.aspectImage.width,
        height: this.config.aspectImage.height,
      });
    } else {
      drawHorosco(this.horoscoData, this.canvas!, this.config, {
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
      this.draw();
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
      this.currentHoroData.date.year,
      this.currentHoroData.date.month - 1,
      this.currentHoroData.date.day,
      this.currentHoroData.date.hour,
      this.currentHoroData.date.minute,
      this.currentHoroData.date.second,
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

    this.drawHoroscope(this.currentHoroData);
  }

  async onArchive() {
    if (this.currentHoroData.id !== 0) {
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

  addRecord() {
    const long = degreeToDMS(Math.abs(this.currentHoroData.geo.long));
    const lat = degreeToDMS(Math.abs(this.currentHoroData.geo.lat));

    const nativeRequest: HoroscopeRecordRequest = {
      name: this.currentHoroData.name,
      gender: this.currentHoroData.sex,
      birth_year: this.currentHoroData.date.year,
      birth_month: this.currentHoroData.date.month,
      birth_day: this.currentHoroData.date.day,
      birth_hour: this.currentHoroData.date.hour,
      birth_minute: this.currentHoroData.date.minute,
      birth_second: this.currentHoroData.date.second,
      time_zone_offset: this.currentHoroData.date.tz,
      is_dst: this.currentHoroData.date.st,
      location: {
        name: this.currentHoroData.geo_name,
        is_east: this.currentHoroData.geo.long >= 0,
        longitude_degree: long.d,
        longitude_minute: long.m,
        longitude_second: long.s,
        is_north: this.currentHoroData.geo.lat >= 0,
        latitude_degree: lat.d,
        latitude_minute: lat.m,
        latitude_second: lat.s,
      },
      description: '',
      lock: false,
    };

    this.api.addNative(nativeRequest).subscribe({
      next: (native) => {
        const updatedData = { ...this.currentHoroData, id: native.id };
        if (this.mode === Mode.Event) {
          this.storage.eventData = updatedData;
        } else {
          this.storage.horoData = updatedData;
        }
        this.horoData =
          this.mode === Mode.Event
            ? this.storage.eventData
            : this.storage.horoData;
        this.currentHoroData = structuredClone(this.horoData);
        this.isSaveOpen = true;
      },
      error: (error) => {
        this.message = `新增档案错误：${getApiErrorMessage(error)}`;
        this.isAlertOpen = true;
      },
    });
  }

  updateRecord() {
    const long = degreeToDMS(Math.abs(this.currentHoroData.geo.long));
    const lat = degreeToDMS(Math.abs(this.currentHoroData.geo.lat));

    const locationRequest = {
      name: this.currentHoroData.geo_name,
      is_east: this.currentHoroData.geo.long > 0,
      longitude_degree: long.d,
      longitude_minute: long.m,
      longitude_second: long.s,
      is_north: this.currentHoroData.geo.lat > 0,
      latitude_degree: lat.d,
      latitude_minute: lat.m,
      latitude_second: lat.s,
    };

    this.api.getNativeById(this.currentHoroData.id).subscribe({
      next: (native) => {
        if (native.lock) {
          this.message = '记录已锁定，无法修改';
          this.isAlertOpen = true;
          return;
        }
        const nativeRequest: UpdateHoroscopeRecordRequest = {
          name:
            this.currentHoroData.name === native.name
              ? null
              : this.currentHoroData.name,
          gender:
            this.currentHoroData.sex === native.gender
              ? null
              : this.currentHoroData.sex,
          birth_year:
            this.currentHoroData.date.year === native.birth_year
              ? null
              : this.currentHoroData.date.year,
          birth_month:
            this.currentHoroData.date.month === native.birth_month
              ? null
              : this.currentHoroData.date.month,
          birth_day:
            this.currentHoroData.date.day === native.birth_day
              ? null
              : this.currentHoroData.date.day,
          birth_hour:
            this.currentHoroData.date.hour === native.birth_hour
              ? null
              : this.currentHoroData.date.hour,
          birth_minute:
            this.currentHoroData.date.minute === native.birth_minute
              ? null
              : this.currentHoroData.date.minute,
          birth_second:
            this.currentHoroData.date.second === native.birth_second
              ? null
              : this.currentHoroData.date.second,
          time_zone_offset:
            this.currentHoroData.date.tz === native.time_zone_offset
              ? null
              : this.currentHoroData.date.tz,
          is_dst:
            this.currentHoroData.date.st === native.is_dst
              ? null
              : this.currentHoroData.date.st,
          location: isLocationEqual(locationRequest, native.location)
            ? null
            : locationRequest,
          description: null,
          lock: null,
        };

        if (Object.values(nativeRequest).every((value) => value === null)) {
          this.isSaveOpen = true;
          return;
        }

        this.api
          .updateNative(this.currentHoroData.id, nativeRequest)
          .subscribe({
            next: () => {
              if (this.mode === Mode.Event) {
                this.storage.eventData = this.currentHoroData;
              } else {
                this.storage.horoData = this.currentHoroData;
              }
              this.horoData =
                this.mode === Mode.Event
                  ? this.storage.eventData
                  : this.storage.horoData;
              this.isSaveOpen = true;
            },
            error: (error) => {
              this.message = `更新档案错误：${getApiErrorMessage(error)}`;
              this.isAlertOpen = true;
            },
          });
      },
      error: (error) => {
        this.message = `获取档案错误：${getApiErrorMessage(error)}`;
        this.isAlertOpen = true;
      },
    });
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
