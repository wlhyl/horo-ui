import { Injectable } from '@angular/core';
import { ProcessName } from 'src/app/process/enum/process';
import { DirectionMethod } from 'src/app/process/enum/direction-method';
import { ArcToDateMethod } from 'src/app/process/enum/arc-to-date-method';
import { ProfectionArcToDateMethod } from 'src/app/process/enum/profection-arc-to-date-method';
import { DeepReadonly } from 'src/app/type/interface/deep-readonly';
import {
  HoroRequest,
  ProcessRequest,
} from 'src/app/type/interface/request-data';
import {
  HistoricalHouseCusp,
  HistoricalPlanetPosition,
} from 'src/app/type/interface/horo-admin/historical-horoscope';
import { PlanetName } from 'src/app/type/enum/planet';
import { deepFreeze } from 'src/app/utils/deep-freeze/deep-freeze';

export interface HistoricalStorageData {
  name: string;
  description: string;
  house_system: string;
  house_cusps: HistoricalHouseCusp[];
  planet_positions: HistoricalPlanetPosition[];
}

@Injectable({
  providedIn: 'root',
})
export class HoroStorageService {
  private _horoData!: HoroRequest;
  private _processData!: ProcessRequest;
  private _synastryData!: HoroRequest;
  private _eventData!: HoroRequest;
  private _isNanLuoBeiJi!: boolean;
  private _historicalData!: HistoricalStorageData;

  constructor() {
    this._initProcessData();
    this._initHoroData();
    this._initSynastryData();
    this._initEventData();
    this._initIsNanLuoBeiJi();
    this._initHistoricalData();
  }

  public get horoData(): DeepReadonly<HoroRequest> {
    return this._horoData;
  }

  public set horoData(data: HoroRequest) {
    this._horoData = deepFreeze(data);
    localStorage.setItem('horo_data', JSON.stringify(data));
  }

  public get processData(): DeepReadonly<ProcessRequest> {
    return this._processData;
  }

  public set processData(data: ProcessRequest) {
    this._processData = deepFreeze(data);
    localStorage.setItem('process_data', JSON.stringify(data));
  }

  public get synastryData(): DeepReadonly<HoroRequest> {
    return this._synastryData;
  }

  public set synastryData(data: HoroRequest) {
    this._synastryData = deepFreeze(data);
    localStorage.setItem('synastry_data', JSON.stringify(data));
  }

  public get eventData(): DeepReadonly<HoroRequest> {
    return this._eventData;
  }

  public set eventData(data: HoroRequest) {
    this._eventData = deepFreeze(data);
    localStorage.setItem('event_data', JSON.stringify(data));
  }

  public get isNanLuoBeiJi(): boolean {
    return this._isNanLuoBeiJi;
  }

  public set isNanLuoBeiJi(value: boolean) {
    this._isNanLuoBeiJi = value;
    localStorage.setItem('node_name_option', JSON.stringify(value));
  }

  public get historicalData(): DeepReadonly<HistoricalStorageData> {
    return this._historicalData;
  }

  public set historicalData(data: HistoricalStorageData) {
    this._historicalData = deepFreeze(data);
    localStorage.setItem('historical_data', JSON.stringify(data));
  }

  public clean() {
    localStorage.removeItem('horo_data');
    localStorage.removeItem('process_data');
    localStorage.removeItem('synastry_data');
    localStorage.removeItem('event_data');
    localStorage.removeItem('node_name_option');
    localStorage.removeItem('historical_data');
    this._initHoroData();
    this._initProcessData();
    this._initSynastryData();
    this._initEventData();
    this._initIsNanLuoBeiJi();
    this._initHistoricalData();
  }

  private _initProcessData() {
    let processData = this._getParsedItem<ProcessRequest>('process_data');
    if (processData) {
      this._processData = deepFreeze(processData);
    } else {
      let t = this.nowDate();

      this._processData = deepFreeze({
        date: {
          year: t.year,
          month: t.month,
          day: t.day,
          hour: t.hour,
          minute: t.minute,
          second: t.second,
          tz: t.tz,
          st: t.st,
        },
        geo_name: '北京',
        geo: {
          long: 116 + 25 / 60.0,
          lat: 39 + 54 / 60.0,
        },
        process_name: ProcessName.Profection,
        isSolarReturn: false,
        direction_method: DirectionMethod.SemiArc,
        arc_to_date_method: ArcToDateMethod.DegreePerYear,
        profection_arc_to_date_method: ProfectionArcToDateMethod.TrueSolarArc,
      });
    }
  }

