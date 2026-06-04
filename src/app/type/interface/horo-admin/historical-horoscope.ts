import { PlanetName } from '../../enum/planet';
import { LocationRecord } from './location-record';

/**
 * 古代星盘宫头
 * 后台对应结构体：HouseCusp
 */
export interface HistoricalHouseCusp {
  house_number: number; // 1-12
  longitude_degree: number; // 0-359
  longitude_minute: number; // 0-59
  longitude_second: number; // 0-59
}

/**
 * 古代星盘行星位置
 * 后台对应结构体：PlanetPosition
 */
export interface HistoricalPlanetPosition {
  planet_name: PlanetName;
  longitude_degree: number; // 0-359
  longitude_minute: number; // 0-59
  longitude_second: number; // 0-59
  latitude_degree: number; // 0-90
  latitude_minute: number; // 0-59
  latitude_second: number; // 0-59
  latitude_north: boolean;
}

/**
 * 古代星盘记录
 * 后台对应结构体：HistoricalHoroscope
 */
export interface HistoricalHoroscopeRecord {
  id: number;
  name: string;
  description: string;
  gender: boolean | null;
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  second: number | null;
  is_julian: boolean | null;
  location: LocationRecord | null;
  time_zone_offset: number | null;
  is_dst: boolean | null;
  house_system: string | null;
  house_cusps: HistoricalHouseCusp[];
  planet_positions: HistoricalPlanetPosition[];
  created_at: string;
  updated_at: string | null;
  lock: boolean;
  user_id: number;
}
