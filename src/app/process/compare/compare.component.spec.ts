import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ProcessName } from '../enum/process';
import { CompareComponent } from './compare.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  mockHoroData,
  mockLunarComparisonNativeData,
  mockLunarReturnHoroscopeData,
  mockNativeComparisonLunarData,
  mockNativeComparisonSolarData,
  mockProcessData,
  mockSolarComparisonNativeData,
  mockSolarReturnHoroscopeData,
} from './compare.component.const.spec';

describe('CompareComponent', () => {
  let component: CompareComponent;
  let fixture: ComponentFixture<CompareComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockHoroStorageService: Partial<HoroStorageService>;
  let mockHoroConfigService: Partial<Horoconfig>;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatform: Partial<Platform>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockNavController: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', [
      'compare',
      'solarReturn',
      'lunarReturn',
    ]);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockNavController = jasmine.createSpyObj('NavController', ['back']);

    mockHoroStorageService = {
      horoData: mockHoroData,
      processData: mockProcessData,
    };
    mockHoroConfigService = {
      horoscoImage: { width: 800, height: 600 },
      aspectImage: { width: 800, height: 600 },
    };
    mockPlatform = {
      is: () => true,
    };
    mockActivatedRoute = {
      snapshot: {
        data: {
          process_name: ProcessName.Transit,
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [CompareComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
        FormsModule,
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: HoroStorageService, useValue: mockHoroStorageService },
        { provide: Horoconfig, useValue: mockHoroConfigService },
        { provide: Title, useValue: mockTitleService },
        { provide: Platform, useValue: mockPlatform },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;

    spyOn(component as any, 'createCanvas').and.returnValue({
      dispose: jasmine.createSpy('dispose'),
      toJSON: () => ({}),
      loadFromJSON: (data: any) =>
        Promise.resolve({ renderAll: jasmine.createSpy('renderAll') }),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Lifecycle Hooks', () => {
    let drawHoroscopeSpy: jasmine.Spy;

    beforeEach(() => {
      drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();
    });

    it('should set the title on ngOnInit', () => {
      component.ngOnInit();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('行运');
    });

    it('should initialize canvas on ngAfterViewInit', () => {
      component.ngAfterViewInit();
      expect((component as any).createCanvas).toHaveBeenCalled();
      expect(drawHoroscopeSpy).toHaveBeenCalledWith(ProcessName.Transit);
    });

    it('should dispose canvas on ngOnDestroy', () => {
      component.ngAfterViewInit();
      const canvas = (component as any).canvas;
      const disposeSpy = canvas.dispose;

      component.ngOnDestroy();

      expect(disposeSpy).toHaveBeenCalled();
      expect((component as any).canvas).toBeUndefined();
    });

    it('should complete destroy$ subject on ngOnDestroy', () => {
      // 创建spy来监听unsubscribe和complete方法
      const destroyNextSpy = spyOn((component as any).destroy$ as any, 'next');
      const destroyCompleteSpy = spyOn(
        (component as any).destroy$ as any,
        'complete'
      );

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    });

    it('should clear canvasCache on ngOnDestroy', () => {
      (component as any).canvasCache = { version: 'test', objects: [] };

      component.ngOnDestroy();

      expect((component as any).canvasCache).toBeUndefined();
    });
  });

  describe('drawHoroscope', () => {
    let drawSpy: jasmine.Spy;
    let getHoroscopeComparisonDataSpy: jasmine.Spy;
    const mockHoroscopeComparisonData: any = {
      original_horoscope: {},
      comparison_horoscope: {},
      aspects: [],
    };

    beforeEach(() => {
      drawSpy = spyOn(component as any, 'draw').and.stub();
      getHoroscopeComparisonDataSpy = spyOn(
        component as any,
        'getHoroscopeComparisonData'
      ).and.returnValue(of(mockHoroscopeComparisonData));
      // Manually trigger ngAfterViewInit to initialize canvas for testing
      component.ngAfterViewInit();
      drawSpy.calls.reset();
      getHoroscopeComparisonDataSpy.calls.reset();
    });

    it('should call getHoroscopeComparisonData and draw on success', () => {
      component.horoscopeComparisonData = null;
      component.isDrawing = false;
      component.loading = false;

      (component as any).drawHoroscope(ProcessName.Transit);

      expect(getHoroscopeComparisonDataSpy).toHaveBeenCalledWith(
        ProcessName.Transit
      );
      expect(component.horoscopeComparisonData).toEqual(
        mockHoroscopeComparisonData
      );
      expect(component.isAlertOpen).toBe(false);
      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);
      expect(drawSpy).toHaveBeenCalledWith(mockHoroscopeComparisonData);
    });

    it('should handle API error and show alert', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      getHoroscopeComparisonDataSpy.and.returnValue(
        throwError(() => errorResponse)
      );
      component.horoscopeComparisonData = null;
      component.isDrawing = false;
      component.loading = false;

      (component as any).drawHoroscope(ProcessName.Transit);

      expect(getHoroscopeComparisonDataSpy).toHaveBeenCalledWith(
        ProcessName.Transit
      );
      expect(component.horoscopeComparisonData).toBeNull();
      expect(component.isAlertOpen).toBe(true);
      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);
      expect(component.message).toContain(
        '获取星盘数据失败: Internal Server Error'
      );
      expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should not draw if already drawing or loading', () => {
      component.isDrawing = true;
      (component as any).drawHoroscope(ProcessName.Transit);
      expect(getHoroscopeComparisonDataSpy).not.toHaveBeenCalled();

      component.isDrawing = false;
      component.loading = true;
      (component as any).drawHoroscope(ProcessName.Transit);
      expect(getHoroscopeComparisonDataSpy).not.toHaveBeenCalled();
    });
  });

  describe('getHoroscopeComparisonData', () => {
    let getTransitDataSpy: jasmine.Spy;
    let getReturnComparDataSpy: jasmine.Spy;

    beforeEach(() => {
      getTransitDataSpy = spyOn(component as any, 'getTransitData').and.stub();
      getReturnComparDataSpy = spyOn(
        component as any,
        'getReturnComparData'
      ).and.stub();
    });

    it('should call getTransitData for Transit process', () => {
      (component as any).getHoroscopeComparisonData(ProcessName.Transit);
      expect(getTransitDataSpy).toHaveBeenCalled();
      expect(getReturnComparDataSpy).not.toHaveBeenCalled();
    });

    it('should call getReturnComparData for SolarcomparNative process', () => {
      (component as any).getHoroscopeComparisonData(
        ProcessName.SolarcomparNative
      );
      expect(getReturnComparDataSpy).toHaveBeenCalledWith(0); // ComparisonType.SolarComparNative
      expect(getTransitDataSpy).not.toHaveBeenCalled();
    });

    it('should call getReturnComparData for NativecomparSolar process', () => {
      (component as any).getHoroscopeComparisonData(
        ProcessName.NativecomparSolar
      );
      expect(getReturnComparDataSpy).toHaveBeenCalledWith(1); // ComparisonType.NativeComparSolar
      expect(getTransitDataSpy).not.toHaveBeenCalled();
    });

    it('should call getReturnComparData for LunarcomparNative process', () => {
      (component as any).getHoroscopeComparisonData(
        ProcessName.LunarcomparNative
      );
      expect(getReturnComparDataSpy).toHaveBeenCalledWith(2); // ComparisonType.LunarComparNative
      expect(getTransitDataSpy).not.toHaveBeenCalled();
    });

    it('should call getReturnComparData for NativecomparLunar process', () => {
      (component as any).getHoroscopeComparisonData(
        ProcessName.NativecomparLunar
      );
      expect(getReturnComparDataSpy).toHaveBeenCalledWith(3); // ComparisonType.NativeComparLunar
      expect(getTransitDataSpy).not.toHaveBeenCalled();
    });

    it('should throw an error for unknown process name', () => {
      const unknownProcessName = 'UnknownProcess' as ProcessName;
      expect(() =>
        (component as any).getHoroscopeComparisonData(unknownProcessName)
      ).toThrowError(`未知的推运名称: ${unknownProcessName}`);
    });
  });

  describe('getTransitData', () => {
    const mockHoroscopeComparisonData: any = {
      original_horoscope: {},
      comparison_horoscope: {},
      aspects: [],
    };

    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
      mockApiService.compare.and.returnValue(of(mockHoroscopeComparisonData));
    });

    it('should call api.compare with correct request data', () => {
      const result = (component as any).getTransitData();

      expect(mockApiService.compare).toHaveBeenCalledWith({
        original_date: mockHoroData.date,
        comparison_date: mockProcessData.date,
        original_geo: mockHoroData.geo,
        comparison_geo: mockHoroData.geo,
        house: mockHoroData.house,
      });

      result.subscribe((data: any) => {
        expect(data).toEqual(mockHoroscopeComparisonData);
      });
    });

    it('should set returnData to null', () => {
      component.returnData = {} as any; // 设置为非空值

      (component as any).getTransitData();

      expect(component.returnData).toBeNull();
    });
  });

  describe('getReturnComparData', () => {
    let getSolarReturnDataSpy: jasmine.Spy;
    let getLunarReturnDataSpy: jasmine.Spy;
    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);

      getSolarReturnDataSpy = spyOn(component as any, 'getSolarReturnData');
      getLunarReturnDataSpy = spyOn(component as any, 'getLunarReturnData');
    });

    it('should call getSolarReturnData and api.compare for SolarComparNative type', () => {
      getSolarReturnDataSpy.and.returnValue(of(mockSolarReturnHoroscopeData));
      mockApiService.compare.and.returnValue(of(mockSolarComparisonNativeData));

      const result = (component as any).getReturnComparData(0); // ComparisonType.SolarComparNative

      // 手动订阅以触发执行
      result.subscribe((data: any) => {
        expect(data).toEqual(mockSolarComparisonNativeData);
      });

      // 验证调用了getSolarReturnData
      expect(getSolarReturnDataSpy).toHaveBeenCalled();
      expect(getLunarReturnDataSpy).not.toHaveBeenCalled();

      // 验证调用了api.compare并传入正确的参数
      expect(mockApiService.compare).toHaveBeenCalledWith({
        original_date: mockHoroData.date,
        comparison_date: {
          ...mockSolarReturnHoroscopeData.return_date,
          st: false,
        },
        original_geo: mockHoroData.geo,
        comparison_geo: mockProcessData.geo,
        house: mockHoroData.house,
      });

      // 验证returnData被正确设置
      expect(component.returnData).toEqual(mockSolarReturnHoroscopeData);
    });

    it('should call getSolarReturnData and api.compare for NativeComparSolar type', () => {
      getSolarReturnDataSpy.and.returnValue(of(mockSolarReturnHoroscopeData));
      mockApiService.compare.and.returnValue(of(mockNativeComparisonSolarData));

      const result = (component as any).getReturnComparData(1); // ComparisonType.NativeComparSolar

      // 手动订阅以触发执行
      result.subscribe((data: any) => {
        expect(data).toEqual(mockNativeComparisonSolarData);
      });

      // 验证调用了getSolarReturnData
      expect(getSolarReturnDataSpy).toHaveBeenCalled();
      expect(getLunarReturnDataSpy).not.toHaveBeenCalled();

      // 验证调用了api.compare并传入正确的参数
      expect(mockApiService.compare).toHaveBeenCalledWith({
        original_date: {
          ...mockSolarReturnHoroscopeData.return_date,
          st: false,
        },
        comparison_date: mockHoroData.date,
        original_geo: mockProcessData.geo,
        comparison_geo: mockHoroData.geo,
        house: mockHoroData.house,
      });

      // 验证returnData被正确设置
      expect(component.returnData).toEqual(mockSolarReturnHoroscopeData);
    });

    it('should call getLunarReturnData and api.compare for LunarComparNative type', () => {
      getLunarReturnDataSpy.and.returnValue(of(mockLunarReturnHoroscopeData));
      mockApiService.compare.and.returnValue(of(mockLunarComparisonNativeData));

      const result = (component as any).getReturnComparData(2); // ComparisonType.LunarComparNative

      // 手动订阅以触发执行
      result.subscribe((data: any) => {
        expect(data).toEqual(mockLunarComparisonNativeData);
      });

      // 验证调用了getLunarReturnData
      expect(getSolarReturnDataSpy).not.toHaveBeenCalled();
      expect(getLunarReturnDataSpy).toHaveBeenCalled();

      // 验证调用了api.compare并传入正确的参数
      expect(mockApiService.compare).toHaveBeenCalledWith({
        original_date: mockHoroData.date,
        comparison_date: {
          ...mockLunarReturnHoroscopeData.return_date,
          st: false,
        },
        original_geo: mockHoroData.geo,
        comparison_geo: mockProcessData.geo,
        house: mockHoroData.house,
      });

      // 验证returnData被正确设置
      expect(component.returnData).toEqual(mockLunarReturnHoroscopeData);
    });

    it('should call getLunarReturnData and api.compare for NativeComparLunar type', () => {
      getLunarReturnDataSpy.and.returnValue(of(mockLunarReturnHoroscopeData));
      mockApiService.compare.and.returnValue(of(mockNativeComparisonLunarData));

      const result = (component as any).getReturnComparData(3); // ComparisonType.NativeComparLunar

      // 手动订阅以触发执行
      result.subscribe((data: any) => {
        expect(data).toEqual(mockNativeComparisonLunarData);
      });

      // 验证调用了getLunarReturnData
      expect(getSolarReturnDataSpy).not.toHaveBeenCalled();
      expect(getLunarReturnDataSpy).toHaveBeenCalled();

      // 验证调用了api.compare并传入正确的参数
      expect(mockApiService.compare).toHaveBeenCalledWith({
        original_date: {
          ...mockLunarReturnHoroscopeData.return_date,
          st: false,
        },
        comparison_date: mockHoroData.date,
        original_geo: mockProcessData.geo,
        comparison_geo: mockHoroData.geo,
        house: mockHoroData.house,
      });

      // 验证returnData被正确设置
      expect(component.returnData).toEqual(mockLunarReturnHoroscopeData);
    });
  });

  describe('getSolarReturnData', () => {
    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
    });

    it('should call api.solarReturn with correct request data', () => {
      mockApiService.solarReturn.and.returnValue(
        of(mockSolarReturnHoroscopeData)
      );

      const result = (component as any).getSolarReturnData();

      result.subscribe((data: any) => {
        expect(data).toEqual(mockSolarReturnHoroscopeData);
      });

      expect(mockApiService.solarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: mockProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    });

    it('should use currentProcessData.date for process_date', () => {
      mockApiService.solarReturn.and.returnValue(
        of(mockSolarReturnHoroscopeData)
      );

      // 修改currentProcessData的日期
      component.currentProcessData.date = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
        st: false,
      };

      const result = (component as any).getSolarReturnData();

      result.subscribe((data: any) => {
        expect(data).toEqual(mockSolarReturnHoroscopeData);
      });

      expect(mockApiService.solarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: {
          year: 2024,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    });
  });

  describe('getLunarReturnData', () => {
    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
      component.currentProcessData.isSolarReturn = false;
    });

    it('should call api.lunarReturn with correct request data when isSolarReturn is false', () => {
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData)
      );

      const result = (component as any).getLunarReturnData();

      result.subscribe((data: any) => {
        expect(data).toEqual(mockLunarReturnHoroscopeData);
      });

      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: mockProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    });

    it('should use currentProcessData.date for process_date', () => {
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData)
      );

      // 修改currentProcessData的日期
      component.currentProcessData.date = {
        year: 2024,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
        st: false,
      };

      const result = (component as any).getLunarReturnData();

      result.subscribe((data: any) => {
        expect(data).toEqual(mockLunarReturnHoroscopeData);
      });

      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: {
          year: 2024,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    });

    it('should calculate lunar return based on solar return data when isSolarReturn is true', () => {
      // 设置isSolarReturn为true
      (component as any).processData = {
        ...(component as any).processData,
        isSolarReturn: true,
      };
      component.currentProcessData = {
        ...component.currentProcessData,
        isSolarReturn: false, // currentProcessData.isSolarReturn不影响返照盘的计算
      };

      // 设置spy
      const getSolarReturnDataSpy = spyOn(
        component as any,
        'getSolarReturnData'
      ).and.returnValue(of(mockSolarReturnHoroscopeData));
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData)
      );

      const result = (component as any).getLunarReturnData();

      result.subscribe((data: any) => {
        expect(data).toEqual(mockLunarReturnHoroscopeData);
      });

      // 验证调用了getSolarReturnData
      expect(getSolarReturnDataSpy).toHaveBeenCalled();

      // 验证使用了solarReturnData中的return_date作为native_date
      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: {
          year: mockSolarReturnHoroscopeData.return_date.year,
          month: mockSolarReturnHoroscopeData.return_date.month,
          day: mockSolarReturnHoroscopeData.return_date.day,
          hour: mockSolarReturnHoroscopeData.return_date.hour,
          minute: mockSolarReturnHoroscopeData.return_date.minute,
          second: mockSolarReturnHoroscopeData.return_date.second,
          tz: mockSolarReturnHoroscopeData.return_date.tz,
          st: false,
        },
        process_date: mockProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    });
  });
});
