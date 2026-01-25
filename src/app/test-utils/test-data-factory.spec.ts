import {
  HoroRequest,
  DateRequest,
  GeoRequest,
  ProcessRequest,
  ProfectionRequest,
  HoroscopeComparisonRequest,
  ReturnRequest,
  FirdariaRequest,
  QiZhengRequst,
} from '../type/interface/request-data';
import {
  Horoscope,
  Planet,
  Aspect,
  FixedStar,
  HoroDateTime,
  GeoPosition,
  HoroscopeComparison,
  ReturnHoroscope,
} from '../type/interface/response-data';
import {
  HoroscopeRecord,
} from '../type/interface/horo-admin/horoscope-record';
import { LocationRecord } from '../type/interface/horo-admin/location-record';
import { PlanetName, PlanetSpeedState } from '../type/enum/planet';
import { FixedStarName } from '../type/enum/fixed-star';
import { LunarMansionsName } from '../type/enum/qizheng';
import { ProcessName } from '../process/enum/process';

/**
 * 测试数据工厂类
 *
 * 用于创建各种 interface 的默认 mock 对象。当 interface 添加新字段时，
 * 只需在这里添加默认值，所有引用该工厂的测试都会自动适应。
 *
 * 使用方式：
 * ```
 * // 创建包含所有默认值的 mock 对象
 * const mockData = createMockHoroRequest();
 *
 * // 覆盖部分字段
 * const customData = createMockHoroRequest({
 *   name: 'Custom Name',
 *   id: 123,
 * });
 * ```
 */
export class TestDataFactory {
  /**
   * 创建默认的 DateRequest 对象
   */
  static createDefaultDateRequest(
    overrides?: Partial<DateRequest>
  ): DateRequest {
    return {
      year: 2000,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      tz: 8,
      st: false,
      ...overrides,
    };
  }

  /**
   * 创建默认的 GeoRequest 对象
   */
  static createDefaultGeoRequest(overrides?: Partial<GeoRequest>): GeoRequest {
    return {
      long: 120,
      lat: 30,
      ...overrides,
    };
  }

  /**
   * 创建默认的 HoroRequest 对象
   * 这是最常用的测试数据
   */
  static createDefaultHoroRequest(
    overrides?: Partial<HoroRequest>
  ): HoroRequest {
    return {
      id: 0,
      date: this.createDefaultDateRequest(overrides?.date),
      geo: this.createDefaultGeoRequest(overrides?.geo),
      name: 'name',
      sex: true,
      geo_name: 'cty',
      house: 'Alcabitus',
      ...overrides,
    };
  }

  /**
   * 创建默认的 ProcessRequest 对象
   */
  static createDefaultProcessRequest(
    overrides?: Partial<ProcessRequest>
  ): ProcessRequest {
    return {
      date: this.createDefaultDateRequest(overrides?.date),
      geo_name: 'cty',
      geo: this.createDefaultGeoRequest(overrides?.geo),
      process_name: ProcessName.Transit,
      isSolarReturn: false,
      ...overrides,
    };
  }

  /**
   * 创建默认的 ProfectionRequest 对象
   */
  static createDefaultProfectionRequest(
    overrides?: Partial<ProfectionRequest>
  ): ProfectionRequest {
    return {
      native_date: this.createDefaultDateRequest(overrides?.native_date),
      process_date: this.createDefaultDateRequest({
        year: 2020,
        ...overrides?.process_date,
      }),
      ...overrides,
    };
  }

  /**
   * 创建默认的 HoroscopeComparisonRequest 对象
   */
  static createDefaultHoroscopeComparisonRequest(
    overrides?: Partial<HoroscopeComparisonRequest>
  ): HoroscopeComparisonRequest {
    return {
      original_date: this.createDefaultDateRequest(overrides?.original_date),
      comparison_date: this.createDefaultDateRequest({
        year: 2020,
        ...overrides?.comparison_date,
      }),
      original_geo: this.createDefaultGeoRequest(overrides?.original_geo),
      comparison_geo: this.createDefaultGeoRequest(overrides?.comparison_geo),
      house: 'Alcabitus',
      ...overrides,
    };
  }

