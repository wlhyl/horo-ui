import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { delay, of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { Horoconfig } from 'src/app/services/config/horo-config.service';
import { HoroStorageService } from 'src/app/services/horostorage/horostorage.service';
import { PlanetName } from 'src/app/type/enum/planet';
import { DateRequest, GeoRequest } from 'src/app/type/interface/request-data';
import { Direction, Promittor } from 'src/app/type/interface/response-data';
import { EW, NS } from 'src/app/horo-common/geo/enum';
import {
  createMockDateRequest,
  createMockGeoRequest,
  createMockDirection,
} from 'src/app/test-utils/test-data-factory.spec';
import { DateTimeComponent } from 'src/app/horo-common/date-time/date-time.component';

import { DirectionComponent } from './direction.component';

describe('DirectionComponent', () => {
  let component: DirectionComponent;
  let fixture: ComponentFixture<DirectionComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let horoconfigSpy: jasmine.SpyObj<Horoconfig>;

  const mockDateRequest: DateRequest = createMockDateRequest({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    second: 0,
    tz: 8,
    st: false,
  });

  const mockGeoRequest: GeoRequest = createMockGeoRequest({
    lat: 30,
    long: 120,
  });

  const mockHoroData = {
    date: mockDateRequest,
    geo: mockGeoRequest,
  };

  const mockDirectionData: Direction[] = [
    createMockDirection({
      significator: PlanetName.MC,
      promittor: { conjunction: PlanetName.Sun },
      arc: 45.5,
      date: {
        year: 2045,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        tz: 8,
      },
    }),
    createMockDirection({
      significator: PlanetName.ASC,
      promittor: { opposition: PlanetName.Moon },
      arc: -30.25,
      date: {
        year: 2030,
        month: 3,
        day: 10,
        hour: 8,
        minute: 15,
        second: 30,
        tz: 8,
      },
    }),
  ];

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['direction']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    horoconfigSpy = jasmine.createSpyObj('Horoconfig', [
      'planetFontFamily',
      'planetFontString',
      'aspectFontFamily',
      'aspectFontString',
      'zodiacFontFamily',
      'zodiacFontString',
    ]);

    const horoStorageSpy = jasmine.createSpyObj('HoroStorageService', [], {
      horoData: mockHoroData,
    });

    await TestBed.configureTestingModule({
      declarations: [DirectionComponent, DateTimeComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: HoroStorageService, useValue: horoStorageSpy },
        { provide: Horoconfig, useValue: horoconfigSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set the title to "主向推运"', () => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();

      expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('主向推运');
    });

    it('should initialize nativeDate, startDate, and endDate correctly', () => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();
      expect(component.nativeDate).toEqual(mockDateRequest);
      expect(component.startDate).toEqual(mockDateRequest);
      expect(component.endDate).toEqual({
        year: mockDateRequest.year + 120,
        month: mockDateRequest.month,
        day: mockDateRequest.day,
        hour: mockDateRequest.hour,
        minute: mockDateRequest.minute,
        second: mockDateRequest.second,
        tz: mockDateRequest.tz,
      });
    });

    it('should call api.direction with correct request data', () => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
      fixture.detectChanges();

      const expectedRequest = {
        native_date: mockDateRequest,
        geo: mockGeoRequest,
      };

      expect(apiServiceSpy.direction).toHaveBeenCalledWith(expectedRequest);
    });

    it('should set directionData on API success', () => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
      fixture.detectChanges();

      expect(component.directionData).toEqual(mockDirectionData);
      expect(component.isAlertOpen).toBeFalse();
    });

    it('should handle API error and show alert', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      apiServiceSpy.direction.and.returnValue(throwError(() => errorResponse));
      fixture.detectChanges();

      expect(component.directionData).toEqual([]);
      expect(component.message).toBe('API Error Internal Server Error');
      expect(component.isAlertOpen).toBeTrue();
    });
  });

  describe('getPromittorPlanet', () => {
    it('should return planet for conjunction', () => {
      const promittor: Promittor = { conjunction: PlanetName.Sun };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Sun);
    });

    it('should return planet for sinisterTrine', () => {
      const promittor: Promittor = { sinisterTrine: PlanetName.Moon };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Moon);
    });

    it('should return planet for dexterTrine', () => {
      const promittor: Promittor = { dexterTrine: PlanetName.Mars };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Mars);
    });

    it('should return planet for sinisterSextile', () => {
      const promittor: Promittor = { sinisterSextile: PlanetName.Venus };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Venus);
    });

    it('should return planet for dexterSextile', () => {
      const promittor: Promittor = { dexterSextile: PlanetName.Jupiter };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Jupiter);
    });

    it('should return planet for sinisterSquare', () => {
      const promittor: Promittor = { sinisterSquare: PlanetName.Saturn };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Saturn);
    });

    it('should return planet for dexterSquare', () => {
      const promittor: Promittor = { dexterSquare: PlanetName.Mercury };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Mercury);
    });

    it('should return planet for opposition', () => {
      const promittor: Promittor = { opposition: PlanetName.Mars };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Mars);
    });

    it('should return planet for term', () => {
      const promittor: Promittor = { term: [PlanetName.Jupiter, 15.5] };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Jupiter);
    });

    it('should return planet for antiscoins', () => {
      const promittor: Promittor = { antiscoins: PlanetName.Sun };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Sun);
    });

    it('should return planet for contraantiscias', () => {
      const promittor: Promittor = { contraantiscias: PlanetName.Moon };
      expect(component.getPromittorPlanet(promittor)).toBe(PlanetName.Moon);
    });
  });

  describe('getPromittorAspect', () => {
    it('should return aspect 0 with isLeft true for conjunction', () => {
      const promittor: Promittor = { conjunction: PlanetName.Sun };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 0,
        isLeft: true,
      });
    });
    it('should return aspect 120 with isLeft true for sinisterTrine', () => {
      const promittor: Promittor = { sinisterTrine: PlanetName.Moon };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 120,
        isLeft: true,
      });
    });
    it('should return aspect 120 with isLeft false for dexterTrine', () => {
      const promittor: Promittor = { dexterTrine: PlanetName.Mars };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 120,
        isLeft: false,
      });
    });
    it('should return aspect 60 with isLeft true for sinisterSextile', () => {
      const promittor: Promittor = { sinisterSextile: PlanetName.Venus };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 60,
        isLeft: true,
      });
    });
    it('should return aspect 60 with isLeft false for dexterSextile', () => {
      const promittor: Promittor = { dexterSextile: PlanetName.Jupiter };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 60,
        isLeft: false,
      });
    });
    it('should return aspect 90 with isLeft true for sinisterSquare', () => {
      const promittor: Promittor = { sinisterSquare: PlanetName.Saturn };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 90,
        isLeft: true,
      });
    });
    it('should return aspect 90 with isLeft false for dexterSquare', () => {
      const promittor: Promittor = { dexterSquare: PlanetName.Mercury };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 90,
        isLeft: false,
      });
    });
    it('should return aspect 180 with isLeft true for opposition', () => {
      const promittor: Promittor = { opposition: PlanetName.Mars };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 180,
        isLeft: true,
      });
    });
    it('should return null for term', () => {
      const promittor: Promittor = { term: [PlanetName.Jupiter, 15.5] };
      expect(component.getPromittorAspect(promittor)).toBeNull();
    });

    it('should return aspect 0 with isLeft true for antiscoins', () => {
      const promittor: Promittor = { antiscoins: PlanetName.Sun };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 0,
        isLeft: true,
      });
    });

    it('should return aspect 0 with isLeft true for contraantiscias', () => {
      const promittor: Promittor = { contraantiscias: PlanetName.Moon };
      expect(component.getPromittorAspect(promittor)).toEqual({
        aspect: 0,
        isLeft: true,
      });
    });
  });

  describe('getAntisciaInfo', () => {
    it('should return "Ant" for antiscoins', () => {
      const promittor: Promittor = { antiscoins: PlanetName.Sun };
      expect(component.getAntisciaInfo(promittor)).toBe('Ant');
    });

    it('should return "C-Ant" for contraantiscias', () => {
      const promittor: Promittor = { contraantiscias: PlanetName.Moon };
      expect(component.getAntisciaInfo(promittor)).toBe('C-Ant');
    });

    it('should return null for other promittor types', () => {
      const promittor: Promittor = { conjunction: PlanetName.Sun };
      expect(component.getAntisciaInfo(promittor)).toBeNull();
    });
  });

  describe('getTermInfo', () => {
    beforeEach(() => {
      horoconfigSpy.zodiacFontString.and.returnValue('♈');
    });
    it('should return zodiac and dms info for term promittor', () => {
      const promittor: Promittor = { term: [PlanetName.Jupiter, 15.5] };
      const result = component.getTermInfo(promittor);
      expect(result).not.toBeNull();
      expect(result?.zodiac).toBe('♈');
      expect(result?.dms).toBeDefined();
    });
    it('should return null for non-term promittor', () => {
      const promittor: Promittor = { conjunction: PlanetName.Sun };
      const result = component.getTermInfo(promittor);
      expect(result).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = {
        year: 2024,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 45,
      };
      const result = component.formatDate(date);
      expect(result).toBe('2024-06-15 10:30:45');
    });
    it('should pad single digit values with zeros', () => {
      const date = {
        year: 2024,
        month: 1,
        day: 5,
        hour: 3,
        minute: 7,
        second: 9,
      };
      const result = component.formatDate(date);
      expect(result).toBe('2024-01-05 03:07:09');
    });
  });

  describe('formatArc', () => {
    it('should format positive arc correctly', () => {
      const result = component.formatArc(45.5);
      expect(result).toContain('45');
      expect(result).toContain('°');
    });
    it('should format negative arc correctly with minus sign', () => {
      const result = component.formatArc(-30.25);
      expect(result).toContain('-');
      expect(result).toContain('30');
    });
  });

  describe('addYears', () => {
    it('should add years to date correctly', () => {
      const date = {
        year: 2000,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        tz: 8,
      };
      const result = component.addYears(date, 25);
      expect(result.year).toBe(2025);
      expect(result.month).toBe(6);
      expect(result.day).toBe(15);
      expect(result.hour).toBe(10);
      expect(result.minute).toBe(30);
      expect(result.second).toBe(0);
      expect(result.tz).toBe(8);
    });
  });

  describe('filteredDirectionData', () => {
    beforeEach(() => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
    });
    it('should return all data when no filters applied', () => {
      fixture.detectChanges();
      expect(component.filteredDirectionData.length).toBe(2);
    });
    it('should filter by significator', () => {
      fixture.detectChanges();
      component.selectedSignificators = [PlanetName.MC];
      const result = component.filteredDirectionData;
      expect(result.length).toBe(1);
      expect(result[0].significator).toBe(PlanetName.MC);
    });
    it('should filter by date range', () => {
      fixture.detectChanges();
      component.startDate = {
        year: 2040,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };
      component.endDate = {
        year: 2050,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        tz: 8,
      };
      const result = component.filteredDirectionData;
      expect(result.length).toBe(1);
      expect(result[0].date.year).toBe(2045);
    });
    it('should filter by both date range and significator', () => {
      fixture.detectChanges();
      component.startDate = {
        year: 2040,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };
      component.endDate = {
        year: 2050,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        tz: 8,
      };
      component.selectedSignificators = [PlanetName.MC];
      const result = component.filteredDirectionData;
      expect(result.length).toBe(1);
      expect(result[0].significator).toBe(PlanetName.MC);
      expect(result[0].date.year).toBe(2045);
    });
  });

  describe('checkDateRange', () => {
    beforeEach(() => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should return true for date within range', () => {
      component.startDate = {
        year: 2020,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };
      component.endDate = {
        year: 2030,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        tz: 8,
      };

      const date = {
        year: 2025,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        second: 0,
        tz: 8,
      };

      expect(component.checkDateRange(date)).toBeTrue();
    });

    it('should return false for date before start date', () => {
      component.startDate = {
        year: 2025,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };

      const date = {
        year: 2020,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        second: 0,
        tz: 8,
      };

      expect(component.checkDateRange(date)).toBeFalse();
    });

    it('should return false for date after end date', () => {
      component.endDate = {
        year: 2025,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        tz: 8,
      };

      const date = {
        year: 2030,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        second: 0,
        tz: 8,
      };

      expect(component.checkDateRange(date)).toBeFalse();
    });
  });

  describe('checkSignificator', () => {
    beforeEach(() => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should return true when no significators selected', () => {
      component.selectedSignificators = [];

      expect(component.checkSignificator(PlanetName.MC)).toBeTrue();
    });

    it('should return true when significator is in selected list', () => {
      component.selectedSignificators = [PlanetName.MC, PlanetName.ASC];

      expect(component.checkSignificator(PlanetName.MC)).toBeTrue();
    });

    it('should return false when significator is not in selected list', () => {
      component.selectedSignificators = [PlanetName.ASC];

      expect(component.checkSignificator(PlanetName.MC)).toBeFalse();
    });
  });

  describe('updateNativeDate', () => {
    beforeEach(() => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
      fixture.detectChanges();
    });

    it('should set isLoading to true immediately when updateNativeDate is called', () => {
      component.nativeDate = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        tz: 8,
        st: false,
      };

      component.updateNativeDate();

      expect(component.isLoading).toBe(true);
    });

    it('should preserve existing filter settings (startDate, endDate, selectedSignificators)', () => {
      const originalStartDate = { ...component.startDate };
      const originalEndDate = { ...component.endDate };
      component.selectedSignificators = [PlanetName.MC];

      component.nativeDate = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        tz: 8,
        st: false,
      };
      component.updateNativeDate();

      expect(component.startDate).toEqual(originalStartDate);
      expect(component.endDate).toEqual(originalEndDate);
      expect(component.selectedSignificators).toEqual([PlanetName.MC]);
    });

    it('should call fetchDirectionData after debounce', fakeAsync(() => {
      apiServiceSpy.direction.calls.reset();

      component.updateNativeDate();
      tick(300);

      expect(apiServiceSpy.direction).toHaveBeenCalled();
    }));
  });

  describe('onNativeDateChange', () => {
    it('should update nativeDate field', () => {
      component.nativeDate = createMockDateRequest();

      component.onNativeDateChange('year', 1995);

      expect(component.nativeDate.year).toBe(1995);
    });
  });

  describe('onStartDateChange', () => {
    it('should update startDate field', () => {
      component.startDate = {
        year: 2020,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };

      component.onStartDateChange('year', 2025);

      expect(component.startDate.year).toBe(2025);
    });
  });

  describe('onEndDateChange', () => {
    it('should update endDate field', () => {
      component.endDate = {
        year: 2030,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };

      component.onEndDateChange('year', 2040);

      expect(component.endDate.year).toBe(2040);
    });
  });

  describe('resetFilters', () => {
    beforeEach(() => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should reset startDate to nativeDate', () => {
      component.startDate = {
        year: 2050,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };

      component.resetFilters();

      expect(component.startDate).toEqual(component.nativeDate);
    });

    it('should reset endDate to nativeDate + 120 years', () => {
      component.endDate = {
        year: 2050,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };

      component.resetFilters();

      expect(component.endDate.year).toBe(component.nativeDate.year + 120);
    });

    it('should reset selectedSignificators to empty array', () => {
      component.selectedSignificators = [PlanetName.MC, PlanetName.ASC];

      component.resetFilters();

      expect(component.selectedSignificators).toEqual([]);
    });
  });

  describe('Component Properties', () => {
    it('should have correct initial alert properties', () => {
      expect(component.isAlertOpen).toBe(false);
      expect(component.alertButtons).toEqual(['OK']);
      expect(component.message).toBe('');
    });

    it('should have correct title', () => {
      expect(component.title).toBe('主向推运');
    });

    it('should have correct allSignificators', () => {
      expect(component.allSignificators).toEqual([
        PlanetName.ASC,
        PlanetName.MC,
        PlanetName.DSC,
        PlanetName.IC,
        PlanetName.Sun,
        PlanetName.Moon,
        PlanetName.Mercury,
        PlanetName.Venus,
        PlanetName.Mars,
        PlanetName.Jupiter,
        PlanetName.Saturn,
        PlanetName.NorthNode,
        PlanetName.SouthNode,
        PlanetName.PartOfFortune,
      ]);
    });

    it('should have empty directionData initially', () => {
      expect(component.directionData).toEqual([]);
    });

    it('should have isLoading initially set to false', () => {
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getSignificatorDisplayText', () => {
    it('should return "MC" for PlanetName.MC', () => {
      expect(component.getSignificatorDisplayText(PlanetName.MC)).toBe('MC');
    });

    it('should return "ASC" for PlanetName.ASC', () => {
      expect(component.getSignificatorDisplayText(PlanetName.ASC)).toBe('ASC');
    });

    it('should return "DSC" for PlanetName.DSC', () => {
      expect(component.getSignificatorDisplayText(PlanetName.DSC)).toBe('DSC');
    });

    it('should return "IC" for PlanetName.IC', () => {
      expect(component.getSignificatorDisplayText(PlanetName.IC)).toBe('IC');
    });

    it('should return sun symbol for PlanetName.Sun', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Sun)).toBe('☉');
    });

    it('should return moon symbol for PlanetName.Moon', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Moon)).toBe('☽');
    });

    it('should return part of fortune symbol for PlanetName.PartOfFortune', () => {
      expect(
        component.getSignificatorDisplayText(PlanetName.PartOfFortune),
      ).toBe('⊗');
    });

    it('should return mercury symbol for PlanetName.Mercury', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Mercury)).toBe(
        '☿',
      );
    });

    it('should return venus symbol for PlanetName.Venus', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Venus)).toBe('♀');
    });

    it('should return mars symbol for PlanetName.Mars', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Mars)).toBe('♂');
    });

    it('should return jupiter symbol for PlanetName.Jupiter', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Jupiter)).toBe(
        '♃',
      );
    });

    it('should return saturn symbol for PlanetName.Saturn', () => {
      expect(component.getSignificatorDisplayText(PlanetName.Saturn)).toBe('♄');
    });

    it('should return north node symbol for PlanetName.NorthNode', () => {
      expect(component.getSignificatorDisplayText(PlanetName.NorthNode)).toBe(
        '☊',
      );
    });

    it('should return south node symbol for PlanetName.SouthNode', () => {
      expect(component.getSignificatorDisplayText(PlanetName.SouthNode)).toBe(
        '☋',
      );
    });
  });

  describe('isLoading state', () => {
    it('should set isLoading to true when fetchDirectionData is called', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(
        of(mockDirectionData).pipe(delay(0)),
      );

      component.fetchDirectionData();

      expect(component.isLoading).toBe(true);

      tick(0);
      flush();
    }));

    it('should set isLoading to false after API success', () => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));

      component.fetchDirectionData();

      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading to false after API error', () => {
      const errorResponse = {
        message: 'API Error',
        error: { message: 'Internal Server Error' },
      };
      apiServiceSpy.direction.and.returnValue(throwError(() => errorResponse));

      component.fetchDirectionData();

      expect(component.isLoading).toBe(false);
    });

    it('should not call API if isLoading is already true', () => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
      component.isLoading = true;

      component.fetchDirectionData();

      expect(apiServiceSpy.direction).not.toHaveBeenCalled();
    });

    it('should set isLoading to true immediately when resetFilters is called', () => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();

      component.resetFilters();

      expect(component.isLoading).toBe(true);
    });

    it('should set isLoading to false after debounce and timeout when resetFilters is called', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();

      component.resetFilters();
      tick(300);
      tick(100);

      expect(component.isLoading).toBe(false);
    }));

    it('should reset startDate and endDate when resetFilters is called', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();

      component.startDate = {
        year: 2050,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        tz: 8,
      };
      component.resetFilters();
      tick(300);

      expect(component.startDate).toEqual(component.nativeDate);
      expect(component.endDate.year).toBe(component.nativeDate.year + 120);
    }));

    it('should not reset filters if isLoading is already true', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(of([]));
      fixture.detectChanges();
      component.isLoading = true;
      const originalStartDate = { ...component.startDate };

      component.resetFilters();
      tick(300);

      expect(component.startDate).toEqual(originalStartDate);
    }));

    it('should call fetchDirectionData after 300ms debounce when updateNativeDate is called', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(
        of(mockDirectionData).pipe(delay(0)),
      );
      fixture.detectChanges();
      tick(0);
      flush();
      apiServiceSpy.direction.calls.reset();

      component.updateNativeDate();
      tick(300);

      expect(apiServiceSpy.direction).toHaveBeenCalled();

      tick(0);
      flush();
    }));

    it('should preserve filter settings when updateNativeDate is called', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
      fixture.detectChanges();

      const originalStartDate = { ...component.startDate };
      const originalEndDate = { ...component.endDate };
      component.selectedSignificators = [PlanetName.MC];

      component.nativeDate = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        tz: 8,
        st: false,
      };
      component.updateNativeDate();
      tick(300);

      expect(component.startDate).toEqual(originalStartDate);
      expect(component.endDate).toEqual(originalEndDate);
      expect(component.selectedSignificators).toEqual([PlanetName.MC]);
    }));

    it('should not update data if isLoading is already true', fakeAsync(() => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
      fixture.detectChanges();
      component.isLoading = true;
      const originalStartDate = { ...component.startDate };
      component.nativeDate = {
        year: 1990,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        tz: 8,
        st: false,
      };

      component.updateNativeDate();
      tick(300);

      expect(component.startDate).toEqual(originalStartDate);
    }));
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('geo properties', () => {
    beforeEach(() => {
      apiServiceSpy.direction.and.returnValue(of(mockDirectionData));
    });

    it('should initialize geo from horoData on ngOnInit', () => {
      fixture.detectChanges();

      expect(component.geoLongD).toBe(120);
      expect(component.geoLatD).toBe(30);
    });

    it('should return correct geo object from geo getter', () => {
      fixture.detectChanges();

      const geo = component.geo;

      expect(geo.long).toBeCloseTo(120, 5);
      expect(geo.lat).toBeCloseTo(30, 5);
    });

    it('should handle negative longitude (west)', () => {
      fixture.detectChanges();

      component.geoLongD = 75;
      component.geoLongM = 30;
      component.geoLongS = 0;
      component.geoEW = EW.W;

      const geo = component.geo;

      expect(geo.long).toBeCloseTo(-75.5, 5);
    });

    it('should handle negative latitude (south)', () => {
      fixture.detectChanges();

      component.geoLatD = 33;
      component.geoLatM = 30;
      component.geoLatS = 0;
      component.geoNS = NS.S;

      const geo = component.geo;

      expect(geo.lat).toBeCloseTo(-33.5, 5);
    });

    it('should update geo values directly', () => {
      fixture.detectChanges();

      component.geoLongD = 100;
      component.geoLongM = 30;
      component.geoLongS = 45;

      expect(component.geoLongD).toBe(100);
      expect(component.geoLongM).toBe(30);
      expect(component.geoLongS).toBe(45);
    });

    it('should reset geo to original horoData values when resetFilters is called', () => {
      fixture.detectChanges();

      component.geoLongD = 50;
      component.geoLatD = 10;

      component.resetFilters();

      expect(component.geoLongD).toBe(120);
      expect(component.geoLatD).toBe(30);
    });

    it('should use updated geo in fetchDirectionData', () => {
      fixture.detectChanges();

      component.geoLongD = 100;
      component.geoLongM = 0;
      component.geoLongS = 0;
      apiServiceSpy.direction.calls.reset();

      component.fetchDirectionData();

      const requestArg = apiServiceSpy.direction.calls.mostRecent().args[0];
      expect(requestArg.geo.long).toBeCloseTo(100, 5);
    });
  });
});
