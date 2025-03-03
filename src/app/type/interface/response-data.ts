import { PlanetName, PlanetSpeedState } from '../enum/planet';

export interface HoroDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  tz: number; //时区
}

export interface GeoPosition {
  long: number;
  lat: number;
}

/**
 * 本命星盘行星
 */
export interface Planet {
  // id,     七颗行星，北交，莉莉丝按瑞士星历表的行星编号。ASC: -1, MC: -2, DES: -3, IC: -4。南交点：北交点*-1
  name: PlanetName;

  // 行星的黄经
  long: number;
  //行星的黄纬
  lat: number;
  // 行星在黄道上每日的移动速度
  speed: number;
  // 行星的赤经
  ra: number;
  // 行星的赤纬
  dec: number;
  // 行星的容许度
  orb: number;
  //   星速度状态：快、平均、慢
  speed_state: PlanetSpeedState;
}

/**
 * 相位
 */
export interface Aspect {
  aspect_value: number;
  apply: boolean;
  d: number;
  p0: PlanetName;
  p1: PlanetName;
}

/**
 * 本命星盘的返回数据
 */
export interface Horoscope {
  date: HoroDateTime;
  geo: GeoPosition;
  house_name: string;

  houses_cups: Array<number>;
  asc: Planet;
  mc: Planet;
  dsc: Planet;
  ic: Planet;
  planets: Array<Planet>;
  is_diurnal: boolean;
  planetary_day: PlanetName;
  planetary_hours: PlanetName;
  aspects: Array<Aspect>;
  // 映点
  antiscoins: Array<Aspect>;
  // 反映点
  contraantiscias: Array<Aspect>;
}

export interface Profection {
  // 年小限所在宫位
  year_house: number;
  // 月小限所在宫位
  month_house: number;
  // 日小限所在宫位
  day_house: number;
  // 每宫对应的日小限开始时间
  date_per_house: Array<HoroDateTime>;
}

/**
 * 比较星盘的返回数据
 * 可用于Transit
 */
export interface HoroscopeComparison {
  // 原星盘时间
  original_date: HoroDateTime;
  // 比较盘时间
  comparison_date: HoroDateTime;

  // 原星盘的地理位置
  original_geo: GeoPosition;
  // 比较星盘的地理位置
  comparison_geo: GeoPosition;

  // 星盘的宫位
  house_name: string;
  // 12宫头黄经度数
  houses_cups: Array<number>;

  // 上升点
  original_asc: Planet;
  comparison_asc: Planet;

  // 中天
  original_mc: Planet;
  comparison_mc: Planet;

  // 下降点
  original_dsc: Planet;
  comparison_dsc: Planet;

  // 天底
  original_ic: Planet;
  comparison_ic: Planet;

  // 七颗行星
  original_planets: Array<Planet>;
  comparison_planets: Array<Planet>;

  // 行星相位，仅包含四轴、行星间的相位
  aspects: Array<Aspect>;
  // 映点
  antiscoins: Array<Aspect>;
  // 反映点
  contraantiscias: Array<Aspect>;
}

/**
 * 返照盘返回数据
 */
export interface ReturnHoroscope {
  // 原星盘的时间
  native_date: HoroDateTime;
  // 推运时间
  process_date: HoroDateTime;
  // 返照时间
  return_date: HoroDateTime;
  // 绘制星盘的地理位置
  geo: GeoPosition;
  // 星盘的宫位
  house_name: string;
  // 12宫头黄经度数
  houses_cups: Array<number>;

  // 上升点
  asc: Planet;

  // 中天
  mc: Planet;

  // 下降点
  dsc: Planet;

  // 天底
  ic: Planet;

  // 七颗行星
  planets: Array<Planet>;

  // 行星相位，仅包含四轴、行星间的相位
  aspects: Array<Aspect>;
  // 映点
  antiscoins: Array<Aspect>;
  // 反映点
  contraantiscias: Array<Aspect>;
}

/**
 * 法达主周期
 */
export interface FirdariaPeriod {
  period: PlanetName;
  sub_period: Array<FirdariaSubPeriod>;
}

/**
 * 法达子周期
 */
export interface FirdariaSubPeriod {
  period: PlanetName;
  start_date: HoroDateTime;
}