  private _initHoroData() {
    let horoData = this._getParsedItem<HoroRequest>('horo_data');
    if (horoData) {
      this._horoData = deepFreeze(horoData);
    } else {
      let t = this.nowDate();
      horoData = {
        id: 0,
        date: {
          year: t.year,
          month: t.month,
          day: t.day,
          hour: t.hour,
          minute: t.minute,
          second: t.second,
          tz: t.tz,
          st: t.st,
        },
        geo_name: '北京',
        geo: {
          long: 116 + 25 / 60.0,
          lat: 39 + 54 / 60.0,
        },
        house: 'Regiomontanus',
        sex: true,
        name: '',
      };
      this._horoData = deepFreeze(horoData);
    }
  }

  private _initSynastryData() {
    let synastryData = this._getParsedItem<HoroRequest>('synastry_data');
    if (synastryData) {
      this._synastryData = deepFreeze(synastryData);
    } else {
      let t = this.nowDate();
      synastryData = {
        id: 0,
        date: {
          year: t.year,
          month: t.month,
          day: t.day,
          hour: t.hour,
          minute: t.minute,
          second: t.second,
          tz: t.tz,
          st: t.st,
        },
        geo_name: '北京',
        geo: {
          long: 116 + 25 / 60.0,
          lat: 39 + 54 / 60.0,
        },
        house: 'Regiomontanus',
        sex: true,
        name: '',
      };
      this._synastryData = deepFreeze(synastryData);
    }
  }

  private _initEventData() {
    let eventData = this._getParsedItem<HoroRequest>('event_data');
    if (eventData) {
      this._eventData = deepFreeze(eventData);
    } else {
      let t = this.nowDate();
      eventData = {
        id: 0,
        date: {
          year: t.year,
          month: t.month,
          day: t.day,
          hour: t.hour,
          minute: t.minute,
          second: t.second,
          tz: t.tz,
          st: t.st,
        },
        geo_name: '北京',
        geo: {
          long: 116 + 25 / 60.0,
          lat: 39 + 54 / 60.0,
        },
        house: 'Regiomontanus',
        sex: true,
        name: '',
      };
      this._eventData = deepFreeze(eventData);
    }
  }

  private nowDate() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      tz: now.getTimezoneOffset() / -60,
      st: false,
    };
  }

  private _getParsedItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  private _initIsNanLuoBeiJi() {
    this._isNanLuoBeiJi =
      this._getParsedItem<boolean>('node_name_option') ?? true;
  }

  private _initHistoricalData() {
    let historicalData =
      this._getParsedItem<HistoricalStorageData>('historical_data');
    if (historicalData) {
      this._historicalData = deepFreeze(historicalData);
    } else {
      // 默认等宫制宫头（白羊座0度开始，每30度一宫）
      const defaultCusps: HistoricalHouseCusp[] = Array.from(
        { length: 12 },
        (_, i) => ({
          house_number: i + 1,
          longitude_degree: i * 30,
          longitude_minute: 0,
          longitude_second: 0,
        }),
      );

      // 默认七颗古典行星
      const defaultPlanets: HistoricalPlanetPosition[] = [
        {
          planet_name: PlanetName.Sun,
          longitude_degree: 0,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
        {
          planet_name: PlanetName.Moon,
          longitude_degree: 30,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
        {
          planet_name: PlanetName.Mercury,
          longitude_degree: 60,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
        {
          planet_name: PlanetName.Venus,
          longitude_degree: 90,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
        {
          planet_name: PlanetName.Mars,
          longitude_degree: 120,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
        {
          planet_name: PlanetName.Jupiter,
          longitude_degree: 150,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
        {
          planet_name: PlanetName.Saturn,
          longitude_degree: 180,
          longitude_minute: 0,
          longitude_second: 0,
          latitude_degree: 0,
          latitude_minute: 0,
          latitude_second: 0,
          latitude_north: true,
        },
      ];

      this._historicalData = deepFreeze({
        name: '',
        description: '',
        house_system: '未知',
        house_cusps: defaultCusps,
        planet_positions: defaultPlanets,
      });
    }
  }
}
