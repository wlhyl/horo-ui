import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonicModule,
  Platform,
  AlertController,
  NavController,
} from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { ImageComponent } from './image.component';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  mockHoroData,
  mockCurrentHoroData,
  mockHoroscopeData,
} from './image.component.const.spec';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  // Mock Services
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockHoroStorageService: Partial<HoroStorageService>;
  let mockHoroConfigService: Partial<Horoconfig>;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatform: Partial<Platform>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockNavController: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    // Create spies for the services
    mockApiService = jasmine.createSpyObj('ApiService', [
      'getNativeHoroscope',
      'addNative',
      'getNativeById',
      'updateNative',
    ]);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuth']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockNavController = jasmine.createSpyObj('NavController', ['back']);

    // Mock service implementations
    mockHoroStorageService = {
      horoData: mockHoroData,
    };
    mockHoroConfigService = {
      HoroscoImage: { width: 800, height: 600 },
      aspectImage: { width: 800, height: 600 },
    };
    mockPlatform = {
      is: () => true, // Mock platform check
    };
    mockActivatedRoute = {};
    // 使用 spy 对象的属性来设置 isAuth 值
    Object.defineProperty(mockAuthService, 'isAuth', {
      value: true,
      writable: true,
    });

    await TestBed.configureTestingModule({
      declarations: [ImageComponent],
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
        { provide: AuthService, useValue: mockAuthService },
        { provide: AlertController, useValue: mockAlertController },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;

    // 监视 createCanvas 方法并返回一个模拟的 canvas 对象
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
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('本命星盘');
    });

    it('should initialize canvas on ngAfterViewInit', () => {
      component.ngAfterViewInit();
      expect(component['canvas']).toBeDefined();
      expect(drawHoroscopeSpy).toHaveBeenCalledWith(mockHoroData);
    });

    it('should dispose canvas and complete subscriptions on ngOnDestroy', () => {
      component.ngAfterViewInit();
      const canvas = (component as any).canvas;
      const disposeSpy = canvas.dispose;
      const destroySpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(disposeSpy).toHaveBeenCalled();
      expect(component['canvas']).toBeUndefined();
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('drawHoroscope', () => {
    let drawSpy: jasmine.Spy;

    beforeEach(() => {
      mockApiService.getNativeHoroscope.and.returnValue(of(mockHoroscopeData));
      component.currentHoroData = mockCurrentHoroData;
      // 监视 draw 方法以避免实际执行
      drawSpy = spyOn(component as any, 'draw').and.callFake(() => {});

      // 由于 createCanvas 已被监视，ngAfterViewInit 不会创建新的 canvas
      // 我们需要手动触发它以进行测试
      component.ngAfterViewInit();
      drawSpy.calls.reset();
      mockApiService.getNativeHoroscope.calls.reset();
    });

    it('should call api.getNativeHoroscope and draw on success', async () => {
      // mockApiService.getNativeHoroscope.and.returnValue(of(mockHoroscopeData));
      component.horoscoData = null;
      component.isDrawing = false;
      component.loading = false;

      component['drawHoroscope'](mockCurrentHoroData);

      expect(mockApiService.getNativeHoroscope).toHaveBeenCalledWith(
        mockCurrentHoroData
      );
      expect(component.horoscoData).toEqual(mockHoroscopeData as any);
      expect(component.isAlertOpen).toBe(false);
      expect(component.isDrawing).toBe(false);
      expect(component.loading).toBe(false);
      // Verify that draw was called
      expect(drawSpy).toHaveBeenCalled();
    });

    it('should handle API error and show alert', async () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      mockApiService.getNativeHoroscope.and.returnValue(
        throwError(() => errorResponse)
      );
      component.horoscoData = null;
      component.isDrawing = false;
      component.loading = false;

      component['drawHoroscope'](mockCurrentHoroData);

      expect(mockApiService.getNativeHoroscope).toHaveBeenCalledWith(
        mockCurrentHoroData
      );
      expect(component.horoscoData).toBeNull();
      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toContain('API Error');
      expect(component.isDrawing).toBe(false);
      expect(component.loading).toBe(false);
      // Verify that draw was not called
      expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should not draw if already drawing or loading', () => {
      // mockApiService.getNativeHoroscope.calls.reset();

      // 设置初始状态
      component.isDrawing = true;
      component.loading = false;

      component['drawHoroscope'](mockCurrentHoroData);
      expect(mockApiService.getNativeHoroscope).not.toHaveBeenCalled();

      component.isDrawing = false;
      component.loading = true;
      component['drawHoroscope'](mockCurrentHoroData);
      expect(mockApiService.getNativeHoroscope).not.toHaveBeenCalled();
    });
  });

  describe('applyStepChange', () => {
    let drawHoroscopeSpy: jasmine.Spy;

    beforeEach(() => {
      component.currentHoroData = structuredClone(mockCurrentHoroData);
      drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();
    });

    it('should update currentHoroData date correctly and redraw', () => {
      const step = { year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1 };
      (component as any).applyStepChange(step);

      const expectedDate = new Date(2001, 1, 2, 13, 1, 1);

      expect(component.currentHoroData.date.year).toBe(
        expectedDate.getFullYear()
      );
      expect(component.currentHoroData.date.month).toBe(
        expectedDate.getMonth() + 1
      );
      expect(component.currentHoroData.date.day).toBe(expectedDate.getDate());
      expect(component.currentHoroData.date.hour).toBe(expectedDate.getHours());
      expect(component.currentHoroData.date.minute).toBe(
        expectedDate.getMinutes()
      );
      expect(component.currentHoroData.date.second).toBe(
        expectedDate.getSeconds()
      );
      expect(drawHoroscopeSpy).toHaveBeenCalledWith(component.currentHoroData);
    });
  });

  describe('changeStep with debounce', () => {
    it('should only call applyStepChange once after rapid calls due to debounce', fakeAsync(() => {
      spyOn(component as any, 'drawHoroscope').and.stub();
      const applyStepChangeSpy = spyOn(
        component as any,
        'applyStepChange'
      ).and.stub();

      // 触发 ngOnInit 以设置订阅, 同时会触发 ngAfterViewInit
      fixture.detectChanges(); // ngOnInit

      applyStepChangeSpy.calls.reset();

      const step = { year: 0, month: 0, day: 1, hour: 0, minute: 0, second: 0 };

      component.changeStep(step);
      component.changeStep(step);
      component.changeStep(step);

      tick(299);
      expect(applyStepChangeSpy).not.toHaveBeenCalled();

      tick(1);
      expect(applyStepChangeSpy).toHaveBeenCalledTimes(1);

      flush();
    }));
  });

  describe('onArchive', () => {
    it('should call addRecord when horoData.id is 0', async () => {
      (component as any).horoData = { ...mockHoroData, id: 0 };
      const addRecordSpy = spyOn<any>(component, 'addRecord');

      await component.onArchive();

      expect(addRecordSpy).toHaveBeenCalled();
    });

    it('should show alert when horoData.id is not 0', async () => {
      (component as any).horoData = { ...mockHoroData, id: 1 };
      const alert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      mockAlertController.create.and.returnValue(Promise.resolve(alert));

      await component.onArchive();

      expect(mockAlertController.create).toHaveBeenCalled();
      expect(alert.present).toHaveBeenCalled();
    });
  });

  describe('onDetail', () => {
    it('should navigate to detail page with data if horoscopeData exists', () => {
      component.horoscoData = mockHoroscopeData;
      component.onDetail();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['detail'], {
        relativeTo: mockActivatedRoute,
        state: { data: mockHoroscopeData },
      });
    });

    it('should not navigate if horoscopeData is null', () => {
      component.horoscoData = null;
      component.onDetail();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onNote', () => {
    it('should navigate to note page', () => {
      component.onNote();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['note'], {
        relativeTo: mockActivatedRoute,
      });
    });
  });

  describe('addRecord', () => {
    const mockNativeResponse = {
      id: 123,
      name: 'Test',
      gender: true,
      birth_year: 2000,
      birth_month: 1,
      birth_day: 1,
      birth_hour: 12,
      birth_minute: 0,
      birth_second: 0,
      time_zone_offset: 8,
      is_dst: false,
      location: {
        id: 1,
        name: 'Shanghai',
        is_east: true,
        longitude_degree: 121,
        longitude_minute: 28,
        longitude_second: 25,
        is_north: true,
        latitude_degree: 31,
        latitude_minute: 13,
        latitude_second: 49,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: null,
      },
      description: '',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: null,
      lock: false,
    };

    beforeEach(() => {
      // 重置所有调用和参数
      mockApiService.addNative.calls.reset();
      mockHoroStorageService.horoData = { ...mockHoroData };
      component.currentHoroData = { ...mockCurrentHoroData };
    });

    it('should call api.addNative with correct parameters', () => {
      mockApiService.addNative.and.returnValue(of(mockNativeResponse));

      (component as any).addRecord();

      expect(mockApiService.addNative).toHaveBeenCalled();

      const callArgs = mockApiService.addNative.calls.mostRecent().args[0];
      expect(callArgs.name).toBe(mockHoroData.name);
      expect(callArgs.gender).toBe(mockHoroData.sex);
      expect(callArgs.birth_year).toBe(mockHoroData.date.year);
      expect(callArgs.birth_month).toBe(mockHoroData.date.month);
      expect(callArgs.birth_day).toBe(mockHoroData.date.day);
      expect(callArgs.birth_hour).toBe(mockHoroData.date.hour);
      expect(callArgs.birth_minute).toBe(mockHoroData.date.minute);
      expect(callArgs.birth_second).toBe(mockHoroData.date.second);
      expect(callArgs.time_zone_offset).toBe(mockHoroData.date.tz);
      expect(callArgs.is_dst).toBe(mockHoroData.date.st);
      expect(callArgs.description).toBe('');
      expect(callArgs.lock).toBe(false);

      // 检查位置信息
      expect(callArgs.location.name).toBe(mockHoroData.geo_name);
      expect(callArgs.location.is_east).toBe(mockHoroData.geo.long > 0);
      expect(callArgs.location.is_north).toBe(mockHoroData.geo.lat > 0);
    });

    it('should update storage on successful API call', () => {
      mockApiService.addNative.and.returnValue(of(mockNativeResponse));
      spyOn(component as any, 'handleError');

      (component as any).addRecord();

      expect(mockHoroStorageService.horoData!.id).toBe(mockNativeResponse.id);
      expect(component.isSaveOpen).toBe(true);
      expect((component as any).handleError).not.toHaveBeenCalled();
    });

    it('should call handleError on API error', () => {
      const error = new Error('API Error');
      mockApiService.addNative.and.returnValue(throwError(() => error));
      const handleErrorSpy = spyOn(component as any, 'handleError');

      (component as any).addRecord();

      expect(handleErrorSpy).toHaveBeenCalledWith('新增档案错误', error);
      expect(component.isSaveOpen).toBe(false);
    });

    it('should correctly convert longitude and latitude to DMS format', () => {
      const testHoroData = {
        ...mockHoroData,
        geo: { long: 121.473702, lat: 31.230374 },
      };

      mockHoroStorageService.horoData = testHoroData;
      (component as any).horoData = { ...testHoroData } as HoroRequest;
      mockApiService.addNative.and.returnValue(of(mockNativeResponse));

      (component as any).addRecord();

      const callArgs = mockApiService.addNative.calls.mostRecent().args[0];

      // 验证经度转换
      expect(callArgs.location.is_east).toBe(true);
      expect(callArgs.location.longitude_degree).toBe(121);
      expect(callArgs.location.longitude_minute).toBe(28);
      expect(callArgs.location.longitude_second).toBe(25);

      // 验证纬度转换
      expect(callArgs.location.is_north).toBe(true);
      expect(callArgs.location.latitude_degree).toBe(31);
      expect(callArgs.location.latitude_minute).toBe(13);
      expect(callArgs.location.latitude_second).toBe(49);
    });

    it('should handle negative longitude and latitude correctly', () => {
      const testHoroData = {
        ...mockHoroData,
        geo: { long: -74.00583333333333, lat: -34.90083333333333 },
      };

      mockHoroStorageService.horoData = testHoroData;
      (component as any).horoData = { ...testHoroData } as HoroRequest;
      mockApiService.addNative.and.returnValue(of(mockNativeResponse));

      (component as any).addRecord();

      const callArgs = mockApiService.addNative.calls.mostRecent().args[0];

      // 验证经度转换
      expect(callArgs.location.is_east).toBe(false);
      expect(callArgs.location.longitude_degree).toBe(74);
      expect(callArgs.location.longitude_minute).toBe(0);
      expect(callArgs.location.longitude_second).toBe(21);

      // 验证纬度转换
      expect(callArgs.location.is_north).toBe(false);
      expect(callArgs.location.latitude_degree).toBe(34);
      expect(callArgs.location.latitude_minute).toBe(54);
      expect(callArgs.location.latitude_second).toBe(2);
    });
  });

  describe('updateRecord', () => {
    const mockNativeRecord = {
      id: 1,
      name: 'Test',
      gender: true,
      birth_year: 2000,
      birth_month: 1,
      birth_day: 1,
      birth_hour: 12,
      birth_minute: 0,
      birth_second: 0,
      time_zone_offset: 8,
      is_dst: false,
      location: {
        id: 1,
        name: 'Shanghai',
        is_east: true,
        longitude_degree: 121,
        longitude_minute: 28,
        longitude_second: 12, // 121.47
        is_north: true,
        latitude_degree: 31,
        latitude_minute: 13,
        latitude_second: 48, // 31.23
        created_at: '',
        updated_at: '',
      },
      description: '',
      created_at: '',
      updated_at: '',
      lock: false,
    };

    beforeEach(() => {
      // 重置 horoData，使用 structuredClone 进行深拷贝以隔离测试
      component['horoData'] = structuredClone(mockHoroData);
      mockApiService.getNativeById.and.returnValue(
        of(structuredClone(mockNativeRecord))
      );
      mockApiService.updateNative.and.returnValue(of(undefined));
      component.isSaveOpen = false;
    });

    it('should not call updateNative if data is unchanged', () => {
      component.updateRecord();

      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);
      expect(mockApiService.updateNative).not.toHaveBeenCalled();
      expect(component.isSaveOpen).toBe(true);
    });

    it('should call updateNative with changed data', () => {
      const changedHoroData = {
        ...mockHoroData,
        id: 1,
        name: 'New Name',
        date: { ...mockHoroData.date, year: 2001 },
      };
      component['horoData'] = changedHoroData;

      component.updateRecord();

      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);

      const expectedUpdateRequest = {
        name: 'New Name',
        gender: null,
        birth_year: 2001,
        birth_month: null,
        birth_day: null,
        birth_hour: null,
        birth_minute: null,
        birth_second: null,
        time_zone_offset: null,
        is_dst: null,
        location: null,
        description: null,
        lock: null,
      };

      expect(mockApiService.updateNative).toHaveBeenCalledWith(
        1,
        jasmine.objectContaining(expectedUpdateRequest)
      );
      expect(component.isSaveOpen).toBe(true);
    });

    it('should handle error from getNativeById', () => {
      const error = { error: { message: 'Get Error' } };
      mockApiService.getNativeById.and.returnValue(throwError(() => error));
      const handleErrorSpy = spyOn(
        component as any,
        'handleError'
      ).and.callThrough();

      component.updateRecord();

      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);
      expect(handleErrorSpy).toHaveBeenCalledWith('获取档案错误', error);
      expect(mockApiService.updateNative).not.toHaveBeenCalled();
    });

    it('should handle error from updateNative', () => {
      const error = { error: { message: 'Update Error' } };
      mockApiService.updateNative.and.returnValue(throwError(() => error));
      const handleErrorSpy = spyOn(
        component as any,
        'handleError'
      ).and.callThrough();
      const changedHoroData = { ...mockHoroData, id: 1, name: 'New Name' };
      component['horoData'] = changedHoroData;

      component.updateRecord();

      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);
      expect(mockApiService.updateNative).toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalledWith('更新档案错误', error);
      expect(component.isSaveOpen).toBe(false);
    });

    it('should show error message when record is locked (lock is true)', () => {
      // 创建一个锁定的记录
      const lockedNativeRecord = {
        ...mockNativeRecord,
        lock: true,
      };
      mockApiService.getNativeById.and.returnValue(
        of(structuredClone(lockedNativeRecord))
      );

      component.updateRecord();

      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);
      expect(mockApiService.updateNative).not.toHaveBeenCalled();
      expect(component.message).toBe('记录已锁定，无法修改');
      expect(component.isAlertOpen).toBe(true);
    });
  });

  describe('isAuth property', () => {
    it('should return authService.isAuth value', () => {
      Object.defineProperty(mockAuthService, 'isAuth', {
        value: true,
        writable: true,
      });
      expect(component.isAuth).toBe(true);

      Object.defineProperty(mockAuthService, 'isAuth', {
        value: false,
        writable: true,
      });
      expect(component.isAuth).toBe(false);
    });
  });
});