  /**
   * 创建默认的 ReturnRequest 对象
   */
  static createDefaultReturnRequest(
    overrides?: Partial<ReturnRequest>
  ): ReturnRequest {
    return {
      native_date: this.createDefaultDateRequest(overrides?.native_date),
      process_date: this.createDefaultDateRequest({
        year: 2020,
        ...overrides?.process_date,
      }),
      geo: this.createDefaultGeoRequest(overrides?.geo),
      house: 'Alcabitus',
      ...overrides,
    };
  }

  /**
   * 创建默认的 FirdariaRequest 对象
   */
  static createDefaultFirdariaRequest(
    overrides?: Partial<FirdariaRequest>
  ): FirdariaRequest {
    return {
      native_date: this.createDefaultDateRequest(overrides?.native_date),
      geo: this.createDefaultGeoRequest(overrides?.geo),
      ...overrides,
    };
  }

  /**
   * 创建默认的 QiZhengRequst 对象
   */
  static createDefaultQiZhengRequest(
    overrides?: Partial<QiZhengRequst>
  ): QiZhengRequst {
    return {
      native_date: this.createDefaultDateRequest(overrides?.native_date),
      geo: this.createDefaultGeoRequest(overrides?.geo),
      process_date: this.createDefaultDateRequest({
        year: 2020,
        ...overrides?.process_date,
      }),
      ...overrides,
    };
  }

  /**
   * 创建默认的 HoroDateTime 对象
   */
  static createDefaultHoroDateTime(
    overrides?: Partial<HoroDateTime>
  ): HoroDateTime {
    return {
      year: 2024,
      month: 8,
      day: 6,
      hour: 12,
      minute: 0,
      second: 0,
      tz: 8,
      ...overrides,
    };
  }

  /**
   * 创建默认的 GeoPosition 对象
   */
  static createDefaultGeoPosition(
    overrides?: Partial<GeoPosition>
  ): GeoPosition {
    return {
      long: 120,
      lat: 30,
      ...overrides,
    };
  }

  /**
   * 创建默认的 Planet 对象
   */
  static createDefaultPlanet(overrides?: Partial<Planet>): Planet {
    return {
      name: PlanetName.Sun,
      long: 120,
      lat: 0,
      speed: 1,
      ra: 0,
      dec: 0,
      orb: 0,
      speed_state: PlanetSpeedState.均,
      ...overrides,
    };
  }

  /**
   * 创建默认的 Aspect 对象
   */
  static createDefaultAspect(overrides?: Partial<Aspect>): Aspect {
    return {
      aspect_value: 0,
      apply: false,
      d: 0,
      p0: PlanetName.Sun,
      p1: PlanetName.Moon,
      ...overrides,
    };
  }

  /**
   * 创建默认的 FixedStar 对象
   */
  static createDefaultFixedStar(overrides?: Partial<FixedStar>): FixedStar {
    return {
      fixed_star: FixedStarName.角宿一,
      long: 0,
      xiu: LunarMansionsName.角,
      xiu_degree: 0,
      desc: '',
      ...overrides,
    };
  }

  /**
   * 创建默认的 Horoscope 对象
   */
  static createDefaultHoroscope(
    overrides?: Partial<Horoscope>
  ): Horoscope {
    return {
      date: this.createDefaultHoroDateTime(overrides?.date),
      geo: this.createDefaultGeoPosition(overrides?.geo),
      house_name: 'Placidus',
      houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      asc: this.createDefaultPlanet({ ...overrides?.asc, name: PlanetName.ASC }),
      mc: this.createDefaultPlanet({ ...overrides?.mc, name: PlanetName.MC }),
      dsc: this.createDefaultPlanet({ ...overrides?.dsc, name: PlanetName.DSC }),
      ic: this.createDefaultPlanet({ ...overrides?.ic, name: PlanetName.IC }),
      part_of_fortune: this.createDefaultPlanet({
        ...overrides?.part_of_fortune,
        name: PlanetName.PartOfFortune,
      }),
      planets: [this.createDefaultPlanet(overrides?.planets?.[0])],
      is_diurnal: true,
      planetary_day: PlanetName.Sun,
      planetary_hours: PlanetName.Sun,
      aspects: [this.createDefaultAspect(overrides?.aspects?.[0])],
      antiscoins: [],
      contraantiscias: [],
      fixed_stars: [],
      ...overrides,
    };
  }

