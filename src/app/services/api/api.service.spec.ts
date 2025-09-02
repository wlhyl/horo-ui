import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';
import {
  HoroRequest,
  ProfectionRequest,
  ReturnRequest,
  HoroscopeComparisonRequest,
  FirdariaRequest,
  QiZhengRequst,
} from 'src/app/type/interface/request-data';
import {
  FirdariaPeriod,
  Horoscope,
  HoroscopeComparison,
  Profection,
  ReturnHoroscope,
} from 'src/app/type/interface/response-data';
import { Horoscope as QiZhengHoroscope } from 'src/app/type/interface/response-qizheng';
import { UpdateUserRequest } from '../../type/interface/user';
import { PageResponser } from '../../type/interface/page';
import {
  HoroscopeRecord,
  HoroscopeRecordRequest,
  UpdateHoroscopeRecordRequest,
} from '../../type/interface/horo-admin/horoscope-record';
import { LongLatResponse } from 'src/app/type/interface/horo-admin/longLat-response';
import {
  PlanetName as WesternPlanetName,
  PlanetSpeedState as WesternPlanetSpeedState,
} from 'src/app/type/enum/planet';
import {
  PlanetName as ChinesePlanetName,
  LunarMansionsName,
  PlanetSpeedState as ChinesePlanetSpeedState,
} from 'src/app/type/enum/qizheng';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHouses', () => {
    it('should return an array of houses', () => {
      const mockHouses = ['House 1', 'House 2', 'House 3'];

      service.getHouses().subscribe((houses) => {
        expect(houses).toEqual(mockHouses);
      });

      const req = httpMock.expectOne(`${environment.base_url}/api/houses`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHouses);
    });
  });

  describe('getNativeHoroscope', () => {
    it('should return a native horoscope', () => {
      const mockData: HoroRequest = {
        id: 1,
        date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo_name: 'Beijing',
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house: 'Placidus',
        name: 'Test',
        sex: true,
      };

      const mockHoroscope: Horoscope = {
        date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house_name: 'Placidus',
        houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
        asc: {
          name: WesternPlanetName.ASC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        mc: {
          name: WesternPlanetName.MC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        dsc: {
          name: WesternPlanetName.DSC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        ic: {
          name: WesternPlanetName.IC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        planets: [],
        is_diurnal: true,
        planetary_day: WesternPlanetName.Sun,
        planetary_hours: WesternPlanetName.Moon,
        aspects: [],
        antiscoins: [],
        contraantiscias: [],
      };

      service.getNativeHoroscope(mockData).subscribe((horoscope) => {
        expect(horoscope).toEqual(mockHoroscope);
      });

      const req = httpMock.expectOne(`${environment.base_url}/api/horo/native`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockHoroscope);
    });
  });

  describe('profection', () => {
    it('should return a profection', () => {
      const mockData: ProfectionRequest = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
      };

      const mockProfection: Profection = {
        year_house: 1,
        month_house: 2,
        day_house: 3,
        date_per_house: [],
      };

      service.profection(mockData).subscribe((profection) => {
        expect(profection).toEqual(mockProfection);
      });

      const req = httpMock.expectOne(
        `${environment.base_url}/api/process/profection`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockProfection);
    });
  });

  describe('firdaria', () => {
    it('should return firdaria periods', () => {
      const mockData: FirdariaRequest = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
      };

      const mockPeriods: FirdariaPeriod[] = [];

      service.firdaria(mockData).subscribe((periods) => {
        expect(periods).toEqual(mockPeriods);
      });

      const req = httpMock.expectOne(
        `${environment.base_url}/api/process/firdaria`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockPeriods);
    });
  });

  describe('compare', () => {
    it('should return a horoscope comparison', () => {
      const mockData: HoroscopeComparisonRequest = {
        original_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        comparison_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        original_geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        comparison_geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house: 'Placidus',
      };

      const mockComparison: HoroscopeComparison = {
        original_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        comparison_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        original_geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        comparison_geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house_name: 'Placidus',
        houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
        original_asc: {
          name: WesternPlanetName.ASC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        comparison_asc: {
          name: WesternPlanetName.ASC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        original_mc: {
          name: WesternPlanetName.MC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        comparison_mc: {
          name: WesternPlanetName.MC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        original_dsc: {
          name: WesternPlanetName.DSC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        comparison_dsc: {
          name: WesternPlanetName.DSC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        original_ic: {
          name: WesternPlanetName.IC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        comparison_ic: {
          name: WesternPlanetName.IC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        original_planets: [],
        comparison_planets: [],
        aspects: [],
        antiscoins: [],
        contraantiscias: [],
      };

      service.compare(mockData).subscribe((comparison) => {
        expect(comparison).toEqual(mockComparison);
      });

      const req = httpMock.expectOne(
        `${environment.base_url}/api/process/compare`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockComparison);
    });
  });

  describe('solarReturn', () => {
    it('should return a solar return horoscope', () => {
      const mockData: ReturnRequest = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house: 'Placidus',
      };

      const mockReturn: ReturnHoroscope = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        return_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house_name: 'Placidus',
        houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
        asc: {
          name: WesternPlanetName.ASC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        mc: {
          name: WesternPlanetName.MC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        dsc: {
          name: WesternPlanetName.DSC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        ic: {
          name: WesternPlanetName.IC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        planets: [],
        aspects: [],
        antiscoins: [],
        contraantiscias: [],
      };

      service.solarReturn(mockData).subscribe((returnHoroscope) => {
        expect(returnHoroscope).toEqual(mockReturn);
      });

      const req = httpMock.expectOne(
        `${environment.base_url}/api/process/return/solar`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockReturn);
    });
  });

  describe('lunarReturn', () => {
    it('should return a lunar return horoscope', () => {
      const mockData: ReturnRequest = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house: 'Placidus',
      };

      const mockReturn: ReturnHoroscope = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        return_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        house_name: 'Placidus',
        houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
        asc: {
          name: WesternPlanetName.ASC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        mc: {
          name: WesternPlanetName.MC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        dsc: {
          name: WesternPlanetName.DSC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        ic: {
          name: WesternPlanetName.IC,
          long: 0,
          lat: 0,
          speed: 0,
          ra: 0,
          dec: 0,
          orb: 0,
          speed_state: WesternPlanetSpeedState.均,
        },
        planets: [],
        aspects: [],
        antiscoins: [],
        contraantiscias: [],
      };

      service.lunarReturn(mockData).subscribe((returnHoroscope) => {
        expect(returnHoroscope).toEqual(mockReturn);
      });

      const req = httpMock.expectOne(
        `${environment.base_url}/api/process/return/lunar`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockReturn);
    });
  });

  describe('qizheng', () => {
    it('should return a qizheng horoscope', () => {
      const mockData: QiZhengRequst = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
          st: false,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
      };

      const mockHoroscope: QiZhengHoroscope = {
        native_date: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        process_date: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          second: 0,
          tz: 8,
        },
        geo: {
          long: 116.4074,
          lat: 39.9042,
        },
        native_planets: [],
        process_planets: [],
        distance_star_long: [],
        asc_house: {
          asc_long: 0,
          xiu: LunarMansionsName.角,
          xiu_degree: 0,
        },
        houses: [],
        native_lunar_calendar: {
          is_lean_year: false,
          lunar_year: '',
          lunar_month: '',
          lunar_day: '',
          lunar_year_gan_zhi: '',
          lunar_month_gan_zhi: '',
          lunar_day_gan_zhi: '',
          time_gan_zhi: '',
          solar_term_first: {
            name: '',
            year: 0,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
          },
          solar_term_second: {
            name: '',
            year: 0,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
          },
        },
        process_lunar_calendar: {
          is_lean_year: false,
          lunar_year: '',
          lunar_month: '',
          lunar_day: '',
          lunar_year_gan_zhi: '',
          lunar_month_gan_zhi: '',
          lunar_day_gan_zhi: '',
          time_gan_zhi: '',
          solar_term_first: {
            name: '',
            year: 0,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
          },
          solar_term_second: {
            name: '',
            year: 0,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
          },
        },
        bazi: [],
        dong_wei: {
          long_of_per_year: [],
          long: 0,
          xiu: LunarMansionsName.角,
          xiu_degree: 0,
          lunar_mansions_dong_wei_time: [],
        },
        native_transformed_stars: [],
        process_transformed_stars: [],
      };

      service.qizheng(mockData).subscribe((horoscope) => {
        expect(horoscope).toEqual(mockHoroscope);
      });

      const req = httpMock.expectOne(
        `${environment.base_url}/api/qizheng/horo`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockHoroscope);
    });
  });

  describe('updateUser', () => {
    it('should update user', () => {
      const mockUser: UpdateUserRequest = {
        password: 'newpassword',
        old_password: 'oldpassword',
      };

      service.updateUser(mockUser).subscribe(() => {
        // The service method returns Observable<void>, so we just verify it completes successfully
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.admin_url}/user`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUser);
      req.flush({});
    });
  });

  describe('getNatives', () => {
    it('should return a page of horoscope records', () => {
      const mockPage = 1;
      const mockSize = 10;
      const mockResponse: PageResponser<Array<HoroscopeRecord>> = {
        data: [],
        total: 0,
      };

      service.getNatives(mockPage, mockSize).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.admin_url}/horoscopes?page=${mockPage}&size=${mockSize}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getNativeById', () => {
    it('should return a horoscope record by id', () => {
      const mockId = 1;
      const mockRecord: HoroscopeRecord = {
        id: mockId,
        name: 'Test',
        gender: true,
        birth_year: 1990,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 12,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        location: {
          id: 1,
          name: 'Beijing',
          is_east: true,
          longitude_degree: 116,
          longitude_minute: 24,
          longitude_second: 26,
          is_north: true,
          latitude_degree: 39,
          latitude_minute: 54,
          latitude_second: 15,
        },
        description: 'Test description',
        created_at: '2020-01-01T00:00:00Z',
        updated_at: null,
      };

      service.getNativeById(mockId).subscribe((record) => {
        expect(record).toEqual(mockRecord);
      });

      const req = httpMock.expectOne(
        `${environment.admin_url}/horoscopes/${mockId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockRecord);
    });
  });

  describe('addNative', () => {
    it('should add a new horoscope record', () => {
      const mockRecordRequest: HoroscopeRecordRequest = {
        name: 'Test',
        gender: true,
        birth_year: 1990,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 12,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        location: {
          name: 'Beijing',
          is_east: true,
          longitude_degree: 116,
          longitude_minute: 24,
          longitude_second: 26,
          is_north: true,
          latitude_degree: 39,
          latitude_minute: 54,
          latitude_second: 15,
        },
        description: 'Test description',
      };

      const mockRecord: HoroscopeRecord = {
        id: 1,
        name: 'Test',
        gender: true,
        birth_year: 1990,
        birth_month: 1,
        birth_day: 1,
        birth_hour: 12,
        birth_minute: 0,
        birth_second: 0,
        time_zone_offset: 8,
        is_dst: false,
        location: {
          id: 1,
          name: 'Beijing',
          is_east: true,
          longitude_degree: 116,
          longitude_minute: 24,
          longitude_second: 26,
          is_north: true,
          latitude_degree: 39,
          latitude_minute: 54,
          latitude_second: 15,
        },
        description: 'Test description',
        created_at: '2020-01-01T00:00:00Z',
        updated_at: null,
      };

      service.addNative(mockRecordRequest).subscribe((record) => {
        expect(record).toEqual(mockRecord);
      });

      const req = httpMock.expectOne(`${environment.admin_url}/horoscopes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRecordRequest);
      req.flush(mockRecord);
    });
  });

  describe('updateNative', () => {
    it('should update a horoscope record', () => {
      const mockId = 1;
      const mockRecordRequest: UpdateHoroscopeRecordRequest = {
        name: 'Updated Test',
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
        description: null,
      };

      service.updateNative(mockId, mockRecordRequest).subscribe(() => {
        // The service method returns Observable<void>, so we just verify it completes successfully
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(
        `${environment.admin_url}/horoscopes/${mockId}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockRecordRequest);
      req.flush({});
    });
  });

  describe('deleteNative', () => {
    it('should delete a horoscope record', () => {
      const mockId = 1;

      service.deleteNative(mockId).subscribe(() => {
        // The service method returns Observable<void>, so we just verify it completes successfully
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(
        `${environment.admin_url}/horoscopes/${mockId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getLongLat', () => {
    it('should return longitude and latitude for a location', () => {
      const mockName = 'Beijing';
      const mockResponse: LongLatResponse[] = [
        {
          name: 'Beijing',
          longitude: '116.4074',
          latitude: '39.9042',
        },
      ];

      service.getLongLat(mockName).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.admin_url}/location_search?q=${mockName}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
