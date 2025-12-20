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
