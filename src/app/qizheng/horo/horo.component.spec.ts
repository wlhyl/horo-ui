import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, Platform, NavController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import {
  DateRequest,
  GeoRequest,
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import { Horoscope } from 'src/app/type/interface/response-qizheng';
import { HoroComponent } from './horo.component';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import { ProcessName } from 'src/app/process/enum/process';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { RouterModule } from '@angular/router';

import {
  HouseName,
  LunarMansionsName,
  PlanetName,
  PlanetSpeedState,
} from 'src/app/type/enum/qizheng';
import { fakeAsync, flush, tick } from '@angular/core/testing';

describe('HoroComponent', () => {
  let component: HoroComponent;
  let fixture: ComponentFixture<HoroComponent>;

  // Mock Services
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockHoroStorageService: Partial<HoroStorageService>;
  let mockQizhengConfigService: Partial<QizhengConfigService>;
  let mockTipService: jasmine.SpyObj<TipService>;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatform: Partial<Platform>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockNavController: jasmine.SpyObj<NavController>;

  // Mock Data
  const mockDate: DateRequest = {
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
    st: false,
  };

  const mockGeo: GeoRequest = {
    long: 121.47,
    lat: 31.23,
  };

  const mockHoroData: DeepReadonly<HoroRequest> = {
    id: 1,
    name: 'Test',
    sex: true,
    date: mockDate,
    geo: mockGeo,
    geo_name: 'Shanghai',
    house: 'Alcabitus',
  };

  const mockProcessData: DeepReadonly<ProcessRequest> = {
    date: { ...mockDate, year: 2024, month: 7, day: 25 },
    geo: mockGeo,
    geo_name: 'Shanghai',
    process_name: ProcessName.Transit,
    isSolarReturn: false,
  };

  const mockHoroscopeData: Horoscope = {
    native_date: { ...mockDate },
    process_date: { ...mockProcessData.date },
    geo: { ...mockGeo },
    native_planets: [
      {
        name: PlanetName.日,
        long: 180,
        speed: 1.1,
        xiu: LunarMansionsName.角,
        xiu_degree: 2.1,
        speed_state: PlanetSpeedState.疾,
        is_stationary: false,
      },
    ],
    process_planets: [
      {
        name: PlanetName.月,
        long: 80,
        speed: 0,
        xiu: LunarMansionsName.室,
        xiu_degree: 3.4,
        speed_state: PlanetSpeedState.均,
        is_stationary: false,
      },
    ],
    distance_star_long: [
      {
        lunar_mansions: LunarMansionsName.角,
        long: 4,
      },
    ],
    asc_house: {
      asc_long: 35,
      xiu: LunarMansionsName.井,
      xiu_degree: 6,
    },
    houses: [
      {
        name: HouseName.命,
        long: 60,
        xiu: LunarMansionsName.张,
        xiu_degree: 3.4,
      },
    ],
    native_lunar_calendar: {
      is_lean_year: false,
      lunar_year: '1999',
      lunar_month: '十一月',
      lunar_day: '廿五',
      lunar_year_gan_zhi: '己卯',
      lunar_month_gan_zhi: '丁丑',
      lunar_day_gan_zhi: '戊子',
      time_gan_zhi: '戊午',
      solar_term_first: {
        name: '大雪',
        year: 1999,
        month: 12,
        day: 7,
        hour: 0,
        minute: 0,
        second: 0,
      },
      solar_term_second: {
        name: '冬至',
        year: 1999,
        month: 12,
        day: 22,
        hour: 0,
        minute: 0,
        second: 0,
      },
    },
    process_lunar_calendar: {
      is_lean_year: false,
      lunar_year: '2024',
      lunar_month: '六月',
      lunar_day: '二十',
      lunar_year_gan_zhi: '甲辰',
      lunar_month_gan_zhi: '辛未',
      lunar_day_gan_zhi: '癸巳',
      time_gan_zhi: '壬子',
      solar_term_first: {
        name: '小暑',
        year: 2024,
        month: 7,
        day: 6,
        hour: 0,
        minute: 0,
        second: 0,
      },
      solar_term_second: {
        name: '大暑',
        year: 2024,
        month: 7,
        day: 22,
        hour: 0,
        minute: 0,
        second: 0,
      },
    },
    bazi: ['庚辰', '己丑', '戊子', '戊午'],
    dong_wei: {
      long_of_per_year: [10],
      long: 30,
      xiu: LunarMansionsName.角,
      xiu_degree: 2,
    },
    native_transformed_stars: [
      {
        star: '火',
        transformed_star: '天禄',
        transformed_star_house: '命宫',
        transformed_star_describe: '天禄星',
        ten_gods: '正官',
      },
    ],
    process_transformed_stars: [
      {
        star: '月',
        transformed_star: '天权',
        transformed_star_house: '官禄',
        transformed_star_describe: '天权星',
        ten_gods: '比肩',
      },
    ],
  };

  beforeEach(waitForAsync(() => {
    // Create spies for the services
    mockApiService = jasmine.createSpyObj('ApiService', ['qizheng']);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockTipService = jasmine.createSpyObj('TipService', ['show']);
    mockNavController = jasmine.createSpyObj('NavController', ['back']);

    // Mock service implementations
    mockHoroStorageService = {
      horoData: mockHoroData,
      processData: mockProcessData,
    };
    mockQizhengConfigService = {
      HoroscoImage: { width: 800, height: 600 },
    };
    mockPlatform = {
      is: () => true, // Mock platform check
    };
    mockActivatedRoute = {};

    TestBed.configureTestingModule({
      declarations: [HoroComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: HoroStorageService, useValue: mockHoroStorageService },
        { provide: QizhengConfigService, useValue: mockQizhengConfigService },
        { provide: TipService, useValue: mockTipService },
        { provide: Title, useValue: mockTitleService },
        { provide: Platform, useValue: mockPlatform },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HoroComponent);
    component = fixture.componentInstance;

    // 监视 createCanvas 方法并返回一个模拟的 canvas 对象
    spyOn(component as any, 'createCanvas').and.returnValue({
      dispose: jasmine.createSpy('dispose'),
    });

    // 监视 draw 方法以避免实际执行
    spyOn(component as any, 'draw').and.callFake(() => {});
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Lifecycle Hooks', () => {
    it('should set the title on ngOnInit', () => {
      component.ngOnInit();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('七政四余');
    });

    it('should initialize canvas and draw horoscope on ngAfterViewInit', () => {
      const drawSpy = spyOn(
        component as any,
        'drawHoroscope'
      ).and.callThrough();
      mockApiService.qizheng.and.returnValue(of(mockHoroscopeData));

      component.ngAfterViewInit();

      expect(component['canvas']).toBeDefined();
      expect(drawSpy).toHaveBeenCalled();
    });

    it('should dispose canvas and complete subscriptions on ngOnDestroy', () => {
      // 确保canvas已创建
      mockApiService.qizheng.and.returnValue(of(mockHoroscopeData));
      component.ngAfterViewInit();
      const canvas = (component as any).canvas;

      // 由于createCanvas已经被spy监视并返回了带spy的dispose方法，我们直接获取它
      const disposeSpy = canvas.dispose;

      component.ngOnDestroy();

      expect(disposeSpy).toHaveBeenCalled();
      expect(component['canvas']).toBeUndefined();
    });
  });

  describe('drawHoroscope', () => {
    beforeEach(() => {
      mockApiService.qizheng.and.returnValue(of(mockHoroscopeData));
      // 由于 createCanvas 已被监视，ngAfterViewInit 不会创建新的 canvas
      // 我们需要手动触发它以进行测试
      component.ngAfterViewInit();
      ((component as any).draw as jasmine.Spy).calls.reset();
      mockApiService.qizheng.calls.reset();
    });

    it('should call api.qizheng and draw on success', () => {
      mockApiService.qizheng.and.returnValue(of(mockHoroscopeData));
      const drawSpy = (component as any).draw;
      component.horoscopeData = null;
      // 重置状态标志以确保drawHoroscope能够正常执行
      component.isDrawing = false;
      component.loading = false;

      (component as any).drawHoroscope();

      expect(mockApiService.qizheng).toHaveBeenCalled();
      expect(component.horoscopeData).toEqual(mockHoroscopeData as any);

      expect(component.isAlertOpen).toBe(false);
      expect(component.isDrawing).toBe(false);
      expect(component.loading).toBe(false);
      expect(drawSpy).toHaveBeenCalled();
    });

    it('should handle API error and show alert', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      mockApiService.qizheng.and.returnValue(throwError(() => errorResponse));
      const drawSpy = (component as any).draw;
      component.horoscopeData = null;
      // 重置状态标志以确保drawHoroscope能够正常执行
      component.isDrawing = false;
      component.loading = false;

      (component as any).drawHoroscope();

      expect(mockApiService.qizheng).toHaveBeenCalled();
      expect(component.horoscopeData).toBeNull();
      expect(drawSpy).not.toHaveBeenCalled();
      expect(component.isAlertOpen).toBe(true);
      expect(component.isDrawing).toBe(false);
      expect(component.loading).toBe(false);
      expect(component.message).toContain('API Error');
    });

    it('should not draw if already drawing or loading', () => {
      // 设置初始状态
      component.isDrawing = true;
      component.loading = false;
      (component as any).drawHoroscope();
      expect(mockApiService.qizheng).not.toHaveBeenCalled();

      component.isDrawing = false;
      component.loading = true;
      (component as any).drawHoroscope();
      expect(mockApiService.qizheng).not.toHaveBeenCalled();
    });
  });

  describe('applyStepChange', () => {
    beforeEach(() => {
      mockApiService.qizheng.and.returnValue(of(mockHoroscopeData));
    });

    it('should update currentProcessData date correctly', () => {
      const drawHoroscopeSpy = spyOn(
        component as any,
        'drawHoroscope'
      ).and.callThrough();

      component.currentProcessData.date = {
        year: 2023,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
        st: false,
      };

      const step = { year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1 };
      (component as any).applyStepChange(step);

      // 注意月的索引从0开始，所第二个参数1是2月
      const expectedDate = new Date(2024, 1, 2, 1, 1, 1);
      expect(component.currentProcessData.date.year).toBe(
        expectedDate.getFullYear()
      );
      expect(component.currentProcessData.date.month).toBe(
        expectedDate.getMonth() + 1
      );
      expect(component.currentProcessData.date.day).toBe(
        expectedDate.getDate()
      );
      expect(component.currentProcessData.date.hour).toBe(
        expectedDate.getHours()
      );
      expect(component.currentProcessData.date.minute).toBe(
        expectedDate.getMinutes()
      );
      expect(component.currentProcessData.date.second).toBe(
        expectedDate.getSeconds()
      );
      expect(drawHoroscopeSpy).toHaveBeenCalled();
    });

    it('should not change horoData and processData', () => {
      // 保存原始数据的深拷贝
      const originalHoroData = JSON.parse(
        JSON.stringify((component as any).horoData)
      );
      const originalProcessData = JSON.parse(
        JSON.stringify((component as any).processData)
      );

      const step = { year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1 };
      (component as any).applyStepChange(step);

      // 验证 horoData 和 processData 没有被修改
      expect((component as any).horoData).toEqual(originalHoroData);
      expect((component as any).processData).toEqual(originalProcessData);
    });
  });

  describe('changeStep with debounce', () => {
    it('should only call applyStepChange once after rapid calls due to debounce', fakeAsync(() => {
      // 确保由 detectChanges 触发的 ngAfterViewInit 中的 drawHoroscope 不调用实际的方法
      spyOn(component as any, 'drawHoroscope').and.stub();

      // 在 ngOnInit 触发前设置 spy，确保订阅捕获的是 spy
      const applyStepChangeSpy = spyOn(
        component as any,
        'applyStepChange'
      ).and.stub();

      // 触发 ngOnInit 以设置订阅, 同时会触发 ngAfterViewInit
      fixture.detectChanges();

      // 重置 spy，因为 detectChanges 可能会通过 applyStepChange 间接触发 drawHoroscope
      applyStepChangeSpy.calls.reset();

      const step = { year: 0, month: 0, day: 1, hour: 0, minute: 0, second: 0 };

      // 快速连续调用
      component.changeStep(step);
      component.changeStep(step);
      component.changeStep(step);

      // 验证在防抖时间内没有被调用
      tick(299); // 在防抖时间到达前
      expect(applyStepChangeSpy).not.toHaveBeenCalled();

      // 等待防抖时间结束
      tick(1); // 到达 300ms
      expect(applyStepChangeSpy).toHaveBeenCalledTimes(1);

      // 清理所有待处理的 timers
      flush();
    }));
  });

  describe('onDetail', () => {
    it('should navigate to detail page with data if horoscopeData exists', () => {
      component.horoscopeData = mockHoroscopeData;
      component.onDetail();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['detail'], {
        relativeTo: mockActivatedRoute,
        state: { data: mockHoroscopeData },
      });
    });

    it('should not navigate if horoscopeData is null', () => {
      component.horoscopeData = null;
      component.onDetail();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
