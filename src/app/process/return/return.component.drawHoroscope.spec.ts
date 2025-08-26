import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HoroCommonModule } from 'src/app/horo-common/horo-common.module';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { ProcessName } from '../enum/process';
import { ReturnComponent } from './return.component';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ReturnHoroscope } from 'src/app/type/interface/response-data';
import {
  mockHoroData,
  mockLunarReturnHoroscopeData,
  mockProcessData,
  mockSolarReturnHoroscopeData,
} from '../compare/compare.component.const.spec';

describe('ReturnComponent', () => {
  let component: ReturnComponent;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockHoroStorageService: jasmine.SpyObj<HoroStorageService>;
  const mockReturnHoroscopeData: ReturnHoroscope = mockSolarReturnHoroscopeData;

  beforeEach(() => {
    const mockActivatedRoute = {
      snapshot: { data: { process_name: ProcessName.SolarReturn } },
    };
    mockApiService = jasmine.createSpyObj('ApiService', [
      'solarReturn',
      'lunarReturn',
    ]);
    mockHoroStorageService = jasmine.createSpyObj('HoroStorageService', [], {
      horoData: mockHoroData,
      processData: mockProcessData,
    });

    TestBed.configureTestingModule({
      declarations: [ReturnComponent],
      imports: [
        IonicModule.forRoot(),
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: HoroStorageService, useValue: mockHoroStorageService },
      ],
    });

    const fixture = TestBed.createComponent(ReturnComponent);
    component = fixture.componentInstance;
  });
  describe('ReturnComponent drawHoroscope', () => {
    let getReturnDataSpy: jasmine.Spy;
    let drawSpy: jasmine.Spy;

    beforeEach(() => {
      // Spy on private methods before each test
      getReturnDataSpy = spyOn(component as any, 'getReturnData');
      drawSpy = spyOn(component as any, 'draw').and.stub();
    });
    it('should not call getReturnData if isDrawing is true', () => {
      (component as any).isDrawing = true;
      (component as any).drawHoroscope(ProcessName.SolarReturn);
      expect(getReturnDataSpy).not.toHaveBeenCalled();
    });

    it('should not call getReturnData if loading is true', () => {
      (component as any).loading = true;
      (component as any).drawHoroscope(ProcessName.SolarReturn);
      expect(getReturnDataSpy).not.toHaveBeenCalled();
    });

    it('should set loading flags and call getReturnData', fakeAsync(() => {
      //因为of是同步的，使用delay创建一个异步的 observable
      getReturnDataSpy.and.returnValue(
        of(mockReturnHoroscopeData).pipe(delay(0))
      );
      (component as any).drawHoroscope(ProcessName.SolarReturn);

      // 在调用后立即检查标志
      expect(component.loading).toBeTrue();
      expect((component as any).isDrawing).toBeTrue();
      expect(getReturnDataSpy).toHaveBeenCalledWith(ProcessName.SolarReturn);

      // tick() 来完成异步操作
      tick();

      // 异步操作完成后，标志应该被重置
      expect(component.loading).toBeFalse();
      expect((component as any).isDrawing).toBeFalse();
    }));

    it('should update component properties and call draw', fakeAsync(() => {
      getReturnDataSpy.and.returnValue(
        of(mockReturnHoroscopeData).pipe(delay(0))
      );
      (component as any).drawHoroscope(ProcessName.SolarReturn);
      tick(); // Process the observable

      expect(component.returnHoroscopeData).toEqual(mockReturnHoroscopeData);
      expect(component.isAlertOpen).toBeFalse();
      expect(drawSpy).toHaveBeenCalledWith(mockReturnHoroscopeData);
    }));

    describe('on failed data fetch', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };

      beforeEach(() => {
        getReturnDataSpy.and.returnValue(throwError(() => errorResponse));
      });

      it('should set error message and open alert', () => {
        (component as any).drawHoroscope(ProcessName.SolarReturn);
        // tick(); // Process the observable

        expect(component.message).toBe('API Error Internal Server Error');
        expect(component.isAlertOpen).toBeTrue();
        expect(drawSpy).not.toHaveBeenCalled();
      });

      it('should reset loading flags in finalize even on error', () => {
        (component as any).drawHoroscope(ProcessName.SolarReturn);
        // tick(); // Process the observable

        expect(component.loading).toBeFalse();
        expect((component as any).isDrawing).toBeFalse();
      });
    });
  });

  describe('getReturnData', () => {
    let getSolarReturnDataSpy: jasmine.Spy;
    let getLunarReturnDataSpy: jasmine.Spy;

    beforeEach(() => {
      getSolarReturnDataSpy = spyOn(
        component as any,
        'getSolarReturnData'
      ).and.stub();
      getLunarReturnDataSpy = spyOn(
        component as any,
        'getLunarReturnData'
      ).and.stub();
    });

    it('should call getSolarReturnData for SolarReturn process', () => {
      (component as any).getReturnData(ProcessName.SolarReturn);
      expect(getSolarReturnDataSpy).toHaveBeenCalled();
      expect(getLunarReturnDataSpy).not.toHaveBeenCalled();
    });

    it('should call getLunarReturnData for LunarReturn process', () => {
      (component as any).getReturnData(ProcessName.LunarReturn);
      expect(getLunarReturnDataSpy).toHaveBeenCalled();
      expect(getSolarReturnDataSpy).not.toHaveBeenCalled();
    });
  });

  describe('getSolarReturnData', () => {
    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
    });

    it('should call api.solarReturn with correct request data', fakeAsync(() => {
      mockApiService.solarReturn.and.returnValue(
        of(mockSolarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getSolarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      tick(); // 处理异步操作

      expect(result).toEqual(mockSolarReturnHoroscopeData);

      expect(mockApiService.solarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: component.currentProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));

    it('should use currentProcessData.date for process_date', fakeAsync(() => {
      mockApiService.solarReturn.and.returnValue(
        of(mockSolarReturnHoroscopeData).pipe(delay(0))
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

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getSolarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      tick(); // 处理异步操作

      expect(result).toEqual(mockSolarReturnHoroscopeData);

      expect(mockApiService.solarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: component.currentProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));
  });

  describe('getLunarReturnData', () => {
    beforeEach(() => {
      component.currentProcessData = structuredClone(mockProcessData);
      component.currentProcessData.isSolarReturn = false;
    });

    it('should call api.lunarReturn with correct request data when isSolarReturn is false', fakeAsync(() => {
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      tick(); // 处理异步操作

      expect(result).toEqual(mockLunarReturnHoroscopeData);

      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: mockProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));

    it('should use currentProcessData.date for process_date', fakeAsync(() => {
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
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

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      tick(); // 处理异步操作

      expect(result).toEqual(mockLunarReturnHoroscopeData);

      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: component.currentProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));

    it('should calculate lunar return based on solar return data when isSolarReturn is true', fakeAsync(() => {
      // 设置isSolarReturn为true
      component.currentProcessData.isSolarReturn = true;

      // 设置spy
      const getSolarReturnDataSpy = spyOn(
        component as any,
        'getSolarReturnData'
      ).and.returnValue(of(mockSolarReturnHoroscopeData).pipe(delay(0)));
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      tick(); // 处理异步操作

      expect(result).toEqual(mockLunarReturnHoroscopeData);

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
    }));

    it('should use currentProcessData.date for process_date when isSolarReturn is true', fakeAsync(() => {
      // 设置isSolarReturn为true
      component.currentProcessData.isSolarReturn = true;

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

      // 设置spy
      const getSolarReturnDataSpy = spyOn(
        component as any,
        'getSolarReturnData'
      ).and.returnValue(of(mockSolarReturnHoroscopeData).pipe(delay(0)));
      mockApiService.lunarReturn.and.returnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      tick(); // 处理异步操作

      expect(result).toEqual(mockLunarReturnHoroscopeData);

      // 验证调用了getSolarReturnData
      expect(getSolarReturnDataSpy).toHaveBeenCalled();

      // 验证使用了solarReturnData中的return_date作为native_date
      // 同时验证使用了currentProcessData.date作为process_date
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
        process_date: component.currentProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));
  });
});
