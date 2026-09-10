import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj, fakeAsync, tick, flush } from 'src/test-utils/spy';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
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
  let mockApiService: SpyObj<ApiService>;
  let mockHoroStorageService: SpyObj<HoroStorageService>;
  const mockReturnHoroscopeData: ReturnHoroscope = mockSolarReturnHoroscopeData;

  beforeEach(() => {
    const mockActivatedRoute = {
      snapshot: { data: { process_name: ProcessName.SolarReturn } },
    };
    mockApiService = createSpyObj('ApiService', [
      'solarReturn',
      'lunarReturn',
    ]);
    mockHoroStorageService = createSpyObj('HoroStorageService', [], {
      horoData: mockHoroData,
      processData: mockProcessData,
    });

    TestBed.configureTestingModule({
      imports: [
        ReturnComponent,
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
    let getReturnDataSpy: Spy;
    let drawSpy: Spy;

    beforeEach(() => {
      // Spy on private methods before each test
      getReturnDataSpy =vi.spyOn(component as any, 'getReturnData');
      drawSpy =vi.spyOn(component as any, 'draw').mockReturnValue(undefined);
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

    it('should set loading flags and call getReturnData', fakeAsync(async () => {
      //因为of是同步的，使用delay创建一个异步的 observable
      getReturnDataSpy.mockReturnValue(
        of(mockReturnHoroscopeData).pipe(delay(0))
      );
      (component as any).drawHoroscope(ProcessName.SolarReturn);

      // 在调用后立即检查标志
      expect(component.loading).toBe(true);
      expect((component as any).isDrawing).toBe(true);
      expect(getReturnDataSpy).toHaveBeenCalledWith(ProcessName.SolarReturn);

      // await tick() 来完成异步操作
      await flush();

      // 异步操作完成后，标志应该被重置
      expect(component.loading).toBe(false);
      expect((component as any).isDrawing).toBe(false);
    }));

    it('should update component properties and call draw', fakeAsync(async () => {
      getReturnDataSpy.mockReturnValue(
        of(mockReturnHoroscopeData).pipe(delay(0))
      );
      (component as any).drawHoroscope(ProcessName.SolarReturn);
      await flush(); // Process the observable

      expect(component.returnHoroscopeData).toEqual(mockReturnHoroscopeData);
      expect(component.isAlertOpen).toBe(false);
      expect(drawSpy).toHaveBeenCalledWith(mockReturnHoroscopeData);
    }));

    describe('on failed data fetch', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };

      beforeEach(() => {
        getReturnDataSpy.mockReturnValue(throwError(() => errorResponse));
      });

      it('should set error message and open alert', () => {
        (component as any).drawHoroscope(ProcessName.SolarReturn);
        // await flush(); // Process the observable

        expect(component.message).toBe('API Error Internal Server Error');
        expect(component.isAlertOpen).toBe(true);
        expect(drawSpy).not.toHaveBeenCalled();
      });

      it('should reset loading flags in finalize even on error', () => {
        (component as any).drawHoroscope(ProcessName.SolarReturn);
        // await flush(); // Process the observable

        expect(component.loading).toBe(false);
        expect((component as any).isDrawing).toBe(false);
      });
    });
  });

  describe('getReturnData', () => {
    let getSolarReturnDataSpy: Spy;
    let getLunarReturnDataSpy: Spy;

    beforeEach(() => {
      getSolarReturnDataSpy =vi.spyOn(
        component as any,
        'getSolarReturnData'
      ).mockReturnValue(undefined);
      getLunarReturnDataSpy =vi.spyOn(
        component as any,
        'getLunarReturnData'
      ).mockReturnValue(undefined);
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

    it('should call api.solarReturn with correct request data', fakeAsync(async () => {
      mockApiService.solarReturn.mockReturnValue(
        of(mockSolarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getSolarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      await flush(); // 处理异步操作

      expect(result).toEqual(mockSolarReturnHoroscopeData);

      expect(mockApiService.solarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: component.currentProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));

    it('should use currentProcessData.date for process_date', fakeAsync(async () => {
      mockApiService.solarReturn.mockReturnValue(
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

      await flush(); // 处理异步操作

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

    it('should call api.lunarReturn with correct request data when isSolarReturn is false', fakeAsync(async () => {
      mockApiService.lunarReturn.mockReturnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      await flush(); // 处理异步操作

      expect(result).toEqual(mockLunarReturnHoroscopeData);

      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: mockProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));

    it('should use currentProcessData.date for process_date', fakeAsync(async () => {
      mockApiService.lunarReturn.mockReturnValue(
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

      await flush(); // 处理异步操作

      expect(result).toEqual(mockLunarReturnHoroscopeData);

      expect(mockApiService.lunarReturn).toHaveBeenCalledWith({
        native_date: mockHoroData.date,
        process_date: component.currentProcessData.date,
        geo: mockProcessData.geo,
        house: mockHoroData.house,
      });
    }));

    it('should calculate lunar return based on solar return data when isSolarReturn is true', fakeAsync(async () => {
      // 设置isSolarReturn为true
      component.currentProcessData.isSolarReturn = true;

      // 设置spy
      const getSolarReturnDataSpy =vi.spyOn(
        component as any,
        'getSolarReturnData'
      ).mockReturnValue(of(mockSolarReturnHoroscopeData).pipe(delay(0)));
      mockApiService.lunarReturn.mockReturnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      await flush(); // 处理异步操作

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

    it('should use currentProcessData.date for process_date when isSolarReturn is true', fakeAsync(async () => {
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
      const getSolarReturnDataSpy =vi.spyOn(
        component as any,
        'getSolarReturnData'
      ).mockReturnValue(of(mockSolarReturnHoroscopeData).pipe(delay(0)));
      mockApiService.lunarReturn.mockReturnValue(
        of(mockLunarReturnHoroscopeData).pipe(delay(0))
      );

      let result: ReturnHoroscope | undefined;
      (component as any)
        .getLunarReturnData()
        .subscribe((data: ReturnHoroscope) => {
          result = data;
        });

      await flush(); // 处理异步操作

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
