import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { PlanetName } from 'src/app/type/enum/planet';
import { DateRequest, GeoRequest } from 'src/app/type/interface/request-data';
import { FirdariaPeriod } from 'src/app/type/interface/response-data';
import { createMockDateRequest, createMockGeoRequest } from 'src/app/test-utils/test-data-factory.spec';

import { FirdariaComponent } from './firdaria.component';

describe('FirdariaComponent', () => {
  let component: FirdariaComponent;
  let fixture: ComponentFixture<FirdariaComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;

  const mockFirdariaData: FirdariaPeriod[] = [
    {
      period: PlanetName.Sun,
      sub_period: [],
    },
  ];

  const mockDateRequest: DateRequest = createMockDateRequest({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 0,
    st: false,
  });

  const mockGeoRequest: GeoRequest = createMockGeoRequest({
    lat: 0,
    long: 0,
  });

  const mockHoroData = {
    date: mockDateRequest,
    geo: mockGeoRequest,
  };

  beforeEach(waitForAsync(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['firdaria']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    const horoStorageSpy = jasmine.createSpyObj('HoroStorageService', [''], {
      horoData: mockHoroData,
    });

    TestBed.configureTestingModule({
      declarations: [FirdariaComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: HoroStorageService, useValue: horoStorageSpy },
        { provide: Horoconfig, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FirdariaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set the title, call api.firdaria with correct data, and set firdariaData on success', () => {
      apiServiceSpy.firdaria.and.returnValue(of(mockFirdariaData));
      fixture.detectChanges();

      expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('法达');

      const expectedRequest = {
        native_date: mockHoroData.date,
        geo: mockHoroData.geo,
      };

      expect(apiServiceSpy.firdaria).toHaveBeenCalledWith(expectedRequest);
      expect(component.firdariaData).toEqual(mockFirdariaData);
      expect(component.isAlertOpen).toBeFalse();
    });

    it('should handle error from api.firdaria', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      apiServiceSpy.firdaria.and.returnValue(throwError(() => errorResponse));
      fixture.detectChanges();

      expect(component.firdariaData).toEqual([]);
      expect(component.message).toBe('API Error Internal Server Error');
      expect(component.isAlertOpen).toBeTrue();
    });
  });
});
