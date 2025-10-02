import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { NoteComponent } from './note.component';
import { ApiService } from 'src/app/services/api/api.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import {
  HoroscopeRecord,
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from 'src/app/type/interface/horo-admin/horoscope-record';
import { HoroRequest } from 'src/app/type/interface/request-data';

describe('NoteComponent', () => {
  let component: NoteComponent;
  let fixture: ComponentFixture<NoteComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockHoroStorageService: { horoData: any };
  let mockTitleService: jasmine.SpyObj<Title>;

  const initialHoroData: HoroRequest = {
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
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', [
      'getNativeById',
      'addNative',
      'updateNative',
    ]);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);

    mockHoroStorageService = {
      horoData: structuredClone(initialHoroData),
    };

    await TestBed.configureTestingModule({
      declarations: [NoteComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: HoroStorageService, useValue: mockHoroStorageService },
        { provide: Title, useValue: mockTitleService },
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
      component['loadNativeData'] = jasmine
        .createSpy('loadNativeData')
        .and.stub();
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
      expect(component.isLoading).toBeFalse();
    });

    it('should call api and set data on success', () => {
      const response: Partial<HoroscopeRecord> = {
        description: 'Test Description',
      };
      component.horoData = { ...component.horoData, id: 1 };
      mockApiService.getNativeById.and.returnValue(
        of(response as HoroscopeRecord)
      );
      component['loadNativeData']();
      expect(mockApiService.getNativeById).toHaveBeenCalledWith(1);
      expect(component.describe).toBe('Test Description');
      expect(component.initialDescribe).toBe('Test Description');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error on api failure', () => {
      const error = { message: 'Error' };
      component.horoData = { ...component.horoData, id: 1 };
      mockApiService.getNativeById.and.returnValue(throwError(() => error));
      component['loadNativeData']();
      expect(component.message).toBe('加载数据时出错: Error');
      expect(component.isAlertOpen).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    it('should add a new native record if id is 0', () => {
      const response: Partial<HoroscopeRecord> = { id: 123 };
      mockApiService.addNative.and.returnValue(of(response as HoroscopeRecord));
      component.horoData = { ...component.horoData, id: 0 };
      component.describe = 'New note';
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
      expect(component.initialDescribe).toBe('New note');
      expect(component.message).toBe('已新增记录');
      expect(component.isAlertOpen).toBeTrue();
    });

    it('should handle error when adding a new native record', () => {
      const error = { message: 'Add Error' };
      mockApiService.addNative.and.returnValue(throwError(() => error));
      component.horoData = { ...component.horoData, id: 0 };
      component.onSubmit();
      expect(component.message).toBe('保存数据时出错: Add Error');
      expect(component.isAlertOpen).toBeTrue();
    });

    it('should update an existing native record if id is not 0', () => {
      mockApiService.updateNative.and.returnValue(of(void 0));
      component.horoData = { ...component.horoData, id: 1 };
      component.describe = 'Updated note';
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
        location: null,
        description: 'Updated note',
        lock: null,
      };

      expect(mockApiService.updateNative).toHaveBeenCalledWith(
        1,
        expectedRequest
      );
      expect(component.initialDescribe).toBe('Updated note');
      expect(component.message).toBe('已更新记录');
      expect(component.isAlertOpen).toBeTrue();
    });

    it('should handle error when updating an existing native record', () => {
      const error = { message: 'Update Error' };
      mockApiService.updateNative.and.returnValue(throwError(() => error));
      component.horoData = { ...component.horoData, id: 1 };
      component.onSubmit();
      expect(component.message).toBe('保存数据时出错: Update Error');
      expect(component.isAlertOpen).toBeTrue();
    });
  });

  describe('isDescribeChanged', () => {
    it('should return false if describe has not changed', () => {
      component.describe = 'Same';
      component.initialDescribe = 'Same';
      expect(component.isDescribeChanged()).toBeFalse();
    });

    it('should return true if describe has changed', () => {
      component.describe = 'Changed';
      component.initialDescribe = 'Original';
      expect(component.isDescribeChanged()).toBeTrue();
    });
  });
});
