import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController, ModalController } from '@ionic/angular';
import { ArchiveSelectorComponent } from './archive-selector.component';
import { HoroRequest } from 'src/app/type/interface/request-data';
import { createMockHoroscopeRecord, createMockLocationRecord } from '../../test-utils/test-data-factory.spec';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HoroscopeRecord } from 'src/app/type/interface/horo-admin/horoscope-record';
import { By } from '@angular/platform-browser';

describe('ArchiveSelectorComponent', () => {
  let component: ArchiveSelectorComponent;
  let fixture: ComponentFixture<ArchiveSelectorComponent>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockDefaultHouse = 'Placidus';

  beforeEach(async () => {
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', [
      'create',
      'present',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuth: true,
    });

    await TestBed.configureTestingModule({
      declarations: [ArchiveSelectorComponent],
      providers: [
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveSelectorComponent);
    component = fixture.componentInstance;
    component.defaultHouse = mockDefaultHouse;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectFromArchive', () => {
    it('should show alert and not open modal when user is not logged in', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => false,
        configurable: true,
      });

      const mockAlert = {
        present: jasmine.createSpy('present'),
      } as any;
      alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert));

      await component.selectFromArchive();

      expect(alertControllerSpy.create).toHaveBeenCalledWith({
        header: '提示',
        message: '请先登录后再从档案库选择记录',
        buttons: ['确定'],
      });
      expect(mockAlert.present).toHaveBeenCalled();
      expect(modalControllerSpy.create).not.toHaveBeenCalled();
    });

    it('should open modal and emit horoRequestSelected when user is logged in', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => true,
        configurable: true,
      });

      const mockRecord: HoroscopeRecord = createMockHoroscopeRecord({
        id: 100,
        name: 'Test User',
        gender: true,
        birth_year: 1990,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 12,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        location: createMockLocationRecord({
          id: 1,
          name: 'Beijing',
          is_east: true,
          longitude_degree: 116,
          longitude_minute: 24,
          longitude_second: 0,
          is_north: true,
          latitude_degree: 39,
          latitude_minute: 54,
          latitude_second: 0,
        }),
        description: '',
        created_at: '',
        updated_at: null,
        lock: false,
      });

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: () => Promise.resolve({ data: mockRecord }),
      } as any;
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));

      let result: HoroRequest | undefined;

      component.horoRequestSelected.subscribe((data) => {
        result = data;
      });

      await component.selectFromArchive();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result!.id).toBe(mockRecord.id);
      expect(result!.name).toBe(mockRecord.name);
      expect(result!.sex).toBe(mockRecord.gender);
      expect(result!.house).toBe(mockDefaultHouse);
    });

    it('should emit horoRequestSelected with correct data for female user', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => true,
        configurable: true,
      });

      const mockRecord: HoroscopeRecord = createMockHoroscopeRecord({
        id: 200,
        name: 'Female User',
        gender: false,
        birth_year: 1985,
        birth_month: 6,
        birth_day: 15,
        birth_hour: 8,
        birth_minute: 30,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        location: createMockLocationRecord({
          id: 2,
          name: 'Shanghai',
          is_east: true,
          longitude_degree: 121,
          longitude_minute: 28,
          longitude_second: 0,
          is_north: true,
          latitude_degree: 31,
          latitude_minute: 14,
          latitude_second: 0,
        }),
        description: '',
        created_at: '',
        updated_at: null,
        lock: false,
      });

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: () => Promise.resolve({ data: mockRecord }),
      } as any;
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));

      let result: HoroRequest | undefined;
      component.horoRequestSelected.subscribe((data) => {
        result = data;
      });

      await component.selectFromArchive();

      expect(result!.sex).toBe(false);
      expect(result!.geo_name).toBe('Shanghai');
      expect(result!.house).toBe(mockDefaultHouse);
    });
  });

  describe('selectFromArchive error handling', () => {
    it('should not emit when modal dismissed without data', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => true,
        configurable: true,
      });

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: () => Promise.resolve({ data: null }),
      } as any;
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));

      let emitCalled = false;
      component.horoRequestSelected.subscribe(() => {
        emitCalled = true;
      });

      await component.selectFromArchive();

      expect(emitCalled).toBe(false);
    });

    it('should create modal with correct parameters when selecting from archive', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => true,
        configurable: true,
      });

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: () => Promise.resolve({ data: null }),
      } as any;
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));

      await component.selectFromArchive();

      expect(modalControllerSpy.create).toHaveBeenCalledWith({
        component: jasmine.any(Function),
        breakpoints: [0, 0.5, 1],
        initialBreakpoint: 1,
        backdropDismiss: false,
      });
    });
  });

  describe('convertRecordToHoroRequest', () => {
    it('should correctly convert HoroscopeRecord with east and north coordinates', () => {
      const record: HoroscopeRecord = createMockHoroscopeRecord({
        id: 100,
        name: 'Test User',
        gender: true,
        birth_year: 1990,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 12,
        birth_minute: 30,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        location: createMockLocationRecord({
          id: 1,
          name: 'Beijing',
          is_east: true,
          longitude_degree: 116,
          longitude_minute: 24,
          longitude_second: 0,
          is_north: true,
          latitude_degree: 39,
          latitude_minute: 54,
          latitude_second: 0,
        }),
        description: '',
        created_at: '',
        updated_at: null,
        lock: false,
      });

      const result = (component as any).convertRecordToHoroRequest(record);

      expect(result.id).toBe(100);
      expect(result.name).toBe('Test User');
      expect(result.sex).toBe(true);
      expect(result.geo.long).toBeCloseTo(116.4, 1);
      expect(result.geo.lat).toBeCloseTo(39.9, 1);
      expect(result.geo_name).toBe('Beijing');
      expect(result.house).toBe(mockDefaultHouse);
      expect(result.date.year).toBe(1990);
      expect(result.date.month).toBe(1);
      expect(result.date.day).toBe(1);
      expect(result.date.hour).toBe(12);
      expect(result.date.minute).toBe(30);
      expect(result.date.tz).toBe(8);
      expect(result.date.st).toBe(false);
    });

    it('should correctly convert HoroscopeRecord with west and south coordinates', () => {
      const record: HoroscopeRecord = createMockHoroscopeRecord({
        id: 200,
        name: 'New York User',
        gender: false,
        birth_year: 1995,
        birth_month: 6,
        birth_day: 15,
        birth_hour: 14,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: -5,
        is_dst: true,
        location: createMockLocationRecord({
          id: 2,
          name: 'New York',
          is_east: false,
          longitude_degree: 74,
          longitude_minute: 0,
          longitude_second: 0,
          is_north: false,
          latitude_degree: 40,
          latitude_minute: 43,
          latitude_second: 0,
        }),
        description: '',
        created_at: '',
        updated_at: null,
        lock: false,
      });

      const result = (component as any).convertRecordToHoroRequest(record);

      expect(result.geo.long).toBeCloseTo(-74, 1);
      expect(result.geo.lat).toBeCloseTo(-40.72, 1);
      expect(result.date.st).toBe(true);
      expect(result.sex).toBe(false);
    });

    it('should handle record with null name', () => {
      const record: HoroscopeRecord = createMockHoroscopeRecord({
        id: 300,
        name: null as any,
        gender: true,
        birth_year: 2000,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 0,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 0,
        is_dst: false,
        location: createMockLocationRecord({
          id: 3,
          name: 'London',
          is_east: true,
          longitude_degree: 0,
          longitude_minute: 7,
          longitude_second: 0,
          is_north: true,
          latitude_degree: 51,
          latitude_minute: 30,
          latitude_second: 0,
        }),
        description: '',
        created_at: '',
        updated_at: null,
        lock: false,
      });

      const result = (component as any).convertRecordToHoroRequest(record);

      expect(result.name).toBe('');
    });

    it('should use defaultHouse from component input', () => {
      const record: HoroscopeRecord = createMockHoroscopeRecord({
        id: 400,
        name: 'Test',
        gender: true,
        birth_year: 2000,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 0,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 0,
        is_dst: false,
        location: createMockLocationRecord({
          id: 4,
          name: 'Tokyo',
          is_east: true,
          longitude_degree: 139,
          longitude_minute: 46,
          longitude_second: 0,
          is_north: true,
          latitude_degree: 35,
          latitude_minute: 41,
          latitude_second: 0,
        }),
        description: '',
        created_at: '',
        updated_at: null,
        lock: false,
      });

      const result = (component as any).convertRecordToHoroRequest(record);

      expect(result.house).toBe(mockDefaultHouse);
    });
  });

  describe('template interaction', () => {
    it('should call selectFromArchive when button is clicked', async () => {
      spyOn(component, 'selectFromArchive');
      const button = fixture.debugElement.query(
        By.css('ion-button')
      ).nativeElement;

      button.click();
      fixture.detectChanges();

      expect(component.selectFromArchive).toHaveBeenCalled();
    });
  });
});
