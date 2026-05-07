import { ProcessName } from '../../process/enum/process';
import { DirectionMethod } from '../../process/enum/direction-method';

export interface DateRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  tz: number;
  st: boolean;
}

export interface GeoRequest {
  long: number;
  lat: number;
}

/**
 * 本命星盘请求数据
 */
export interface HoroRequest {
  id: number; // 档案ID
  // 出生时间
  date: DateRequest;
  geo_name: string;
  geo: GeoRequest;
  house: string;
  name: string;
  sex: boolean;
}

/**
 * 推运星盘请求数据，用于推运页面数据输入
 */
export interface ProcessRequest {
  date: DateRequest;
  geo_name: string;
  geo: GeoRequest;
  process_name: ProcessName;
  isSolarReturn: boolean;
  direction_method: DirectionMethod;
}

export interface ProfectionRequest {
  native_date: DateRequest;
  process_date: DateRequest;
}

// 行运请求数据
export interface HoroscopeComparisonRequest {
  original_date: DateRequest;
  comparison_date: DateRequest;
  original_geo: GeoRequest;
  comparison_geo: GeoRequest;
  // 位系统，Alcabitus：阿卡比特
  house: string;
}

// 返照盘请求数据
export interface ReturnRequest {
  /// 出生时间
  native_date: DateRequest;
  /// 推运时间
  process_date: DateRequest;
  /// 居住地大地经纬度
  geo: GeoRequest;
  /// 宫位系统，Alcabitus：阿卡比特
  house: string;
}

/**
 * 法达
 */
export interface FirdariaRequest {
  // 出生时间
  native_date: DateRequest;

  // 出生地大地经纬度
  geo: GeoRequest;
}

/**
 * 主向推运
 */
export interface DirectionRequest {
  // 出生时间
  native_date: DateRequest;

  // 出生地大地经纬度
  geo: GeoRequest;

  // 主限法算法
  method: DirectionMethod;

  // 宫位系统
  house: string;
}

/**
 * 七政
 */
export interface QiZhengRequst {
  // 出生时间
  native_date: DateRequest;

  // 大地经纬度
  geo: GeoRequest;

  // 推运时间
  process_date: DateRequest;
}

/**
 * 象限推运请求数据
 */
export interface QuadrantProcessRequest {
  date: DateRequest;
  geo: GeoRequest;
  house: string;
}

/**
 * 象限推运黄经请求数据
 */
export type QuadrantProcessLongitudeRequest = ReturnRequest;
