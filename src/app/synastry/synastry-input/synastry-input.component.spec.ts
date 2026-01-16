import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SynastryInputComponent } from './synastry-input.component';
import { HoroStorageService } from '../../services/horostorage/horostorage.service';
import { Path as subPath } from '../enum/path';
import { Horoconfig } from '../../services/config/horo-config.service';
import { HoroRequest } from '../../type/interface/request-data';
import {
  createMockHoroRequest,
  createMockDateRequest,
  createMockGeoRequest,
} from '../../test-utils/test-data-factory.spec';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HoroCommonModule } from '../../horo-common/horo-common.module';
import { RouterModule } from '@angular/router';

describe('SynastryInputComponent', () => {
  let component: SynastryInputComponent;
  let fixture: ComponentFixture<SynastryInputComponent>;
  let horoStorageServiceSpy: jasmine.SpyObj<HoroStorageService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let routerSpy: jasmine.SpyObj<Router>;
  let configServiceSpy: jasmine.SpyObj<Horoconfig>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

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
});
