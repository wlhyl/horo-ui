import { LocationRecord, LocationRecordRequest } from './location-record';

/**
 * 后台对应的结构体是：Horoscope
 */
export interface HoroscopeRecord {
  id: number;
  name: string;
  gender: boolean;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  birth_second: number;
  time_zone_offset: number;
  is_dst: boolean;

  location: LocationRecord;

  description: string;

  created_at: string;
  updated_at: string | null;
  lock: boolean;
}

/**
 * 后台对应的结构体是：HoroscopeRequest
 */
export interface HoroscopeRecordRequest {
  // 姓名
  name: string;
  // 性别
  gender: boolean;
  // 年，最小值1900
  birth_year: number;
  // 月
  birth_month: number;
  // 日
  birth_day: number;
  // 时
  birth_hour: number;
  // 分
  birth_minute: number;
  // 秒
  birth_second: number;
  // 出生地时区，东区为正数，西区为负数
  time_zone_offset: number;
  // 出生时的夏令时，有夏令时：true，无夏令时： false
  is_dst: boolean;

  location: LocationRecordRequest;

  // 说明文字
  description: string;
  // 是否锁定
  lock: boolean;
}

/**
 * 后台对应的结构体是：UpdateHoroscopeRequest
 */
export interface UpdateHoroscopeRecordRequest {
  // 姓名，长度1-30个字符
  name: string | null;
  // 性别
  gender: boolean | null;
  // 年，最小值1900
  birth_year: number | null;
  // 月，1-12
  birth_month: number | null;
  // 日，1-31
  birth_day: number | null;
  // 时，0-23
  birth_hour: number | null;
  // 分，0-59
  birth_minute: number | null;
  // 秒，0-59
  birth_second: number | null;
  // 出生地时区，东区为正数，西区为负数，范围-12到+12
  time_zone_offset: number | null;
  // 出生时的夏令时，有夏令时：true，无夏令时：false
  is_dst: boolean | null;
  // 地理位置信息
  location: LocationRecordRequest | null;
  // 说明文字
  description: string | null;
  // 是否锁定
  lock: boolean | null;
}

/**
 * 后台对应的结构体是：SearchHoroscopeRequest
 */
export interface SearchHoroscopeRecordRequest {
  // 分页参数
  page: number;
  size: number;
  // 姓名（模糊搜索）
  name?: string;
  // 年（精确搜索）
  year?: number;
  // 月（精确搜索）
  month?: number;
  // 日（精确搜索）
  day?: number;
  // 时（用于时间搜索）
  hour?: number;
  // 分（用于时间搜索）
  minute?: number;
  // 秒（用于时间搜索）
  second?: number;
}
