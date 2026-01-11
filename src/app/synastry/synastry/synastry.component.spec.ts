import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { SynastryComponent } from './synastry.component';
import { HoroscopeComparison } from 'src/app/type/interface/response-data';
import {
  HoroscopeComparisonRequest,
  HoroRequest,
} from 'src/app/type/interface/request-data';
import {
  createMockHoroRequest,
  createMockHoroscopeComparison,
} from '../../test-utils/test-data-factory.spec';
import { delay, of, throwError } from 'rxjs';

describe('SynastryComponent', () => {
  let component: SynastryComponent;
  let fixture: ComponentFixture<SynastryComponent>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockOriginalHoroData: HoroRequest = createMockHoroRequest({
    id: 1,
    name: 'Original User',
    sex: true,
    house: 'Placidus',
    date: {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    },
    geo_name: 'Beijing',
    geo: {
      long: 116.4,
      lat: 39.9,
    },
  });

  const mockComparisonHoroData: HoroRequest = createMockHoroRequest({
    id: 2,
    name: 'Comparison User',
    sex: false,
    house: 'Alcabitus',
    date: {
      year: 1995,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      tz: -5,
      st: false,
    },
    geo_name: 'New York',
    geo: {
      long: -74.0,
      lat: 40.7,
    },
  });

  const mockComparisonData: HoroscopeComparison = createMockHoroscopeComparison(
    {
      original_planets: [],
      comparison_planets: [],
      aspects: [],
    }
  );

  const mockConfig = {
    aspectImage: { width: 800, height: 600 },
    HoroscoImage: { width: 600, height: 600 },
  };

  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockPlatform: Partial<Platform>;

  beforeEach(async () => {
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['compare']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockActivatedRoute = {};
    mockPlatform = {
      is: () => true,
    };
    const configServiceMock = {
      aspectImage: mockConfig.aspectImage,
      HoroscoImage: mockConfig.HoroscoImage,
    };
    const storageServiceMock = {
      horoData: mockOriginalHoroData,
      synastryData: mockComparisonHoroData,
    };

    await TestBed.configureTestingModule({
      declarations: [SynastryComponent],
      providers: [
        { provide: Title, useValue: titleServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Horoconfig, useValue: configServiceMock },
        { provide: HoroStorageService, useValue: storageServiceMock },
        { provide: Platform, useValue: mockPlatform },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SynastryComponent);
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
    //   describe('ngAfterViewInit', () => {
    let drawHoroscopeSpy: jasmine.Spy;

    beforeEach(() => {
      drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();
    });

    it('should set the title on init', () => {
      component.ngOnInit();
      expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('合盘');
    });

    it('should create canvas and draw horoscope', () => {
      component.ngAfterViewInit();

      expect((component as any).createCanvas).toHaveBeenCalled();
      expect(drawHoroscopeSpy).toHaveBeenCalled();
    });

    it('should dispose canvas and clear cache', () => {
      component.ngAfterViewInit();
      const canvas = (component as any).canvas;
      const disposeSpy = canvas.dispose;

      component.ngOnDestroy();

      expect(disposeSpy).toHaveBeenCalled();
      expect((component as any).canvas).toBeUndefined();
      expect((component as any).canvasCache).toBeUndefined();
    });
  });

  describe('swap', () => {
    let drawHoroscopeSpy: jasmine.Spy;

    beforeEach(() => {
      drawHoroscopeSpy = spyOn(component as any, 'drawHoroscope').and.stub();
    });

    it('should not swap when isDrawing is true', () => {
      component.isDrawing = true;
      const initialSwapped = component.isSwapped;

      component.swap();

      expect(component.isSwapped).toBe(initialSwapped);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
    });

    it('should not swap when loading is true', () => {
      component.loading = true;
      const initialSwapped = component.isSwapped;

      component.swap();

      expect(component.isSwapped).toBe(initialSwapped);
      expect(drawHoroscopeSpy).not.toHaveBeenCalled();
    });

    it('should toggle isSwapped and redraw when not drawing or loading', () => {
      expect(component.isSwapped).toBe(false);

      component.swap();

      expect(component.isSwapped).toBe(true);
      expect(drawHoroscopeSpy).toHaveBeenCalled();
    });
  });

  describe('drawHoroscope', () => {
    let drawSpy: jasmine.Spy;
    beforeEach(() => {
      //   component.ngAfterViewInit();
      apiServiceSpy.compare.and.returnValue(
        of(mockComparisonData).pipe(delay(0))
      );
      drawSpy = spyOn(component as any, 'draw').and.stub();
    });

    it('should not execute when isDrawing is true', () => {
      component.isDrawing = true;

      (component as any).drawHoroscope();

      expect(apiServiceSpy.compare).not.toHaveBeenCalled();
    });

    it('should not execute when loading is true', () => {
      component.loading = true;

      (component as any).drawHoroscope();

      expect(apiServiceSpy.compare).not.toHaveBeenCalled();
    });

    it('should set loading and isDrawing to true during request and reset after', fakeAsync(() => {
      // 这三行是为了测试alert是否会被关闭和canvasCache是否会被清除
      component.isAlertOpen = true;
      component.message = 'Previous error';
      (component as any).canvasCache = { version: '1', objects: [] };

      (component as any).drawHoroscope();

      expect(component.loading).toBe(true);
      expect(component.isDrawing).toBe(true);
      expect((component as any).canvasCache).toBeUndefined();

      tick();

      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);

      expect(component.horoscopeComparisonData).toEqual(mockComparisonData);
      expect(component.isAlertOpen).toBe(false);
      expect(apiServiceSpy.compare).toHaveBeenCalledWith({
        original_date: mockOriginalHoroData.date,
        comparison_date: mockComparisonHoroData.date,
        original_geo: mockOriginalHoroData.geo,
        comparison_geo: mockComparisonHoroData.geo,
        house: mockOriginalHoroData.house,
      });
      expect(drawSpy).toHaveBeenCalledWith(mockComparisonData);
    }));

    it('should show alert with error message on failure', () => {
      const errorResponse = { error: { message: 'API Error' } };
      apiServiceSpy.compare.and.returnValue(throwError(() => errorResponse));

      (component as any).drawHoroscope();

      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toBe('获取星盘数据失败: API Error');
    });

    it('should handle error with message property', () => {
      const errorResponse = { message: 'Network Error' };
      apiServiceSpy.compare.and.returnValue(throwError(() => errorResponse));

      (component as any).drawHoroscope();

      expect(component.message).toBe('获取星盘数据失败: Network Error');
    });

    it('should handle error with unknown message', () => {
      apiServiceSpy.compare.and.returnValue(throwError(() => ({})));

      (component as any).drawHoroscope();

      expect(component.message).toBe('获取星盘数据失败: 未知错误');
    });
  });

  describe('getHoroscopeComparisonData', () => {
    it('should return observable with comparison data', () => {
      apiServiceSpy.compare.and.returnValue(of(mockComparisonData));

      const result = (component as any).getHoroscopeComparisonData();

      expect(result).toBeTruthy();
    });

    it('should call api with correct request data when not swapped', () => {
      component.isSwapped = false;

      (component as any).getHoroscopeComparisonData();

      const expectedRequest: HoroscopeComparisonRequest = {
        original_date: mockOriginalHoroData.date,
        comparison_date: mockComparisonHoroData.date,
        original_geo: mockOriginalHoroData.geo,
        comparison_geo: mockComparisonHoroData.geo,
        house: mockOriginalHoroData.house,
      };

      expect(apiServiceSpy.compare).toHaveBeenCalledWith(expectedRequest);
    });

    it('should call api with swapped data when isSwapped is true', () => {
      component.isSwapped = true;
      apiServiceSpy.compare.and.returnValue(of(mockComparisonData));

      (component as any).getHoroscopeComparisonData();

      const expectedRequest: HoroscopeComparisonRequest = {
        original_date: mockComparisonHoroData.date,
        comparison_date: mockOriginalHoroData.date,
        original_geo: mockComparisonHoroData.geo,
        comparison_geo: mockOriginalHoroData.geo,
        house: mockComparisonHoroData.house,
      };

      expect(apiServiceSpy.compare).toHaveBeenCalledWith(expectedRequest);
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(component.horoscopeComparisonData).toBeNull();
      expect(component.isAspect).toBe(false);
      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);
      expect(component.isAlertOpen).toBe(false);
      expect(component.message).toBe('');
      expect(component.isSwapped).toBe(false);
    });
  });
});
