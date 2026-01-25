import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { QizhengSynastryComponent } from './qizheng-synastry.component';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { Title } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { delay, of, throwError } from 'rxjs';
import {
  createMockHoroRequest,
  createMockDateRequest,
  createMockGeoRequest,
} from '../../test-utils/test-data-factory.spec';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { qizhengHoroscope } from '../../utils/image/qizheng-horoscope.spec';

describe('QizhengSynastryComponent', () => {
  let component: QizhengSynastryComponent;
  let fixture: ComponentFixture<QizhengSynastryComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let horoStorageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let configServiceSpy: jasmine.SpyObj<QizhengConfigService>;
  let tipServiceSpy: jasmine.SpyObj<TipService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  // let platformSpy: jasmine.SpyObj<Platform>;

  const mockNativeHoroRequest: HoroRequest = createMockHoroRequest({
    id: 1,
    date: createMockDateRequest({ year: 2000 }),
    geo: createMockGeoRequest(),
  });

  const mockComparisonHoroRequest: HoroRequest = createMockHoroRequest({
    id: 2,
    date: createMockDateRequest({ year: 2001 }),
    geo: createMockGeoRequest(),
  });

  // Deep copy to ensure independence
  const mockHoroscope = structuredClone(qizhengHoroscope);

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['qizheng']);
    horoStorageServiceSpy = jasmine.createSpyObj('HoroStorageService', [], {
      horoData: mockNativeHoroRequest,
      synastryData: mockComparisonHoroRequest,
    });

    configServiceSpy = jasmine.createSpyObj('QizhengConfigService', [], {
      HoroscoImage: { width: 800, height: 800 },
      fontSize: 12,
    });

    tipServiceSpy = jasmine.createSpyObj('TipService', ['getTip']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [QizhengSynastryComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: HoroStorageService, useValue: horoStorageServiceSpy },
        { provide: QizhengConfigService, useValue: configServiceSpy },
        { provide: TipService, useValue: tipServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QizhengSynastryComponent);
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
    let loadDataAndDrawSpy: jasmine.Spy;

    beforeEach(() => {
      loadDataAndDrawSpy = spyOn(
        component as any,
        'loadDataAndDraw',
      ).and.stub();
    });

    it('should set title on init', () => {
      component.ngOnInit();
      expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('七政四余合盘');
    });

    it('should load data and draw on view init', () => {
      expect(component['canvas']).toBeFalsy();
      component.ngAfterViewInit();

      expect(component['canvas']).toBeTruthy();
      expect(loadDataAndDrawSpy).toHaveBeenCalledTimes(1);
    });

    it('should clean up canvas and resources on destroy', () => {
      component.ngAfterViewInit();

      const canvas = (component as any).canvas;

      component.ngOnDestroy();

      expect(canvas.dispose).toHaveBeenCalledTimes(1);
      expect(component['canvas']).toBeFalsy();
    });
  });

  describe('loadDataAndDraw', () => {
    let drawSpy: jasmine.Spy;
    let zoomImageSpy: jasmine.Spy;

    beforeEach(() => {
      (component as any).canvas = (component as any).createCanvas();
      apiServiceSpy.qizheng.and.returnValue(of(mockHoroscope).pipe(delay(0)));
      drawSpy = spyOn(component as any, 'draw').and.stub();
      zoomImageSpy = spyOn(component as any, 'zoomImage').and.stub();
    });

    it('should successfully load data and call draw', fakeAsync(() => {
      (component as any).loadDataAndDraw();

      expect(component.loading).toBeTrue();
      expect(component.isDrawing).toBeTrue();

      tick();

      expect(apiServiceSpy.qizheng).toHaveBeenCalledTimes(2);
      expect(component['nativeHoro']).toEqual(mockHoroscope);
      expect(component['comparisonHoro']).toEqual(mockHoroscope);
      expect(drawSpy).toHaveBeenCalled();
      expect(zoomImageSpy).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
      expect(component.isDrawing).toBeFalse();
    }));

    it('should successfully load data but not draw when canvas is undefined', fakeAsync(() => {
      (component as any).canvas = undefined;
      (component as any).loadDataAndDraw();

      expect(component.loading).toBeTrue();
      expect(component.isDrawing).toBeTrue();

      tick();

      expect(apiServiceSpy.qizheng).toHaveBeenCalledTimes(2);
      expect(component['nativeHoro']).toEqual(mockHoroscope);
      expect(component['comparisonHoro']).toEqual(mockHoroscope);
      expect(drawSpy).not.toHaveBeenCalled();
      expect(zoomImageSpy).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
      expect(component.isDrawing).toBeFalse();
    }));

    it('should not call API if already loading', () => {
      component.loading = true;
      (component as any).loadDataAndDraw();
      expect(apiServiceSpy.qizheng).not.toHaveBeenCalled();
    });

    it('should not call API if already drawing', () => {
      component.isDrawing = true;
      (component as any).loadDataAndDraw();
      expect(apiServiceSpy.qizheng).not.toHaveBeenCalled();
    });

    it('should call API with correct parameters (process_date + 1 year)', () => {
      (component as any).loadDataAndDraw();

      const nativeArg = apiServiceSpy.qizheng.calls.argsFor(0)[0];
      expect(nativeArg.native_date).toEqual(mockNativeHoroRequest.date);
      expect(nativeArg.process_date.year).toBe(
        mockNativeHoroRequest.date.year + 1,
      );

      const comparisonArg = apiServiceSpy.qizheng.calls.argsFor(1)[0];
      expect(comparisonArg.native_date).toEqual(mockComparisonHoroRequest.date);
      expect(comparisonArg.process_date.year).toBe(
        mockComparisonHoroRequest.date.year + 1,
      );
    });

    it('should handle API error correctly', () => {
      const errorResponse = {
        message: 'Network Error',
        error: { error: 'Details' },
      };
      apiServiceSpy.qizheng.and.returnValue(throwError(() => errorResponse));

      (component as any).loadDataAndDraw();

      expect(component.isAlertOpen).toBeTrue();
      expect(component.message).toContain('Network Error Details');
      expect(component.loading).toBeFalse();
      expect(component.isDrawing).toBeFalse();
    });
  });

  describe('swap', () => {
    let drawSpy: jasmine.Spy;
    beforeEach(() => {
      drawSpy = spyOn(component as any, 'draw').and.stub();
    });

    it('should swap and redraw', () => {
      component.isSwapped = false;
      component.loading = false;
      component.isDrawing = false;

      component.swap();
      expect(component.isSwapped).toBeTrue();
      expect(drawSpy).toHaveBeenCalledTimes(1);

      component.swap();
      expect(component.isSwapped).toBeFalse();
      expect(drawSpy).toHaveBeenCalledTimes(2);
    });

    it('should not swap if loading is true', () => {
      component.isSwapped = false;
      component.loading = true;
      component.isDrawing = false;

      component.swap();

      expect(component.isSwapped).toBeFalse();
      expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should not swap if isDrawing is true', () => {
      component.isSwapped = false;
      component.loading = false;
      component.isDrawing = true;

      component.swap();

      expect(component.isSwapped).toBeFalse();
      expect(drawSpy).not.toHaveBeenCalled();
    });
  });
});
