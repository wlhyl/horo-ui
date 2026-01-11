import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SynastryInputComponent } from './synastry-input.component';
import { HoroStorageService } from '../../services/horostorage/horostorage.service';
import { Path } from '../../type/enum/path';
import { Path as subPath } from '../enum/path';
import { Horoconfig } from '../../services/config/horo-config.service';
import { HoroRequest } from '../../type/interface/request-data';
import {
  createMockHoroRequest,
  createMockDateRequest,
  createMockGeoRequest,
  createMockHoroscopeRecord,
  createMockLocationRecord,
} from '../../test-utils/test-data-factory.spec';
import {
  AlertController,
  IonicModule,
  ModalController,
  NavController,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HoroCommonModule } from '../../horo-common/horo-common.module';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { HoroscopeRecord } from '../../type/interface/horo-admin/horoscope-record';

describe('SynastryInputComponent', () => {
  let component: SynastryInputComponent;
  let fixture: ComponentFixture<SynastryInputComponent>;
  let horoStorageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let routerSpy: jasmine.SpyObj<Router>;
  let configServiceSpy: jasmine.SpyObj<Horoconfig>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let modalControllerSpy: jasmine.SpyObj<any>;

  const mockOriginalHoroData: HoroRequest = createMockHoroRequest({
    id: 1,
    name: 'Original User',
    sex: true,
    house: 'Placidus',
    date: createMockDateRequest({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
    }),
    geo_name: 'Beijing',
    geo: createMockGeoRequest({
      long: 116.4,
      lat: 39.9,
    }),
  });

  const mockComparisonHoroData: HoroRequest = createMockHoroRequest({
    id: 2,
    name: 'Comparison User',
    sex: false,
    house: 'Alcabitus',
    date: createMockDateRequest({
      year: 1995,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      tz: -5,
      st: false,
    }),
    geo_name: 'New York',
    geo: createMockGeoRequest({
      long: -74.0,
      lat: 40.7,
    }),
  });

  const mockHouses = [
    'Placidus',
    'Koch',
    'Campanus',
    'Alcabitus',
    'Whole Sign',
  ];

  const activatedRouteStub = {
    snapshot: {
      paramMap: new Map(),
      queryParamMap: new Map(),
    },
    paramMap: { of: () => new Map() },
    queryParams: { of: () => ({}) },
    url: { of: () => [] },
  };

  beforeEach(async () => {
    horoStorageServiceSpy = jasmine.createSpyObj('HoroStorageService', [''], {
      horoData: mockOriginalHoroData,
      synastryData: mockComparisonHoroData,
    });

    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    routerSpy = jasmine.createSpyObj('Router', [
      'navigate',
      'createUrlTree',
      'serializeUrl',
    ]);
    configServiceSpy = jasmine.createSpyObj('Horoconfig', [''], {
      houses: mockHouses,
    });
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateBack']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuth: true,
    });
    modalControllerSpy = jasmine.createSpyObj('ModalController', [
      'create',
      'present',
    ]);

    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('url');

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        HoroCommonModule,
        RouterModule.forRoot([]),
      ],
      declarations: [SynastryInputComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HoroStorageService, useValue: horoStorageServiceSpy },
        { provide: Horoconfig, useValue: configServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SynastryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title on init', () => {
    component.ngOnInit();
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('合盘信息输入');
  });

  it('should get originalHoroData from storage.horoData when entering the component', () => {
    const horoData: HoroRequest = createMockHoroRequest({
      id: 10,
    });

    const horoDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )!.get as jasmine.Spy;
    horoDataGetterSpy.and.returnValue(horoData);

    fixture = TestBed.createComponent(SynastryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(horoDataGetterSpy).toHaveBeenCalled();
    expect(component.originalHoroData).toEqual(horoData);
    expect(component.originalHoroData).not.toBe(horoData);
  });

  it('should get comparisonHoroData from storage.synastryData when entering the component', () => {
    const saveynastryData: HoroRequest = createMockHoroRequest({
      id: 20,
    });

    const synastryDataGetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'synastryData'
    )!.get as jasmine.Spy;
    synastryDataGetterSpy.and.returnValue(saveynastryData);

    fixture = TestBed.createComponent(SynastryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(synastryDataGetterSpy).toHaveBeenCalled();
    expect(component.comparisonHoroData).toEqual(saveynastryData);
    expect(component.comparisonHoroData).not.toBe(saveynastryData);
  });

  it('should swap originalHoroData and comparisonHoroData when swapHoroData is called', () => {
    const original = component.originalHoroData;
    const comparison = component.comparisonHoroData;

    component.swapHoroData();

    expect(component.originalHoroData).toBe(comparison);
    expect(component.comparisonHoroData).toBe(original);
  });

  it('should navigate to Horo subpath when getSynastry is called', () => {
    component.getSynastry();

    expect(routerSpy.navigate).toHaveBeenCalledWith([subPath.Horo], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });

  it('should save originalHoroData to storage.horoData when getSynastry is called', () => {
    const originalDataBefore = component.originalHoroData;

    component.getSynastry();

    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )!.set as jasmine.Spy;
    expect(horoDataSetterSpy).toHaveBeenCalled();
    const savedData = horoDataSetterSpy.calls.mostRecent().args[0];
    expect(savedData).toEqual(originalDataBefore);
  });

  it('should save comparisonHoroData to storage.synastryData with original house when getSynastry is called', () => {
    const comparisonDataBefore = component.comparisonHoroData;
    const originalHouse = component.originalHoroData.house;

    component.getSynastry();

    const synastryDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'synastryData'
    )!.set as jasmine.Spy;
    expect(synastryDataSetterSpy).toHaveBeenCalled();
    const savedData = synastryDataSetterSpy.calls.mostRecent().args[0];
    expect(savedData).toEqual({
      ...comparisonDataBefore,
      house: originalHouse,
    });
  });

  it('should have correct path property', () => {
    expect(component.path).toBe(Path);
  });

  it('should have correct subPath property', () => {
    expect(component.subPath).toBe(subPath);
  });

  it('should have correct houses property from config', () => {
    expect(component.houses).toBe(mockHouses);
  });

  it('should not affect storage.horoData when modifying originalHoroData', () => {
    const originalName = component.originalHoroData.name;
    const originalSex = component.originalHoroData.sex;

    component.originalHoroData.name = 'Modified Name';
    component.originalHoroData.sex = false;

    expect(horoStorageServiceSpy.horoData.name).toBe(originalName);
    expect(horoStorageServiceSpy.horoData.sex).toBe(originalSex);
    expect(horoStorageServiceSpy.horoData).not.toBe(component.originalHoroData);
  });

  it('should not affect storage.synastryData when modifying comparisonHoroData', () => {
    const originalName = component.comparisonHoroData.name;
    const originalSex = component.comparisonHoroData.sex;

    component.comparisonHoroData.name = 'Modified Comparison';
    component.comparisonHoroData.sex = true;

    expect(horoStorageServiceSpy.synastryData.name).toBe(originalName);
    expect(horoStorageServiceSpy.synastryData.sex).toBe(originalSex);
    expect(horoStorageServiceSpy.synastryData).not.toBe(
      component.comparisonHoroData
    );
  });

  it('should store different objects in storage when calling getSynastry', () => {
    component.originalHoroData.name = 'Test Original';
    component.comparisonHoroData.name = 'Test Comparison';

    component.getSynastry();

    const horoDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'horoData'
    )!.set as jasmine.Spy;
    const synastryDataSetterSpy = Object.getOwnPropertyDescriptor(
      horoStorageServiceSpy,
      'synastryData'
    )!.set as jasmine.Spy;

    const storedOriginal = horoDataSetterSpy.calls.mostRecent().args[0];
    expect(storedOriginal).not.toBe(component.originalHoroData);
    expect(storedOriginal.name).toBe('Test Original');

    const storedComparison = synastryDataSetterSpy.calls.mostRecent().args[0];
    expect(storedComparison).not.toBe(component.comparisonHoroData);
    expect(storedComparison.name).toBe('Test Comparison');
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

      await component.selectFromArchive(true);

      expect(alertControllerSpy.create).toHaveBeenCalledWith({
        header: '提示',
        message: '请先登录后再从档案库选择记录',
        buttons: ['确定'],
      });
      expect(mockAlert.present).toHaveBeenCalled();
      expect(modalControllerSpy.create).not.toHaveBeenCalled();
      expect(modalControllerSpy.present).not.toHaveBeenCalled();
    });

    it('should open modal and update comparisonHoroData when user is logged in', async () => {
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

      await component.selectFromArchive(false);

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
      expect(component.comparisonHoroData.id).toBe(mockRecord.id);
      expect(component.comparisonHoroData.name).toBe(mockRecord.name);
      expect(component.comparisonHoroData.sex).toBe(mockRecord.gender);
      expect(component.comparisonHoroData.house).toBe(
        component.originalHoroData.house
      );
    });

    it('should update originalHoroData when selecting from archive for original', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => true,
        configurable: true,
      });

      const mockRecord: HoroscopeRecord = createMockHoroscopeRecord({
        id: 200,
        name: 'Archive User',
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

      const originalHouse = component.originalHoroData.house;

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: () => Promise.resolve({ data: mockRecord }),
      } as any;
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));

      await component.selectFromArchive(true);

      expect(component.originalHoroData.id).toBe(mockRecord.id);
      expect(component.originalHoroData.name).toBe(mockRecord.name);
      expect(component.originalHoroData.sex).toBe(mockRecord.gender);
      expect(component.originalHoroData.house).toBe(originalHouse);
    });
  });

  describe('multiple swaps', () => {
    it('should handle multiple swapHoroData calls correctly', () => {
      const originalName = component.originalHoroData.name;
      const comparisonName = component.comparisonHoroData.name;

      component.swapHoroData();
      expect(component.originalHoroData.name).toBe(comparisonName);

      component.swapHoroData();
      expect(component.originalHoroData.name).toBe(originalName);
    });
  });

  describe('selectFromArchive error handling', () => {
    it('should not update data when modal dismissed without data', async () => {
      Object.defineProperty(authServiceSpy, 'isAuth', {
        get: () => true,
        configurable: true,
      });

      const originalId = component.comparisonHoroData.id;
      const originalName = component.comparisonHoroData.name;

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: () => Promise.resolve({ data: null }),
      } as any;
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));

      await component.selectFromArchive(false);

      expect(component.comparisonHoroData.id).toBe(originalId);
      expect(component.comparisonHoroData.name).toBe(originalName);
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

      await component.selectFromArchive(false);

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
      expect(result.house).toBe(component.originalHoroData.house);
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
  });
});