  /**
   * 创建默认的 HoroscopeComparison 对象
   */
  static createDefaultHoroscopeComparison(
    overrides?: Partial<HoroscopeComparison>
  ): HoroscopeComparison {
    return {
      original_date: this.createDefaultHoroDateTime(overrides?.original_date),
      comparison_date: this.createDefaultHoroDateTime(
        overrides?.comparison_date
      ),
      original_geo: this.createDefaultGeoPosition(overrides?.original_geo),
      comparison_geo: this.createDefaultGeoPosition(overrides?.comparison_geo),
      house_name: 'Placidus',
      houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      comparison_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      original_asc: this.createDefaultPlanet({
        ...overrides?.original_asc,
        name: PlanetName.ASC,
      }),
      comparison_asc: this.createDefaultPlanet({
        ...overrides?.comparison_asc,
        name: PlanetName.ASC,
      }),
      original_mc: this.createDefaultPlanet({
        ...overrides?.original_mc,
        name: PlanetName.MC,
      }),
      comparison_mc: this.createDefaultPlanet({
        ...overrides?.comparison_mc,
        name: PlanetName.MC,
      }),
      original_dsc: this.createDefaultPlanet({
        ...overrides?.original_dsc,
        name: PlanetName.DSC,
      }),
      comparison_dsc: this.createDefaultPlanet({
        ...overrides?.comparison_dsc,
        name: PlanetName.DSC,
      }),
      original_ic: this.createDefaultPlanet({
        ...overrides?.original_ic,
        name: PlanetName.IC,
      }),
      comparison_ic: this.createDefaultPlanet({
        ...overrides?.comparison_ic,
        name: PlanetName.IC,
      }),
      original_part_of_fortune: this.createDefaultPlanet({
        ...overrides?.original_part_of_fortune,
        name: PlanetName.PartOfFortune,
      }),
      comparison_part_of_fortune: this.createDefaultPlanet({
        ...overrides?.comparison_part_of_fortune,
        name: PlanetName.PartOfFortune,
      }),
      original_planets: [],
      comparison_planets: [],
      aspects: [],
      antiscoins: [],
      contraantiscias: [],
      ...overrides,
    };
  }

  /**
   * 创建默认的 ReturnHoroscope 对象
   */
  static createDefaultReturnHoroscope(
    overrides?: Partial<ReturnHoroscope>
  ): ReturnHoroscope {
    return {
      native_date: this.createDefaultHoroDateTime(overrides?.native_date),
      process_date: this.createDefaultHoroDateTime(overrides?.process_date),
      return_date: this.createDefaultHoroDateTime(overrides?.return_date),
      geo: this.createDefaultGeoPosition(overrides?.geo),
      house_name: 'Placidus',
      houses_cups: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      asc: this.createDefaultPlanet({ ...overrides?.asc, name: PlanetName.ASC }),
      mc: this.createDefaultPlanet({ ...overrides?.mc, name: PlanetName.MC }),
      dsc: this.createDefaultPlanet({ ...overrides?.dsc, name: PlanetName.DSC }),
      ic: this.createDefaultPlanet({ ...overrides?.ic, name: PlanetName.IC }),
      part_of_fortune: this.createDefaultPlanet({
        ...overrides?.part_of_fortune,
        name: PlanetName.PartOfFortune,
      }),
      planets: [],
      aspects: [],
      antiscoins: [],
      contraantiscias: [],
      ...overrides,
    };
  }

  /**
   * 创建默认的 LocationRecord 对象
   */
  static createDefaultLocationRecord(
    overrides?: Partial<LocationRecord>
  ): LocationRecord {
    return {
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
      ...overrides,
    };
  }

  /**
   * 创建默认的 HoroscopeRecord 对象
   */
  static createDefaultHoroscopeRecord(
    overrides?: Partial<HoroscopeRecord>
  ): HoroscopeRecord {
    return {
      id: 1,
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
      location: this.createDefaultLocationRecord(overrides?.location),
      description: 'Test record',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: null,
      lock: false,
      ...overrides,
    };
  }
}

/**
 * 便利函数：创建 HoroRequest
 */
export function createMockHoroRequest(
  overrides?: Partial<HoroRequest>
): HoroRequest {
  return TestDataFactory.createDefaultHoroRequest(overrides);
}

/**
 * 便利函数：创建 DateRequest
 */
