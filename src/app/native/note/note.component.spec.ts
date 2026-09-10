import { createSpy, createSpyObj, expectAsync, type Spy, type SpyObj } from 'src/test-utils/spy';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { NoteComponent } from './note.component';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  ChartType,
  HoroscopeRecord,
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from 'src/app/type/interface/horo-admin/horoscope-record';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { createMockHoroRequest } from 'src/app/test-utils/test-data-factory.spec';

describe('NoteComponent', () => {
  let component: NoteComponent;
  let fixture: ComponentFixture<NoteComponent>;
  let mockApiService: SpyObj<ApiService>;
  let mockHoroStorageService: { horoData: any; eventData: any };
  let mockTitleService: SpyObj<Title>;
  let mockRouter: Pick<Router, 'url'>;

  const initialHoroData: HoroRequest = createMockHoroRequest({
    id: 0,
    name: 'Test User',
    sex: true, // male
    date: {
      year: 2000,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    },
    geo: {
      long: 120,
      lat: 30,
    },
    geo_name: 'Test City',
    house: 'Aquarius',
  });

  beforeEach(async () => {
    mockApiService = createSpyObj('ApiService', [
      'getNativeById',
      'addNative',
      'updateNative',
    ]);
    mockTitleService = createSpyObj('Title', ['setTitle']);

    mockHoroStorageService = {
      horoData: structuredClone(initialHoroData),
      eventData: structuredClone(initialHoroData),
    };
    mockRouter = { url: '/native/note' };

    TestBed.overrideComponent(NoteComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [NoteComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: HoroStorageService, useValue: mockHoroStorageService },
        { provide: Title, useValue: mockTitleService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set the title and call loadNativeData', () => {
      component['loadNativeData'] = createSpy('loadNativeData')
        .mockReturnValue(undefined);
      component.ngOnInit();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('笔记');
      expect(component['loadNativeData']).toHaveBeenCalled();
    });
  });

  describe('loadNativeData', () => {
    it('should not call api if horoData.id is 0', () => {
      component.horoData = { ...component.horoData, id: 0 };
      component['loadNativeData']();
      expect(mockApiService.getNativeById).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should call api and set data on success', () => {
      const response: Partial<HoroscopeRecord> = {
        description: 'Test Description',
      };
      component.horoData = { ...component.horoData, id: 1 };
      mockApiService.getNativeById.mockReturnValue(
        of(response as HoroscopeRecord)
      );
      component['loadNativeData']();
      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);
      expect(component.describe()).toBe('Test Description');
      expect(component.initialDescribe()).toBe('Test Description');
      expect(component.isLoading()).toBe(false);
    });

    it('should handle error on api failure', () => {
      const error = { message: 'Error' };
      component.horoData = { ...component.horoData, id: 1 };
      mockApiService.getNativeById.mockReturnValue(throwError(() => error));
      component['loadNativeData']();
      expect(component.message()).toBe('加载数据时出错: Error');
      expect(component.isAlertOpen()).toBe(true);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should add a new native record if id is 0', () => {
      const response: Partial<HoroscopeRecord> = { id: 123 };
      mockApiService.addNative.mockReturnValue(of(response as HoroscopeRecord));
      component.horoData = { ...component.horoData, id: 0 };
      component.describe.set('New note');
      component.onSubmit();

      const expectedRequest: HoroscopeRecordRequest = {
        name: 'Test User',
        gender: true,
        birth_year: 2000,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 12,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        chart_type: ChartType.Natal,
        is_time_precise: false,
        location: {
          name: 'Test City',
          is_east: true,
          longitude_degree: 120,
          longitude_minute: 0,
          longitude_second: 0,
          is_north: true,
          latitude_degree: 30,
          latitude_minute: 0,
          latitude_second: 0,
        },
        description: 'New note',
        lock: false,
      };

      expect(mockApiService.addNative).toHaveBeenCalledWith(expectedRequest);
      expect(component.horoData.id).toBe(123);
      expect(component.initialDescribe()).toBe('New note');
      expect(component.message()).toBe('已新增记录');
      expect(component.isAlertOpen()).toBe(true);
    });

    it('should handle error when adding a new native record', () => {
      const error = { message: 'Add Error' };
      mockApiService.addNative.mockReturnValue(throwError(() => error));
      component.horoData = { ...component.horoData, id: 0 };
      component.onSubmit();
      expect(component.message()).toBe('保存数据时出错: Add Error');
      expect(component.isAlertOpen()).toBe(true);
    });

    it('should update an existing native record if id is not 0', () => {
      mockApiService.updateNative.mockReturnValue(of(void 0));
      component.horoData = { ...component.horoData, id: 1 };
      component.describe.set('Updated note');
      component.onSubmit();

      const expectedRequest: UpdateHoroscopeRecordRequest = {
        name: null,
        gender: null,
        birth_year: null,
        birth_month: null,
        birth_day: null,
        birth_hour: null,
        birth_minute: null,
        birth_second: null,
        time_zone_offset: null,
        is_dst: null,
        chart_type: null,
        is_time_precise: null,
        location: null,
        description: 'Updated note',
        lock: null,
      };

      expect(mockApiService.updateNative).toHaveBeenCalledWith(
        1,
        expectedRequest
      );
      expect(component.initialDescribe()).toBe('Updated note');
      expect(component.message()).toBe('已更新记录');
      expect(component.isAlertOpen()).toBe(true);
    });

    it('should handle error when updating an existing native record', () => {
      const error = { message: 'Update Error' };
      mockApiService.updateNative.mockReturnValue(throwError(() => error));
      component.horoData = { ...component.horoData, id: 1 };
      component.onSubmit();
      expect(component.message()).toBe('保存数据时出错: Update Error');
      expect(component.isAlertOpen()).toBe(true);
    });
  });

  describe('isDescribeChanged', () => {
    it('should return false if describe has not changed', () => {
      component.describe.set('Same');
      component.initialDescribe.set('Same');
      expect(component.isDescribeChanged()).toBe(false);
    });

    it('should return true if describe has changed', () => {
      component.describe.set('Changed');
      component.initialDescribe.set('Original');
      expect(component.isDescribeChanged()).toBe(true);
    });
  });
});
