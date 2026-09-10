import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj, fakeAsync, tick } from 'src/test-utils/spy';
import {
  ComponentFixture,
  TestBed,
    } from '@angular/core/testing';
import { QizhengSynastryComponent } from './qizheng-synastry.component';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { QizhengConfigService } from 'src/app/services/config/qizheng-config.service';
import { TipService } from 'src/app/services/qizheng/tip.service';
import { Title } from '@angular/platform-browser';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
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
  let apiServiceSpy: SpyObj<ApiService>;
  let horoStorageServiceSpy: SpyObj<HoroStorageService>;
  let configServiceSpy: SpyObj<QizhengConfigService>;
  let tipServiceSpy: SpyObj<TipService>;
  let titleServiceSpy: SpyObj<Title>;
  // let platformSpy: SpyObj<Platform>;

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
    apiServiceSpy = createSpyObj('ApiService', ['qizheng']);
    horoStorageServiceSpy = createSpyObj('HoroStorageService', [], {
      horoData: mockNativeHoroRequest,
      synastryData: mockComparisonHoroRequest,
    });

    configServiceSpy = createSpyObj('QizhengConfigService', [], {
      HoroscoImage: { width: 800, height: 800 },
      fontSize: 12,
    });

    tipServiceSpy = createSpyObj('TipService', ['getTip']);
    titleServiceSpy = createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [QizhengSynastryComponent],
      imports: [IonAlert, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonSpinner, IonTitle, IonToolbar],
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
   vi.spyOn(component as any, 'createCanvas').mockReturnValue({
      dispose: createSpy('dispose'),
      toJSON: () => ({}),
      loadFromJSON: (data: any) =>
        Promise.resolve({ renderAll: createSpy('renderAll') }),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Lifecycle Hooks', () => {
    let loadDataAndDrawSpy: Spy;

    beforeEach(() => {
      loadDataAndDrawSpy =vi.spyOn(
        component as any,
        'loadDataAndDraw',
      ).mockReturnValue(undefined);
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
    let drawSpy: Spy;
    let zoomImageSpy: Spy;

    beforeEach(() => {
      (component as any).canvas = (component as any).createCanvas();
      apiServiceSpy.qizheng.mockReturnValue(of(mockHoroscope).pipe(delay(0)));
      drawSpy =vi.spyOn(component as any, 'draw').mockReturnValue(undefined);
      zoomImageSpy =vi.spyOn(component as any, 'zoomImage').mockReturnValue(undefined);
    });

    it('should successfully load data and call draw', fakeAsync(async () => {
      (component as any).loadDataAndDraw();

      expect(component.loading).toBe(true);
      expect(component.isDrawing).toBe(true);

      await tick();

      expect(apiServiceSpy.qizheng).toHaveBeenCalledTimes(2);
      expect(component['nativeHoro']).toEqual(mockHoroscope);
      expect(component['comparisonHoro']).toEqual(mockHoroscope);
      expect(drawSpy).toHaveBeenCalled();
      expect(zoomImageSpy).toHaveBeenCalled();
      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);
    }));

    it('should successfully load data but not draw when canvas is undefined', fakeAsync(async () => {
      (component as any).canvas = undefined;
      (component as any).loadDataAndDraw();

      expect(component.loading).toBe(true);
      expect(component.isDrawing).toBe(true);

      await tick();

      expect(apiServiceSpy.qizheng).toHaveBeenCalledTimes(2);
      expect(component['nativeHoro']).toEqual(mockHoroscope);
      expect(component['comparisonHoro']).toEqual(mockHoroscope);
      expect(drawSpy).not.toHaveBeenCalled();
      expect(zoomImageSpy).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);
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

      const nativeArg = apiServiceSpy.qizheng.mock.calls[0][0];
      expect(nativeArg.native_date).toEqual(mockNativeHoroRequest.date);
      expect(nativeArg.process_date.year).toBe(
        mockNativeHoroRequest.date.year + 1,
      );

      const comparisonArg = apiServiceSpy.qizheng.mock.calls[1][0];
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
      apiServiceSpy.qizheng.mockReturnValue(throwError(() => errorResponse));

      (component as any).loadDataAndDraw();

      expect(component.isAlertOpen).toBe(true);
      expect(component.message).toContain('Details');
      expect(component.loading).toBe(false);
      expect(component.isDrawing).toBe(false);
    });
  });

  describe('swap', () => {
    let drawSpy: Spy;
    beforeEach(() => {
      drawSpy =vi.spyOn(component as any, 'draw').mockReturnValue(undefined);
    });

    it('should swap and redraw', () => {
      component.isSwapped = false;
      component.loading = false;
      component.isDrawing = false;

      component.swap();
      expect(component.isSwapped).toBe(true);
      expect(drawSpy).toHaveBeenCalledTimes(1);

      component.swap();
      expect(component.isSwapped).toBe(false);
      expect(drawSpy).toHaveBeenCalledTimes(2);
    });

    it('should not swap if loading is true', () => {
      component.isSwapped = false;
      component.loading = true;
      component.isDrawing = false;

      component.swap();

      expect(component.isSwapped).toBe(false);
      expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should not swap if isDrawing is true', () => {
      component.isSwapped = false;
      component.loading = false;
      component.isDrawing = true;

      component.swap();

      expect(component.isSwapped).toBe(false);
      expect(drawSpy).not.toHaveBeenCalled();
    });
  });
});