export function createMockDateRequest(
  overrides?: Partial<DateRequest>
): DateRequest {
  return TestDataFactory.createDefaultDateRequest(overrides);
}

/**
 * 便利函数：创建 GeoRequest
 */
export function createMockGeoRequest(
  overrides?: Partial<GeoRequest>
): GeoRequest {
  return TestDataFactory.createDefaultGeoRequest(overrides);
}

/**
 * 便利函数：创建 ProcessRequest
 */
export function createMockProcessRequest(
  overrides?: Partial<ProcessRequest>
): ProcessRequest {
  return TestDataFactory.createDefaultProcessRequest(overrides);
}

/**
 * 便利函数：创建 ProfectionRequest
 */
export function createMockProfectionRequest(
  overrides?: Partial<ProfectionRequest>
): ProfectionRequest {
  return TestDataFactory.createDefaultProfectionRequest(overrides);
}

/**
 * 便利函数：创建 HoroscopeComparisonRequest
 */
export function createMockHoroscopeComparisonRequest(
  overrides?: Partial<HoroscopeComparisonRequest>
): HoroscopeComparisonRequest {
  return TestDataFactory.createDefaultHoroscopeComparisonRequest(overrides);
}

/**
 * 便利函数：创建 ReturnRequest
 */
export function createMockReturnRequest(
  overrides?: Partial<ReturnRequest>
): ReturnRequest {
  return TestDataFactory.createDefaultReturnRequest(overrides);
}

/**
 * 便利函数：创建 FirdariaRequest
 */
export function createMockFirdariaRequest(
  overrides?: Partial<FirdariaRequest>
): FirdariaRequest {
  return TestDataFactory.createDefaultFirdariaRequest(overrides);
}

/**
 * 便利函数：创建 QiZhengRequst
 */
export function createMockQiZhengRequest(
  overrides?: Partial<QiZhengRequst>
): QiZhengRequst {
  return TestDataFactory.createDefaultQiZhengRequest(overrides);
}

/**
 * 便利函数：创建 HoroDateTime
 */
export function createMockHoroDateTime(
  overrides?: Partial<HoroDateTime>
): HoroDateTime {
  return TestDataFactory.createDefaultHoroDateTime(overrides);
}

/**
 * 便利函数：创建 GeoPosition
 */
export function createMockGeoPosition(
  overrides?: Partial<GeoPosition>
): GeoPosition {
  return TestDataFactory.createDefaultGeoPosition(overrides);
}

/**
 * 便利函数：创建 Planet
 */
export function createMockPlanet(overrides?: Partial<Planet>): Planet {
  return TestDataFactory.createDefaultPlanet(overrides);
}

/**
 * 便利函数：创建 Aspect
 */
export function createMockAspect(overrides?: Partial<Aspect>): Aspect {
  return TestDataFactory.createDefaultAspect(overrides);
}

/**
 * 便利函数：创建 FixedStar
 */
export function createMockFixedStar(overrides?: Partial<FixedStar>): FixedStar {
  return TestDataFactory.createDefaultFixedStar(overrides);
}

/**
 * 便利函数：创建 Horoscope
 */
export function createMockHoroscope(
  overrides?: Partial<Horoscope>
): Horoscope {
  return TestDataFactory.createDefaultHoroscope(overrides);
}

/**
 * 便利函数：创建 HoroscopeComparison
 */
export function createMockHoroscopeComparison(
  overrides?: Partial<HoroscopeComparison>
): HoroscopeComparison {
  return TestDataFactory.createDefaultHoroscopeComparison(overrides);
}

/**
 * 便利函数：创建 ReturnHoroscope
 */
export function createMockReturnHoroscope(
  overrides?: Partial<ReturnHoroscope>
): ReturnHoroscope {
  return TestDataFactory.createDefaultReturnHoroscope(overrides);
}

/**
 * 便利函数：创建 LocationRecord
 */
export function createMockLocationRecord(
  overrides?: Partial<LocationRecord>
): LocationRecord {
  return TestDataFactory.createDefaultLocationRecord(overrides);
}

/**
 * 便利函数：创建 HoroscopeRecord
 */
export function createMockHoroscopeRecord(
  overrides?: Partial<HoroscopeRecord>
): HoroscopeRecord {
  return TestDataFactory.createDefaultHoroscopeRecord(overrides);
}
